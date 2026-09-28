import { setIncidentStatus } from "~/app/actions";
import { Button } from "~/components/ui/button";
import type { DeskIncident } from "~/lib/desk";
import {
  contractTierLabel,
  sourceLabel,
  sponsorLinkLabel,
  statusLabel,
} from "~/lib/triage/matrix";

import { TierMark } from "./tier-mark";

function formatDeskTime(date: Date) {
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(date)} UTC`;
}

export function Queue({ incidents }: { incidents: DeskIncident[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Queue
        </h2>
        <p className="text-sm text-muted-foreground">
          Newest classifications stay here until someone acknowledges or
          resolves them.
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
          No messages yet. Paste one above, or use a sample from the broadcast,
          a calm title-logo note, a loud booth request, or a missing ribbon.
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="rounded-3xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <TierMark tier={incident.tier} withLabel />
                <span className="text-sm font-medium">
                  {incident.sponsorName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {statusLabel(incident.status)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {sourceLabel(incident.source)}
                {" · "}
                <time dateTime={incident.createdAt.toISOString()}>
                  {formatDeskTime(incident.createdAt)}
                </time>
                {" · "}
                {contractTierLabel(incident.contractTier)}
                {" · "}
                {sponsorLinkLabel(incident.sponsorLink)}
              </p>
              <p className="mt-3 text-sm leading-6">{incident.summary}</p>
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Route </span>
                {incident.routeTo}
                <span className="text-muted-foreground"> · </span>
                {incident.deadline}
              </p>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  Original message
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-foreground">
                  {incident.rawMessage}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {incident.issue}. {incident.action}
                </p>
              </details>
              <form
                action={setIncidentStatus}
                className="mt-4 flex flex-wrap gap-2"
              >
                <input type="hidden" name="id" value={incident.id} />
                {incident.status === "open" ? (
                  <Button
                    type="submit"
                    name="status"
                    value="acknowledged"
                    variant="outline"
                    size="sm"
                  >
                    Acknowledge
                  </Button>
                ) : null}
                {incident.status !== "resolved" ? (
                  <Button
                    type="submit"
                    name="status"
                    value="resolved"
                    variant="secondary"
                    size="sm"
                  >
                    Resolve
                  </Button>
                ) : null}
                {incident.status !== "open" ? (
                  <Button
                    type="submit"
                    name="status"
                    value="open"
                    variant="outline"
                    size="sm"
                  >
                    Reopen
                  </Button>
                ) : null}
              </form>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
