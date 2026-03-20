import type { Provider, ProviderContext } from "../worker-types";
import { crawlWithCloudflare } from "./cloudflare-crawl";
import { crawlWithFirecrawl } from "./firecrawl-crawl";

export const PROFILE_MARKDOWN_PROVIDERS: Provider[] = [
  {
    id: "cloudflare",
    priority: 10,
    enabled: (ctx: ProviderContext) => ctx.cloudflareAllowed,
    fetchMarkdown: (ctx) =>
      crawlWithCloudflare({ env: ctx.env, url: ctx.profileUrl }),
  },
  {
    id: "firecrawl",
    priority: 20,
    enabled: () => true,
    fetchMarkdown: (ctx) =>
      crawlWithFirecrawl({ env: ctx.env, url: ctx.profileUrl }),
  },
];

