import { createGoogle } from "@ai-sdk/google"

import { env } from "~/env/server"

export const google = createGoogle({
  apiKey: env.GEMINI_API_KEY,
})
