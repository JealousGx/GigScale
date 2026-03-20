import { parseProfileMarkdown } from "@/lib/crawler/parse-profile";
import { assessProfileQuality } from "@/lib/crawler/profile-quality";
import { ProviderFetchError } from "@/lib/crawler/provider-fetch-error";

import { analyzeWithGemini } from "../analysis/analyze-with-gemini";
import { PROFILE_MARKDOWN_PROVIDERS } from "../providers/profile-markdown-providers";
import { postWebhook } from "../webhook/post-scan-job-result";
import type { EnqueueMessage, Env, ProviderContext } from "../worker-types";

export async function handleScanJob(
  message: EnqueueMessage,
  env: Env,
): Promise<void> {
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
