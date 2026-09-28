import type { DeskSponsor } from "~/lib/desk";
import { tierRoutes, type Tier } from "~/lib/triage/matrix";

import { TierMark } from "./tier-mark";

export function ContractMatrix({ sponsors }: { sponsors: DeskSponsor[] }) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Contract matrix
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sponsor name and tier come from this list. The model uses them so it
          does not guess who is title sponsor.
        </p>
      </div>

      {sponsors.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          The matrix is empty.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {sponsors.map((sponsor) => (
            <li
              key={sponsor.id}
              className="rounded-3xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{sponsor.name}</h3>
                <TierMark tier={sponsor.tier} />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {sponsor.obligation}
              </p>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-3xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium">Where it goes</h3>
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          {([1, 2, 3] as Tier[]).map((tier) => {
            const route = tierRoutes[tier];
            return (
              <li key={tier} className="flex flex-col">
                <span>
                  Tier {tier} · {route.label}
                </span>
                <span className="text-muted-foreground">{route.route}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
