"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { insertIncident, listSponsors, updateIncidentStatus } from "~/lib/desk";
import { classifyMessage } from "~/lib/triage/classify";
import {
  incidentStatuses,
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
    const sponsors = await listSponsors();
    const named = matchSponsor(parsed.data.message, sponsors) ?? null;

    const classification = await classifyMessage({
      source: parsed.data.source,
      message: parsed.data.message,
      sponsors,
      namedSponsor: named,
    });

    const id = await insertIncident({
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
  const parsed = statusInput.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return;
  }

  const status: IncidentStatus = parsed.data.status;
  await updateIncidentStatus(parsed.data.id, status);
  revalidatePath("/");
}
