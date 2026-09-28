"use client";

import { useState } from "react";
import { useActionState } from "react";

import { triageMessage, type TriageState } from "~/app/actions";
import { Button } from "~/components/ui/button";
import {
  contractTierLabel,
  sampleMessages,
  sourceLabel,
  sources,
  sponsorLinkLabel,
  tierRoutes,
  type Source,
} from "~/lib/triage/matrix";

import { TierMark } from "./tier-mark";

const initialState: TriageState = { error: null, result: null };

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(
    triageMessage,
    initialState,
  );
  const [source, setSource] = useState<Source>("whatsapp");
  const [message, setMessage] = useState("");

  return (
    <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          New message
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste a WhatsApp, an email, or a call transcript. The desk matches the
          sponsor, then classifies the contractual stakes.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5 sm:w-48">
            <label htmlFor="source" className="text-sm font-medium">
              Source
            </label>
            <select
              id="source"
              name="source"
              value={source}
              disabled={pending}
              onChange={(event) => setSource(event.target.value as Source)}
              className="h-9 rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              {sources.map((item) => (
                <option key={item} value={item}>
                  {sourceLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            {sampleMessages.map((sample) => (
              <Button
                key={sample.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setSource(sample.source);
                  setMessage(sample.message);
                }}
              >
                {sample.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={4000}
            value={message}
            disabled={pending}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="URGENT FROM RED BULL: Our title sponsor logo is missing from the live broadcast."
            className="min-h-36 w-full resize-y rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
          />
          {message.length > 3500 ? (
            <p className="text-xs text-muted-foreground">
              {message.length} / 4,000
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={pending || message.trim().length === 0}
          >
            {pending ? "Checking the contract…" : "Classify"}
          </Button>
          {pending ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Matching the sponsor, then reading the stakes.
            </p>
          ) : null}
        </div>
      </form>

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      {!pending && state.result ? (
        <article className="mt-4 rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <TierMark tier={state.result.tier} withLabel />
            <span className="text-sm text-muted-foreground">
              {state.result.route}
            </span>
          </div>
          <h3 className="mt-3 font-heading text-base font-semibold">
            {state.result.sponsorName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {contractTierLabel(state.result.contractTier)}
            {" · "}
            {sponsorLinkLabel(state.result.sponsorLink)}
          </p>
          <p className="mt-3 text-sm leading-6">{state.result.summary}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Issue</dt>
              <dd className="mt-1">{state.result.issue}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Action</dt>
              <dd className="mt-1">{state.result.action}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Deadline</dt>
              <dd className="mt-1">{state.result.deadline}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Filed as #{state.result.id}. {tierRoutes[state.result.tier].label}{" "}
            issues go to {state.result.route}. This desk records the decision.
            It does not page the crew yet.
          </p>
        </article>
      ) : null}
    </section>
  );
}
