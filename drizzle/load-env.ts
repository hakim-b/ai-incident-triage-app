import { config } from "dotenv"

// Drizzle Kit runs outside Next.js, which is what normally loads `.env.local`.
config({ path: ".env" })
config({ path: ".env.local", override: true })
