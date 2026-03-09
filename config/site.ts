export const siteConfig = {
  name: "GigScale",
  description:
    "Optimize your freelancer profile for maximum visibility and conversions",
  tagline: "AI-powered freelancer profile optimization",
  domain: process.env.NEXT_PUBLIC_APP_URL,
  url: `https://${process.env.NEXT_PUBLIC_APP_URL}`,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  locale: "en_US",
  creator: "GigScale",
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
