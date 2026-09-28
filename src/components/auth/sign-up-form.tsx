"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type AuthState } from "~/app/auth/actions";
import { Button } from "~/components/ui/button";

const initialState: AuthState = { error: null, success: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Commercial & Sponsor
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign up to access the incident delivery desk
          </p>
        </div>

        {state.error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary"
          >
            {state.success}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              placeholder="operator@company.com"
              className="h-10 rounded-2xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={pending}
              placeholder="At least 6 characters"
              className="h-10 rounded-2xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
            />
            <span className="text-[11px] text-muted-foreground">
              Must be at least 6 characters.
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-2 w-full"
          >
            {pending ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
