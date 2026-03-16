import { env } from "@/lib/env";

const DOMAINS_ALLOWED_TO_INDEX = ["gigscale.app"];

export const siteConfig = {
  name: "GigScale",
  description:
    "Optimize your freelancer profile for maximum visibility and conversions",
  tagline: "AI-powered freelancer profile optimization",
  domain: "gigscale.app",
  url: env.NEXT_PUBLIC_APP_URL,
  supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL,
  locale: "en_US",
  creator: "JealousGx",
  keywords: [
    "freelancer",
    "profile optimization",
    "AI",
    "gig economy",
    "Upwork",
    "Fiverr",
    "freelance",
    "profile scan",
    "AI rewrite",
    "visibility",
    "conversions",
  ],
  og: {
    image: "/og.png",
  },
} as const;

export const isAllowedToIndex = () => {
  const hostname = new URL(siteConfig.url).hostname;

  return DOMAINS_ALLOWED_TO_INDEX.includes(hostname);
};
