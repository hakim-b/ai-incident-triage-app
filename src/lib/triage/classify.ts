import { generateText, Output } from "ai";
import * as z from "zod";

import { google } from "~/lib/ai/google";

import {
  findSponsorByName,
  isTier,
  tierRoutes,
  type SponsorLink,
  type Tier,
} from "./matrix";

const MODEL_ID = "gemini-3.5-flash";

const classificationSchema = z.object({
  sponsorName: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  summary: z.string().min(1),
  issue: z.string().min(1),
  action: z.string().min(1),
  deadline: z.string().min(1),
});

export type SponsorContext = {
  id: number;
  name: string;
  tier: Tier;
  aliases: readonly string[];
  obligation: string;
};

export type Classification = {
  sponsorId: number | null;
  sponsorName: string;
  sponsorLink: SponsorLink;
  contractTier: Tier | null;
  tier: Tier;
  priority: (typeof tierRoutes)[Tier]["priority"];
  route: string;
  summary: string;
  issue: string;
  action: string;
  deadline: string;
};

function clip(value: string, max: number) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export async function classifyMessage(input: {
  source: string;
  message: string;
  sponsors: readonly SponsorContext[];
  namedSponsor: SponsorContext | null;
}): Promise<Classification> {
  const matrix = input.sponsors.map((sponsor) => ({
    name: sponsor.name,
    contractTier: sponsor.tier,
    aliases: sponsor.aliases,
    obligation: sponsor.obligation,
  }));

  const { output } = await generateText({
    model: google(MODEL_ID),
    instructions: [
      "You classify one incoming sponsor message for a live esports tournament delivery desk.",
      "The contract matrix is the source of truth for sponsor names, contract tiers, and obligations. Do not invent sponsors and do not change a sponsor's contract tier.",
      "The incident tier is the severity of this specific request, not the sponsor's rank.",
      "Tier 1 is a live breach of a title or presenting obligation, such as a missing broadcast logo. A calm tone can still be tier 1.",
      "Tier 2 is a missing or wrong ribbon, banner, or highlight tag that the contract requires during the show.",
      "Tier 3 covers partner requests, swag, booth changes, social credits, and anything that can wait until after the match.",
      "The word urgent is not evidence. A loud booth or swag request stays tier 3.",
      "When a sponsor was already matched from the message, treat that match as fact.",
      "When no sponsor was matched, use the matrix if the message clearly describes that sponsor's obligation. A missing title-sponsor logo belongs to the tier 1 title sponsor in the matrix. Otherwise set sponsorName to Unknown.",
      "sponsorName must be a matrix name or Unknown.",
      "summary is two sentences: what is wrong, and why it matters to the contract.",
      "issue names the asset or obligation in a short phrase.",
      "action is the concrete production step.",
      "deadline is plain language. Tier 1 is before the current round ends. Tier 2 is before the next break. Tier 3 is after the match.",
    ].join("\n"),
    prompt: [
      `Channel: ${input.source}`,
      input.namedSponsor
        ? `Sponsor matched from the message before this call: ${input.namedSponsor.name}, contract tier ${input.namedSponsor.tier}.`
        : "No sponsor name was matched in the message before this call.",
      "",
      "Contract matrix:",
      JSON.stringify(matrix, null, 2),
      "",
      "Message:",
      input.message,
    ].join("\n"),
    output: Output.object({ schema: classificationSchema }),
  });

  if (!output || !isTier(output.tier)) {
    throw new Error("The model returned no classification.");
  }

  const named = input.namedSponsor;
  const inferred = named
    ? null
    : findSponsorByName(output.sponsorName, input.sponsors);
  const sponsor = named ?? inferred;
  const route = tierRoutes[output.tier];

  return {
    sponsorId: sponsor?.id ?? null,
    sponsorName: sponsor?.name ?? "Unknown",
    sponsorLink: named ? "named" : inferred ? "inferred" : "unknown",
    contractTier: sponsor ? sponsor.tier : null,
    tier: output.tier,
    priority: route.priority,
    route: route.route,
    summary: clip(output.summary, 500),
    issue: clip(output.issue, 200),
    action: clip(output.action, 400),
    deadline: clip(output.deadline, 200),
  };
}
