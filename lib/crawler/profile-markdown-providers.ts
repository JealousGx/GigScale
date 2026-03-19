import { fetchProfileMarkdownCloudflare } from "./cloudflare-crawl";
import { fetchProfileMarkdownFirecrawl } from "./firecrawl-crawl";
import type { ProfileMarkdownProvider } from "./profile-markdown-types";

// Ordered provider chain.
// - Cloudflare is primary.
// - Firecrawl is only used when Cloudflare throws (including quota exhaustion).
export const PROVIDERS: ProfileMarkdownProvider[] = [
  {
    id: "cloudflare_browser_rendering",
    fetchMarkdown: fetchProfileMarkdownCloudflare,
  },
  { id: "firecrawl", fetchMarkdown: fetchProfileMarkdownFirecrawl },
];
