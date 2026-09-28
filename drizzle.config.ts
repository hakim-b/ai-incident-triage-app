import "./drizzle/load-env";

import { defineConfig } from "drizzle-kit";
import { env } from "~/env/server";

// Supabase pooler on port 6543 (transaction mode) hangs Drizzle Kit introspection.
// Port 5432 (session mode / direct) must be used for migrations and schema push.
const databaseUrl = env.DATABASE_URL.replace(":6543", ":5432");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle Kit");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  schemaFilter: ["public"],
  dbCredentials: {
    url: databaseUrl,
  },
});
