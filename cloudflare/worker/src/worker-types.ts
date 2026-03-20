import type { CrawledProfile } from "@/lib/crawler/parse-profile";

export type Platform = "upwork" | "fiverr";

export type EnqueueMessage = {
  jobId: string;
  profileUrl: string;
  platform: Platform;
  cloudflareAllowed: boolean;
  webhookUrl: string;
};

export type CloudflareCrawlRecord = { url?: string; markdown?: string };

export type CloudflareCrawlInitResponse = {
  success?: boolean;
  result?: string;
};

export type CloudflareCrawlPollResponse = {
  success?: boolean;
  result?: {
    status?: string;
    records?: CloudflareCrawlRecord[];
  };
};

export type Env = {
  FIRECRAWL_API_KEY: string;
  GEMINI_API_KEY: string;
  CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID: string;
  CLOUDFLARE_BROWSER_RENDERING_API_TOKEN: string;
  SCAN_JOBS_WEBHOOK_SECRET: string;
  gigscale_scan_jobs: {
    send: (payload: EnqueueMessage) => Promise<void> | void;
  };
};

export type QueueBatch = { messages: Array<{ body: EnqueueMessage }> };

export type ProviderId = "cloudflare" | "firecrawl";

export type ProviderContext = {
  env: Env;
  profileUrl: string;
  cloudflareAllowed: boolean;
  platform: Platform;
};

export type Provider = {
  id: ProviderId;
  priority: number;
  enabled: (ctx: ProviderContext) => boolean;
  fetchMarkdown: (ctx: ProviderContext) => Promise<string>;
};

export type ProviderPlatformProfile = CrawledProfile;

