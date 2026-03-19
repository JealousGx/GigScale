import "server-only";

import { consumeProviderDailyQuotaOrThrow } from "@/lib/db/queries/provider-daily-quota";
import { env } from "@/lib/env";
import { withTimeout } from "@/lib/utils/timeout";

import type { ProfilePlatform } from "./profile-markdown-types";

const PROVIDER_ID = "cloudflare_browser_rendering";
const LIMIT_PER_DAY = 5;

const MAX_POLL_ATTEMPTS = 30;
const POLL_DELAY_MS = 2000;

const CRAWL_POLL_TIMEOUT_MS = MAX_POLL_ATTEMPTS * POLL_DELAY_MS;

export async function fetchProfileMarkdownCloudflare(input: {
  url: string;
  platform: ProfilePlatform;
}): Promise<string> {
  // Reserve one Cloudflare “job slot” for this provider for the day.
  // If we later fail, the quota reservation still counts (since we already initiated a crawl job).
  await consumeProviderDailyQuotaOrThrow({
    provider: PROVIDER_ID,
    limitPerDay: LIMIT_PER_DAY,
  });

  const jobId = await initiateCrawl(input.url);

  const status = await withTimeout(
    waitForCrawlCompletion(jobId),
    CRAWL_POLL_TIMEOUT_MS,
    "Cloudflare crawl job",
  );

  if (status !== "completed") {
    throw new Error(
      `Failed to crawl profile with Cloudflare. Job status: ${status}`,
    );
  }

  const records = await fetchCrawlRecords(jobId);
  if (records.length === 0) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  const exact = records.find((r) => r.url === input.url);
  const record = exact ?? records[0];
  const markdown = record.markdown ?? "";

  if (!markdown) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  return markdown;
}

async function initiateCrawl(url: string): Promise<string> {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID}/browser-rendering/crawl`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      // We only need the starting profile page content.
      limit: 1,
      depth: 0,
      formats: ["markdown"],
      render: true,

      // Avoid “ai-train” rejections; we only need content as input for AI at query time.
      crawlPurposes: ["ai-input"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloudflare crawl initiation failed (${response.status})`);
  }

  const data: unknown = await response.json();
  const result = data as { success?: boolean; result?: string };

  if (!result.success || !result.result) {
    throw new Error("Cloudflare crawl initiation failed (no job id returned)");
  }

  return result.result;
}

async function waitForCrawlCompletion(jobId: string): Promise<string> {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID}/browser-rendering/crawl/${jobId}`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(`${endpoint}?limit=1`, {
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare crawl polling failed (${response.status})`);
    }

    const data: unknown = await response.json();
    const result = data as {
      success?: boolean;
      result?: {
        status?: string;
        records?: Array<{ url?: string; markdown?: string }>;
      };
    };

    if (!result.success || !result.result) {
      throw new Error("Cloudflare crawl polling failed (malformed response)");
    }

    const status = result.result.status;
    if (status !== "running") {
      if (status === "completed") return status;

      // Non-success terminal states:
      // - cancelled_due_to_timeout
      // - cancelled_due_to_limits
      // - cancelled_by_user
      // - errored
      throw new Error(`Cloudflare crawl job ended with status: ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
  }

  throw new Error(
    "Cloudflare crawl job did not complete within polling window",
  );
}

async function fetchCrawlRecords(
  jobId: string,
): Promise<Array<{ url?: string; markdown?: string }>> {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID}/browser-rendering/crawl/${jobId}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Cloudflare crawl result fetch failed (${response.status})`,
    );
  }

  const data: unknown = await response.json();
  const result = data as {
    success?: boolean;
    result?: { records?: Array<{ url?: string; markdown?: string }> };
  };

  if (!result.success || !result.result) {
    throw new Error(
      "Cloudflare crawl result fetch failed (malformed response)",
    );
  }

  return result.result.records ?? [];
}
