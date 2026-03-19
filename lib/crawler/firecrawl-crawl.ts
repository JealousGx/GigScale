import "server-only";

import { withTimeout } from "@/lib/utils/timeout";
import { firecrawl } from ".";

import type { ProfilePlatform } from "./profile-markdown-types";

const CRAWL_TIMEOUT_MS = 30_000;

export async function fetchProfileMarkdownFirecrawl(input: {
  url: string;
  platform: ProfilePlatform;
}): Promise<string> {
  const result = await withTimeout(
    firecrawl.scrape(input.url, { formats: ["markdown"], waitFor: 3000 }),
    CRAWL_TIMEOUT_MS,
    "Firecrawl profile crawl",
  );

  const markdown = result.markdown ?? "";
  if (!markdown) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  return markdown;
}
