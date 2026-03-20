import "server-only";

import { withTimeout } from "@/lib/utils/timeout";
import { firecrawl } from ".";

import type { ProfilePlatform } from "./profile-markdown-types";
import {
  type ProviderErrorKind,
  ProviderFetchError,
} from "./provider-fetch-error";

const CRAWL_TIMEOUT_MS = 30_000;

export async function fetchProfileMarkdownFirecrawl(input: {
  url: string;
  platform: ProfilePlatform;
}): Promise<string> {
  try {
    const result = await withTimeout(
      firecrawl.scrape(input.url, { formats: ["markdown"], waitFor: 3000 }),
      CRAWL_TIMEOUT_MS,
      "Firecrawl profile crawl",
    );

    const markdown = result.markdown ?? "";
    if (!markdown) {
      throw new ProviderFetchError({
        providerId: "firecrawl",
        kind: mapFirecrawlKind("empty_markdown"),
        message: "Failed to crawl profile: no content returned",
      });
    }

    return markdown;
  } catch (error) {
    if (error instanceof ProviderFetchError) throw error;

    const message =
      error instanceof Error ? error.message : "Firecrawl scrape failed";
    throw new ProviderFetchError({
      providerId: "firecrawl",
      kind: "transient_failure",
      message,
      cause: error,
    });
  }
}

function mapFirecrawlKind(_reason: string): ProviderErrorKind {
  return "transient_failure";
}
