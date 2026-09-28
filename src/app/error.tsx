"use client";

import { Button } from "~/components/ui/button";

export default function DeskError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 px-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        The desk couldn&apos;t load
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        The queue failed while loading. Nothing new was sent to the crew.
      </p>
      <div>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
