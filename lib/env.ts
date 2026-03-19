import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    DATABASE_URL: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_PRO_PRODUCT_ID: z.string().min(1),
    POLAR_ENTERPRISE_PRODUCT_ID: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_SERVER: z.enum(["production", "sandbox"]).default("sandbox"),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
    R2_PUBLIC_URL: z.url(),
    FIRECRAWL_API_KEY: z.string().min(1),
    CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_BROWSER_RENDERING_API_TOKEN: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    DISCORD_BUG_REPORT_WEBHOOK_URL: z.url(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.email(),
    NEXT_PUBLIC_SALES_EMAIL: z.email(),
    NEXT_PUBLIC_FEATUREBASE_URL: z.url(),
  },

  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_SALES_EMAIL: process.env.NEXT_PUBLIC_SALES_EMAIL,
    NEXT_PUBLIC_FEATUREBASE_URL: process.env.NEXT_PUBLIC_FEATUREBASE_URL,
  },
});
