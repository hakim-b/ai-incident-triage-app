"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type AuthState } from "~/app/auth/actions";
import { Button } from "~/components/ui/button";

const initialState: AuthState = { error: null, success: null };

export function LoginForm({ defaultError }: { defaultError?: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  const errorMessage = state.error || defaultError;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Commercial & Sponsor
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Delivery Desk
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in with your email and password
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {errorMessage}
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-foreground"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
              placeholder="••••••••"
              className="h-10 rounded-2xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-2 w-full"
          >
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
