ALTER TABLE "sponsors" DROP CONSTRAINT IF EXISTS "sponsors_name_key";--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN "user_id" uuid;--> statement-breakpoint
UPDATE "incidents" SET "user_id" = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "sponsors" SET "user_id" = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "incidents" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sponsors" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_user_id_name_key" UNIQUE("user_id","name");--> statement-breakpoint
CREATE INDEX "incidents_user_id_idx" ON "incidents" ("user_id");--> statement-breakpoint
CREATE INDEX "sponsors_user_id_idx" ON "sponsors" ("user_id");--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE;