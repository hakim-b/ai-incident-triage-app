import { cn } from "~/lib/utils";
import { tierRoutes, type Tier } from "~/lib/triage/matrix";

const tones: Record<Tier, string> = {
  1: "bg-red-500/10 text-red-800 ring-red-500/35 dark:text-red-200",
  2: "bg-amber-500/15 text-amber-900 ring-amber-500/40 dark:text-amber-200",
  3: "bg-emerald-500/10 text-emerald-900 ring-emerald-500/35 dark:text-emerald-200",
};

export function TierMark({
  tier,
  withLabel = false,
}: {
  tier: Tier;
  withLabel?: boolean;
}) {
  const route = tierRoutes[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tier],
      )}
    >
      Tier {tier}
      {withLabel ? ` · ${route.label}` : ""}
    </span>
  );
}
