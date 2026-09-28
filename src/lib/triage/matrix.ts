export const sources = ["whatsapp", "email", "phone"] as const;
export type Source = (typeof sources)[number];

export const tiers = [1, 2, 3] as const;
export type Tier = (typeof tiers)[number];

export const priorities = ["critical", "urgent", "routine"] as const;
export type Priority = (typeof priorities)[number];

export const sponsorLinks = ["named", "inferred", "unknown"] as const;
export type SponsorLink = (typeof sponsorLinks)[number];

export const incidentStatuses = ["open", "acknowledged", "resolved"] as const;
export type IncidentStatus = (typeof incidentStatuses)[number];

export type TierRoute = {
  tier: Tier;
  priority: Priority;
  label: string;
  route: string;
};

export const tierRoutes: Record<Tier, TierRoute> = {
  1: {
    tier: 1,
    priority: "critical",
    label: "Critical",
    route: "Master Control Switcher",
  },
  2: {
    tier: 2,
    priority: "urgent",
    label: "Urgent",
    route: "Motion Graphics Lead",
  },
  3: {
    tier: 3,
    priority: "routine",
    label: "Routine",
    route: "Post-Match Queue",
  },
};

export const sponsorSeed = [
  {
    name: "Red Bull",
    tier: 1,
    aliases: ["redbull", "red bull energy"],
    obligation:
      "Title sponsor. The logo has to stay on the live broadcast, including the opening sting and the persistent desk branding, for the whole match.",
  },
  {
    name: "Logitech G",
    tier: 2,
    aliases: ["logitech"],
    obligation:
      "Broadcast partner. Lower-third ribbons, in-arena banners, and highlight tags have to appear during featured segments.",
  },
  {
    name: "Secretlab",
    tier: 3,
    aliases: ["secret lab"],
    obligation:
      "Event partner. Booth placement, swag, and a social handle in the post-match credits. No live-broadcast logo obligation.",
  },
] as const satisfies ReadonlyArray<{
  name: string;
  tier: Tier;
  aliases: readonly string[];
  obligation: string;
}>;

export const sampleMessages: Array<{
  id: string;
  label: string;
  source: Source;
  message: string;
}> = [
  {
    id: "logo",
    label: "Missing title logo",
    source: "whatsapp",
    message:
      "URGENT FROM RED BULL: Our title sponsor logo is completely missing from the live broadcast! Fix immediately!",
  },
  {
    id: "calm",
    label: "Calm, still a breach",
    source: "email",
    message:
      "No rush at all, but our title sponsor logo isn't appearing on the broadcast.",
  },
  {
    id: "booth",
    label: "Loud, but routine",
    source: "whatsapp",
    message:
      "URGENT!!! Secretlab here — can you make our booth banner slightly larger before doors?",
  },
  {
    id: "ribbons",
    label: "Missing ribbons",
    source: "phone",
    message:
      "Call transcript: Logitech G producer says the lower-third ribbons and highlight tag dropped off during the last round. They want them back before the next map.",
  },
];

export function isTier(value: number): value is Tier {
  return value === 1 || value === 2 || value === 3;
}

export function isSource(value: string): value is Source {
  return sources.some((source) => source === value);
}

export function isIncidentStatus(value: string): value is IncidentStatus {
  return incidentStatuses.some((status) => status === value);
}

export function sourceLabel(source: Source) {
  switch (source) {
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Email";
    case "phone":
      return "Phone call";
  }
}

export function contractTierLabel(tier: Tier | null) {
  if (tier == null) return "Not in the contract matrix";
  return `Contract tier ${tier}`;
}

export function sponsorLinkLabel(link: SponsorLink) {
  switch (link) {
    case "named":
      return "Named in the message";
    case "inferred":
      return "Inferred from the contract matrix";
    case "unknown":
      return "No matching sponsor";
  }
}

export function statusLabel(status: IncidentStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "acknowledged":
      return "Acknowledged";
    case "resolved":
      return "Resolved";
  }
}

type MatchableSponsor = {
  name: string;
  aliases: readonly string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchSponsor<T extends MatchableSponsor>(
  message: string,
  sponsors: readonly T[],
) {
  const haystack = ` ${normalize(message)} `;
  let best: { sponsor: T; length: number } | null = null;

  for (const sponsor of sponsors) {
    for (const needle of [sponsor.name, ...sponsor.aliases]) {
      const normalized = normalize(needle);
      if (normalized.length < 3) continue;
      if (!haystack.includes(` ${normalized} `)) continue;
      if (!best || normalized.length > best.length) {
        best = { sponsor, length: normalized.length };
      }
    }
  }

  return best?.sponsor ?? null;
}

export function findSponsorByName<
  T extends { name: string; aliases?: readonly string[] },
>(name: string, sponsors: readonly T[]) {
  const normalized = normalize(name);
  if (!normalized || normalized === "unknown") return null;
  return (
    sponsors.find((sponsor) =>
      [sponsor.name, ...(sponsor.aliases ?? [])].some(
        (needle) => normalize(needle) === normalized,
      ),
    ) ?? null
  );
}
