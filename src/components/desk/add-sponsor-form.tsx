"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { createSponsor, type CreateSponsorState } from "~/app/actions";
import { Button } from "~/components/ui/button";

const initialState: CreateSponsorState = {
  error: null,
  success: false,
};

export function AddSponsorForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createSponsor,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [state.success]);

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-3.5" />
        Add sponsor
      </Button>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4 transition-all">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">
          Add new sponsor
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={pending}
          onClick={() => setIsOpen(false)}
          aria-label="Close form"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="sponsor-name"
            className="text-xs font-medium text-foreground"
          >
            Sponsor name
          </label>
          <input
            id="sponsor-name"
            name="name"
            type="text"
            required
            maxLength={100}
            disabled={pending}
            placeholder="e.g. Monster Energy"
            className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="sponsor-tier"
            className="text-xs font-medium text-foreground"
          >
            Contract tier
          </label>
          <select
            id="sponsor-tier"
            name="tier"
            defaultValue="2"
            disabled={pending}
            className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
          >
            <option value="1">
              Tier 1 · Critical (Title / Presenting sponsor)
            </option>
            <option value="2">Tier 2 · Urgent (Broadcast partner)</option>
            <option value="3">Tier 3 · Routine (Event / Booth partner)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="sponsor-aliases"
            className="text-xs font-medium text-foreground"
          >
            Aliases / keywords
          </label>
          <input
            id="sponsor-aliases"
            name="aliases"
            type="text"
            disabled={pending}
            placeholder="e.g. monster, monster energy"
            className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
          />
          <p className="text-[11px] text-muted-foreground">
            Comma-separated terms to detect this sponsor in incoming messages.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="sponsor-obligation"
            className="text-xs font-medium text-foreground"
          >
            Contractual obligation
          </label>
          <textarea
            id="sponsor-obligation"
            name="obligation"
            required
            rows={3}
            maxLength={1000}
            disabled={pending}
            placeholder="e.g. Broadcast partner. Lower-third ribbons and replay stingers must run during all semifinal matches."
            className="w-full resize-y rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
          />
          <p className="text-[11px] text-muted-foreground">
            The AI model uses this obligation text to determine if a reported
            issue is an actual contract breach.
          </p>
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Save sponsor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
