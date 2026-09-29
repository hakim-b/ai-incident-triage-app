"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  insertIncident,
  insertSponsor,
  listSponsors,
  updateIncidentStatus,
} from "~/lib/desk";
import { createClient } from "~/lib/supabase/server";
import { classifyMessage } from "~/lib/triage/classify";
import {
  incidentStatuses,
  isTier,
  matchSponsor,
  sources,
  tierRoutes,
  type IncidentStatus,
  type SponsorLink,
  type Tier,
} from "~/lib/triage/matrix";

const triageInput = z.object({
  source: z.enum(sources),
  message: z.string().trim().min(1).max(4000),
});

const statusInput = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(incidentStatuses),
});

export type TriageResult = {
  id: number;
  sponsorName: string;
  sponsorLink: SponsorLink;
  contractTier: Tier | null;
  tier: Tier;
  label: string;
  priority: "critical" | "urgent" | "routine";
  route: string;
  summary: string;
  issue: string;
  action: string;
  deadline: string;
};

export type TriageState = {
  error: string | null;
  result: TriageResult | null;
};

export async function triageMessage(
  _previous: TriageState,
  formData: FormData,
): Promise<TriageState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to classify messages.",
      result: null,
    };
  }

  const parsed = triageInput.safeParse({
    source: formData.get("source"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const message = String(formData.get("message") ?? "").trim();
    return {
      error:
        message.length > 4000
          ? "That message is too long. Keep it under 4,000 characters."
          : "Paste the sponsor message, and choose where it came from.",
      result: null,
    };
  }

  try {
    const sponsors = await listSponsors(user.id);
    const named = matchSponsor(parsed.data.message, sponsors) ?? null;

    const classification = await classifyMessage({
      source: parsed.data.source,
      message: parsed.data.message,
      sponsors,
      namedSponsor: named,
    });

    const id = await insertIncident(user.id, {
      source: parsed.data.source,
      rawMessage: parsed.data.message,
      sponsorId: classification.sponsorId,
      sponsorName: classification.sponsorName,
      sponsorLink: classification.sponsorLink,
      contractTier: classification.contractTier,
      tier: classification.tier,
      priority: classification.priority,
      summary: classification.summary,
      issue: classification.issue,
      action: classification.action,
      routeTo: classification.route,
      deadline: classification.deadline,
    });

    revalidatePath("/");

    const route = tierRoutes[classification.tier];
    return {
      error: null,
      result: {
        id,
        sponsorName: classification.sponsorName,
        sponsorLink: classification.sponsorLink,
        contractTier: classification.contractTier,
        tier: classification.tier,
        label: route.label,
        priority: classification.priority,
        route: classification.route,
        summary: classification.summary,
        issue: classification.issue,
        action: classification.action,
        deadline: classification.deadline,
      },
    };
  } catch (error) {
    console.error("triage failed", error);
    return {
      error:
        "The desk couldn't classify that message. Check the connection and try again.",
      result: null,
    };
  }
}

export async function setIncidentStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const parsed = statusInput.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const status: IncidentStatus = parsed.data.status;
  await updateIncidentStatus(user.id, parsed.data.id, status);
  revalidatePath("/");
}

const sponsorInput = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Sponsor name must be at least 2 characters.")
    .max(100, "Sponsor name must be under 100 characters."),
  tier: z.coerce.number().refine(isTier, {
    message: "Tier must be 1, 2, or 3.",
  }),
  aliases: z.string().optional(),
  obligation: z
    .string()
    .trim()
    .min(5, "Obligation description must be at least 5 characters.")
    .max(1000, "Obligation description must be under 1,000 characters."),
});

export type CreateSponsorState = {
  error: string | null;
  success: boolean;
};

export async function createSponsor(
  _previous: CreateSponsorState,
  formData: FormData,
): Promise<CreateSponsorState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in to add sponsors.",
      success: false,
    };
  }

  const parsed = sponsorInput.safeParse({
    name: formData.get("name"),
    tier: formData.get("tier"),
    aliases: formData.get("aliases"),
    obligation: formData.get("obligation"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Please check the sponsor details.",
      success: false,
    };
  }

  const aliases = (parsed.data.aliases ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  try {
    await insertSponsor(user.id, {
      name: parsed.data.name,
      tier: parsed.data.tier,
      aliases,
      obligation: parsed.data.obligation,
    });

    revalidatePath("/");
    return { error: null, success: true };
  } catch (error: unknown) {
    const err = error as {
      code?: string;
      message?: string;
      cause?: { code?: string; message?: string };
    };
    const isUniqueViolation =
      err?.code === "23505" ||
      err?.cause?.code === "23505" ||
      err?.message?.includes("unique") ||
      err?.cause?.message?.includes("unique") ||
      String(error).includes("unique");

    if (isUniqueViolation) {
      return {
        error: `A sponsor named "${parsed.data.name}" already exists in the matrix.`,
        success: false,
      };
    }
    console.error("createSponsor failed", error);
    return {
      error:
        "Could not add sponsor. Please check your connection and try again.",
      success: false,
    };
  }
}
