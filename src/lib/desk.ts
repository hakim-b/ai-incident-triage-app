import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "~/db";
import { incidents, sponsors } from "~/db/schema";

import {
  isIncidentStatus,
  isSource,
  isTier,
  sponsorSeed,
  type IncidentStatus,
  type Source,
  type SponsorLink,
  type Tier,
} from "./triage/matrix";

export type DeskSponsor = {
  id: number;
  name: string;
  tier: Tier;
  aliases: string[];
  obligation: string;
};

export type DeskIncident = {
  id: number;
  source: Source;
  rawMessage: string;
  sponsorName: string;
  sponsorLink: SponsorLink;
  contractTier: Tier | null;
  tier: Tier;
  priority: "critical" | "urgent" | "routine";
  summary: string;
  issue: string;
  action: string;
  routeTo: string;
  deadline: string;
  status: IncidentStatus;
  createdAt: Date;
};

function asSponsorLink(value: string): SponsorLink {
  if (value === "named" || value === "inferred" || value === "unknown") {
    return value;
  }
  return "unknown";
}

function asPriority(value: string): "critical" | "urgent" | "routine" {
  if (value === "critical" || value === "urgent" || value === "routine") {
    return value;
  }
  return "routine";
}

export async function ensureSponsors() {
  for (const sponsor of sponsorSeed) {
    await db
      .insert(sponsors)
      .values({
        name: sponsor.name,
        tier: sponsor.tier,
        aliases: [...sponsor.aliases],
        obligation: sponsor.obligation,
      })
      .onConflictDoUpdate({
        target: sponsors.name,
        set: {
          tier: sponsor.tier,
          aliases: [...sponsor.aliases],
          obligation: sponsor.obligation,
        },
      });
  }
}

export async function listSponsors() {
  await ensureSponsors();

  const sponsorRows = await db
    .select()
    .from(sponsors)
    .orderBy(sponsors.tier, sponsors.name);

  const deskSponsors: DeskSponsor[] = [];
  for (const row of sponsorRows) {
    if (!isTier(row.tier)) continue;
    deskSponsors.push({
      id: row.id,
      name: row.name,
      tier: row.tier,
      aliases: row.aliases,
      obligation: row.obligation,
    });
  }

  return deskSponsors;
}

export async function loadDesk() {
  await connection();
  const deskSponsors = await listSponsors();

  const incidentRows = await db
    .select()
    .from(incidents)
    .orderBy(desc(incidents.createdAt))
    .limit(40);

  const deskIncidents: DeskIncident[] = [];
  for (const row of incidentRows) {
    if (
      !isTier(row.tier) ||
      !isSource(row.source) ||
      !isIncidentStatus(row.status)
    ) {
      continue;
    }
    deskIncidents.push({
      id: row.id,
      source: row.source,
      rawMessage: row.rawMessage,
      sponsorName: row.sponsorName,
      sponsorLink: asSponsorLink(row.sponsorLink),
      contractTier:
        row.contractTier != null && isTier(row.contractTier)
          ? row.contractTier
          : null,
      tier: row.tier,
      priority: asPriority(row.priority),
      summary: row.summary,
      issue: row.issue,
      action: row.action,
      routeTo: row.routeTo,
      deadline: row.deadline,
      status: row.status,
      createdAt: row.createdAt,
    });
  }

  return { sponsors: deskSponsors, incidents: deskIncidents };
}

export async function insertIncident(values: {
  source: Source;
  rawMessage: string;
  sponsorId: number | null;
  sponsorName: string;
  sponsorLink: SponsorLink;
  contractTier: Tier | null;
  tier: Tier;
  priority: DeskIncident["priority"];
  summary: string;
  issue: string;
  action: string;
  routeTo: string;
  deadline: string;
}) {
  const [row] = await db
    .insert(incidents)
    .values({
      source: values.source,
      rawMessage: values.rawMessage,
      sponsorId: values.sponsorId,
      sponsorName: values.sponsorName,
      sponsorLink: values.sponsorLink,
      contractTier: values.contractTier,
      tier: values.tier,
      priority: values.priority,
      summary: values.summary,
      issue: values.issue,
      action: values.action,
      routeTo: values.routeTo,
      deadline: values.deadline,
    })
    .returning({ id: incidents.id });

  if (!row) {
    throw new Error("The incident was not saved.");
  }

  return row.id;
}

export async function updateIncidentStatus(id: number, status: IncidentStatus) {
  await db.update(incidents).set({ status }).where(eq(incidents.id, id));
}
