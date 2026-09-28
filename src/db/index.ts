import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env/server";

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

// Transaction-mode pooling (port 6543) does not support prepared statements.
const client =
  globalForDb.pgClient ?? postgres(env.DATABASE_URL, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle({ client });
