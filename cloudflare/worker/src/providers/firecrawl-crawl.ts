import Firecrawl from "@mendable/firecrawl-js";
import type { Env } from "../worker-types";
import { ProviderFetchError } from "@/lib/crawler/provider-fetch-error";
import { withTimeout } from "../utils";
import { PROFILE_PARSE_CRAWL_TIMEOUT_MS } from "../constants";

type Input = {
  env: Env;
  url: string;
};

export async function crawlWithFirecrawl(input: Input): Promise<string> {
  const { env, url } = input;

  const firecrawl = new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });
  const result = await withTimeout(
    firecrawl.scrape(url, { formats: ["markdown"], waitFor: 3000 }),
    PROFILE_PARSE_CRAWL_TIMEOUT_MS,
    "Firecrawl scrape",
  );

  const markdown = result?.markdown ?? "";
  if (!markdown) {
    throw new ProviderFetchError({
      providerId: "firecrawl",
      kind: "transient_failure",
      message: "Firecrawl scrape returned empty markdown",
    });
  }

  return markdown;
}

