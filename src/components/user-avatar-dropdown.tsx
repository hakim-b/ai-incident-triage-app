"use client";

import { useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

import { signOutAction } from "~/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface UserAvatarDropdownProps {
  user: Pick<User, "email" | "user_metadata">;
}

export function UserAvatarDropdown({ user }: UserAvatarDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const email = user.email ?? "";
  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    "";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email
      ? email.slice(0, 2).toUpperCase()
      : "OP";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="User account menu"
          >
            <Avatar
              size="default"
              className="transition-transform group-hover:scale-105"
            >
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name || email} />}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2">
            {name && (
              <span className="text-sm font-medium text-foreground">
                {name}
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground truncate">
              {email}
            </span>
            <span className="mt-0.5 inline-block text-[10px] tracking-wide text-muted-foreground uppercase">
              Desk Operator
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await signOutAction();
              });
            }}
            className="cursor-pointer gap-2"
          >
            <LogOut className="size-4" />
            <span>{isPending ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
