import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/disclaimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/billing-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/refund-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];
}
