import type { Env } from "../worker-types";
import type {
  CloudflareCrawlInitResponse,
  CloudflareCrawlPollResponse,
} from "../worker-types";
import type { ProviderErrorKind } from "@/lib/crawler/provider-fetch-error";
import { ProviderFetchError } from "@/lib/crawler/provider-fetch-error";
import {
  CLOUDLARE_POLL_TIMEOUT_MS,
  MAX_POLL_ATTEMPTS,
  POLL_DELAY_MS,
} from "../constants";
import { withTimeout } from "../utils";
import type { ProviderContext } from "../worker-types";

type Input = {
  env: Env;
  url: string;
};

function mapCloudflareStatusToErrorKind(status: string): ProviderErrorKind {
  switch (status) {
    case "cancelled_due_to_limits":
      return "quota_exhausted";
    case "cancelled_due_to_timeout":
      return "transient_failure";
    case "errored":
      return "transient_failure";
    case "cancelled_by_user":
      return "fatal";
    default:
      return "fatal";
  }
}

async function waitForCloudflareRecords(input: {
  env: Env;
  pollEndpoint: string;
}): Promise<{ url?: string; markdown?: string }[]> {
  const { env, pollEndpoint } = input;
  const token = env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const res = await fetch(`${pollEndpoint}?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const status = res.status;
      const errorBody = await res.text().catch(() => "");

      throw new ProviderFetchError({
        providerId: "cloudflare",
        kind:
          status === 402 || status === 429
            ? "quota_exhausted"
            : "transient_failure",
        message: `Cloudflare crawl polling failed (${status}): ${errorBody}`,
      });
    }

    const data = (await res.json()) as CloudflareCrawlPollResponse;
    const status = data.result?.status;
    if (!data.success || !data.result || !status) {
      throw new ProviderFetchError({
        providerId: "cloudflare",
        kind: "transient_failure",
        message: "Cloudflare crawl polling failed (malformed response)",
      });
    }

    if (status !== "running") {
      if (status === "completed") {
        return data.result.records ?? [];
      }

      throw new ProviderFetchError({
        providerId: "cloudflare",
        kind: mapCloudflareStatusToErrorKind(status),
        message: `Cloudflare crawl ended with status: ${status}`,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
  }

  throw new ProviderFetchError({
    providerId: "cloudflare",
    kind: "transient_failure",
    message: "Cloudflare crawl did not finish within polling window",
  });
}

export async function crawlWithCloudflare(input: Input): Promise<string> {
  const { env, url } = input;

  const accountId = env.CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID;
  const token = env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN;

  const crawlEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl`;

  const initRes = await fetch(crawlEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      limit: 1,
      depth: 1,
      formats: ["markdown"],
      render: true,
      crawlPurposes: ["ai-input"],
    }),
  });

  if (!initRes.ok) {
    const status = initRes.status;
    const kind: ProviderErrorKind =
      status === 402 || status === 429
        ? "quota_exhausted"
        : "transient_failure";

    const initJsonRes = await initRes.json().catch(() => null);

    throw new ProviderFetchError({
      providerId: "cloudflare",
      kind,
      message: `Cloudflare crawl init failed (${status}): ${JSON.stringify(initJsonRes)}`,
    });
  }

  const initData = (await initRes.json()) as CloudflareCrawlInitResponse;
  if (!initData.success || !initData.result) {
    throw new ProviderFetchError({
      providerId: "cloudflare",
      kind: "transient_failure",
      message: "Cloudflare crawl init failed (missing job id)",
    });
  }

  const pollEndpoint = `${crawlEndpoint}/${initData.result}`;

  const records = await withTimeout(
    waitForCloudflareRecords({ env, pollEndpoint }),
    CLOUDLARE_POLL_TIMEOUT_MS,
    "Cloudflare crawl polling",
  );

  const exact = records.find((r) => r.url === url);
  const record = exact ?? records[0];
  const markdown = record?.markdown ?? "";

  if (!markdown) {
    throw new Error("Cloudflare crawl returned empty markdown");
  }

  return markdown;
}

