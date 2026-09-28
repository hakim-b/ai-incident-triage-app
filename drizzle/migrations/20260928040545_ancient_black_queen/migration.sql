CREATE TABLE "incidents" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "incidents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"source" text NOT NULL,
	"raw_message" text NOT NULL,
	"sponsor_id" bigint,
	"sponsor_name" text NOT NULL,
	"sponsor_link" text NOT NULL,
	"contract_tier" smallint,
	"tier" smallint NOT NULL,
	"priority" text NOT NULL,
	"summary" text NOT NULL,
	"issue" text NOT NULL,
	"action" text NOT NULL,
	"route_to" text NOT NULL,
	"deadline" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incidents_tier_check" CHECK ("tier" between 1 and 3),
	CONSTRAINT "incidents_contract_tier_check" CHECK ("contract_tier" is null or "contract_tier" between 1 and 3),
	CONSTRAINT "incidents_message_length_check" CHECK (char_length("raw_message") between 1 and 4000),
	CONSTRAINT "incidents_source_check" CHECK ("source" in ('whatsapp', 'email', 'phone')),
	CONSTRAINT "incidents_sponsor_link_check" CHECK ("sponsor_link" in ('named', 'inferred', 'unknown')),
	CONSTRAINT "incidents_priority_check" CHECK ("priority" in ('critical', 'urgent', 'routine')),
	CONSTRAINT "incidents_status_check" CHECK ("status" in ('open', 'acknowledged', 'resolved'))
);
--> statement-breakpoint
ALTER TABLE "incidents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sponsors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL CONSTRAINT "sponsors_name_key" UNIQUE,
	"tier" smallint NOT NULL,
	"aliases" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"obligation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsors_tier_check" CHECK ("tier" between 1 and 3)
);
--> statement-breakpoint
ALTER TABLE "sponsors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "incidents_sponsor_id_idx" ON "incidents" ("sponsor_id");--> statement-breakpoint
CREATE INDEX "incidents_created_at_idx" ON "incidents" ("created_at");--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_sponsor_id_sponsors_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE SET NULL;--> statement-breakpoint
-- The app connects as the database owner, which bypasses RLS.
-- anon and authenticated get no access through the Data API.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE public.sponsors FROM anon;
    REVOKE ALL ON TABLE public.incidents FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE public.sponsors FROM authenticated;
    REVOKE ALL ON TABLE public.incidents FROM authenticated;
  END IF;
END $$;