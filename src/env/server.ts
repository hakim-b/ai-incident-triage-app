import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    SUPABASE_DB_PASSWORD: z.string().min(1),
    // Google AI Studio key. Passed into `@ai-sdk/google` explicitly because
    // that package otherwise reads `GOOGLE_GENERATIVE_AI_API_KEY`.
    GEMINI_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  emptyStringAsUndefined: true,
});
