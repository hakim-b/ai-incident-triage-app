import { ContractMatrix } from "~/components/desk/contract-matrix";
import { IntakeForm } from "~/components/desk/intake-form";
import { Queue } from "~/components/desk/queue";
import { ModeToggle } from "~/components/mode-toggle";
import { UserAvatarDropdown } from "~/components/user-avatar-dropdown";
import { loadDesk } from "~/lib/desk";
import { createClient } from "~/lib/supabase/server";

export const maxDuration = 60;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { sponsors, incidents } = await loadDesk();
  const openCount = incidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Commercial & sponsor
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Delivery Desk
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <p className="text-sm text-muted-foreground">
              {openCount} open
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              {incidents.length} filed
            </p>
            <div className="flex items-center gap-2">
              <ModeToggle />
              {user && <UserAvatarDropdown user={user} />}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-6">
        <div className="flex min-w-0 flex-col gap-6">
          <IntakeForm />
          <Queue incidents={incidents} />
        </div>
        <ContractMatrix sponsors={sponsors} />
      </div>
    </main>
  );
}
