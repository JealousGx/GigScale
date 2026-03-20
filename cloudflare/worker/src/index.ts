import { GoogleGenAI } from "@google/genai";
import Firecrawl from "@mendable/firecrawl-js";

import {
  ANALYSIS_RESPONSE_SCHEMA,
  buildAnalysisPrompt,
  type ProfileAnalysisResult,
} from "@/lib/ai/prompts/analyze-profile";
import {
  type CrawledProfile,
  parseProfileMarkdown,
} from "@/lib/crawler/parse-profile";
import { assessProfileQuality } from "@/lib/crawler/profile-quality";
import {
  type ProviderErrorKind,
  ProviderFetchError,
} from "@/lib/crawler/provider-fetch-error";

const MODEL = "gemini-3.1-flash-lite-preview";

const MAX_POLL_ATTEMPTS = 30;
const POLL_DELAY_MS = 2000;
const CLOUDLARE_POLL_TIMEOUT_MS = MAX_POLL_ATTEMPTS * POLL_DELAY_MS;
const PROFILE_PARSE_CRAWL_TIMEOUT_MS = 30_000;

type Platform = "upwork" | "fiverr";

type EnqueueMessage = {
  jobId: string;
  profileUrl: string;
  platform: Platform;
  cloudflareAllowed: boolean;
  webhookUrl: string;
};

type CloudflareCrawlRecord = { url?: string; markdown?: string };

type CloudflareCrawlInitResponse = {
  success?: boolean;
  result?: string;
};

type CloudflareCrawlPollResponse = {
  success?: boolean;
  result?: {
    status?: string;
    records?: CloudflareCrawlRecord[];
  };
};

type Env = {
  FIRECRAWL_API_KEY: string;
  GEMINI_API_KEY: string;
  CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID: string;
  CLOUDFLARE_BROWSER_RENDERING_API_TOKEN: string;
  SCAN_JOBS_WEBHOOK_SECRET: string;
  gigscale_scan_jobs: {
    send: (payload: EnqueueMessage) => Promise<void> | void;
  };
};

type QueueBatch = { messages: Array<{ body: EnqueueMessage }> };

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

type ProviderId = "cloudflare" | "firecrawl";

type ProviderContext = {
  env: Env;
  profileUrl: string;
  cloudflareAllowed: boolean;
  platform: Platform;
};

type Provider = {
  id: ProviderId;
  priority: number;
  enabled: (ctx: ProviderContext) => boolean;
  fetchMarkdown: (ctx: ProviderContext) => Promise<string>;
};

const PROFILE_MARKDOWN_PROVIDERS: Provider[] = [
  {
    id: "cloudflare",
    priority: 10,
    enabled: (ctx) => ctx.cloudflareAllowed,
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

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  operation: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out`)), ms),
    ),
  ]);
}

async function crawlWithCloudflare(input: {
  env: Env;
  url: string;
}): Promise<string> {
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

async function waitForCloudflareRecords(input: {
  env: Env;
  pollEndpoint: string;
}): Promise<CloudflareCrawlRecord[]> {
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

async function crawlWithFirecrawl(input: {
  env: Env;
  url: string;
}): Promise<string> {
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

async function analyzeWithGemini(input: {
  env: Env;
  profile: CrawledProfile;
}): Promise<{
  profileScore: number;
  visibilityScore: number;
  conversionScore: number;
  trustScore: number;
  completenessScore: number;
  summary: string | null;
}> {
  const { env, profile } = input;

  const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const prompt = buildAnalysisPrompt(profile);

  const response = await withTimeout(
    genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    }),
    20_000,
    "AI analysis",
  );

  const text = response?.text as string | undefined;
  if (!text) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(text) as ProfileAnalysisResult;

  return {
    profileScore: clampScore(Number(parsed.profileScore)),
    visibilityScore: clampScore(Number(parsed.visibilityScore)),
    conversionScore: clampScore(Number(parsed.conversionScore)),
    trustScore: clampScore(Number(parsed.trustScore)),
    completenessScore: clampScore(Number(parsed.completenessScore)),
    summary: parsed.summary ?? null,
  };
}

async function postWebhook(input: {
  webhookUrl: string;
  secret: string;
  payload: Record<string, unknown>;
  label: string;
}): Promise<void> {
  const { webhookUrl, secret, payload, label } = input;
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-scan-jobs-secret": secret,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `${label} webhook failed (${res.status})${bodyText ? `: ${bodyText}` : ""}`,
    );
  }
}

async function handleScanJob(message: EnqueueMessage, env: Env): Promise<void> {
  const { jobId, profileUrl, platform, cloudflareAllowed, webhookUrl } =
    message;
  console.log(
    `[scan:${jobId}] start platform=${platform} cloudflareAllowed=${cloudflareAllowed}`,
  );

  const ctx: ProviderContext = {
    env,
    profileUrl,
    cloudflareAllowed,
    platform,
  };

  let lastError: unknown = null;
  const providersToTry = PROFILE_MARKDOWN_PROVIDERS.filter((p) =>
    p.enabled(ctx),
  );
  console.log(
    `[scan:${jobId}] providers=${providersToTry.map((p) => p.id).join(",")}`,
  );

  for (const provider of providersToTry) {
    try {
      console.log(`[scan:${jobId}] provider=${provider.id} crawl:start`);
      const markdown = await provider.fetchMarkdown(ctx);
      console.log(
        `[scan:${jobId}] provider=${provider.id} crawl:ok markdown_chars=${markdown.length}`,
      );

      const crawledProfile = parseProfileMarkdown(
        markdown,
        profileUrl,
        platform,
      );

      const quality = assessProfileQuality(crawledProfile);
      if (!quality.isUsable) {
        throw new ProviderFetchError({
          providerId: provider.id,
          kind: "transient_failure",
          message: `Low quality extraction (score=${quality.score}, reasons=${quality.reasons.join(", ") || "none"})`,
        });
      }
      console.log(`[scan:${jobId}] provider=${provider.id} parse:ok`);

      const analysis = await analyzeWithGemini({
        env,
        profile: crawledProfile,
      });
      console.log(`[scan:${jobId}] provider=${provider.id} analysis:ok`);

      const payload = {
        jobId,
        profile: {
          title: crawledProfile.title,
          description: crawledProfile.description,
          platform: crawledProfile.platform,
          url: crawledProfile.url,
          skills: crawledProfile.skills,
          reviewRating: crawledProfile.reviewRating,
          reviewCount: crawledProfile.reviewCount,
          portfolioCount: crawledProfile.portfolioCount,
          hourlyRate: crawledProfile.hourlyRate,
          completedJobs: crawledProfile.completedJobs,
          memberSince: crawledProfile.memberSince,
          location: crawledProfile.location,
        },
        analysis,
      };

      await postWebhook({
        webhookUrl,
        secret: env.SCAN_JOBS_WEBHOOK_SECRET,
        payload,
        label: "success",
      });
      console.log(`[scan:${jobId}] webhook:success`);

      return;
    } catch (err) {
      lastError = err;
      const errorText = err instanceof Error ? err.message : String(err);
      console.error(
        `[scan:${jobId}] provider=${provider.id} failed: ${errorText}`,
      );
      if (err instanceof ProviderFetchError && err.kind === "fatal") {
        console.error(
          `[scan:${jobId}] provider=${provider.id} fatal; aborting`,
        );
        break;
      }
    }
  }

  const messageText =
    lastError instanceof Error ? lastError.message : "Unknown scan failure";

  await postWebhook({
    webhookUrl,
    secret: env.SCAN_JOBS_WEBHOOK_SECRET,
    payload: { jobId, errorMessage: messageText },
    label: "error",
  });
  console.log(`[scan:${jobId}] webhook:error-sent`);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/enqueue" && request.method === "POST") {
      const bodyUnknown = (await request.json()) as unknown;
      const body = bodyUnknown as Partial<EnqueueMessage>;

      if (
        typeof body.jobId !== "string" ||
        typeof body.profileUrl !== "string" ||
        (body.platform !== "upwork" && body.platform !== "fiverr") ||
        typeof body.webhookUrl !== "string" ||
        typeof body.cloudflareAllowed !== "boolean"
      ) {
        return Response.json(
          { error: "Invalid enqueue payload" },
          { status: 400 },
        );
      }

      await env.gigscale_scan_jobs.send({
        jobId: body.jobId,
        profileUrl: body.profileUrl,
        platform: body.platform,
        cloudflareAllowed: body.cloudflareAllowed,
        webhookUrl: body.webhookUrl,
      });

      return Response.json({ status: "enqueued" }, { status: 202 });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },

  async queue(batch: QueueBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await handleScanJob(message.body, env);
      } catch (error) {
        const errorText =
          error instanceof Error ? error.message : String(error);
        console.error("[queue] unhandled message error:", errorText);
        throw error;
      }
    }
  },
};
