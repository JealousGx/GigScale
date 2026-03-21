import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  authenticateRequest,
  created,
  forbidden,
  handleRouteError,
  parseBody,
  unauthorized,
} from "@/lib/api";
import {
  consumeProviderDailyQuotaOrThrow,
  ProviderDailyQuotaExceededError,
} from "@/lib/db/queries/provider-daily-quota";
import { failScanJob, insertScanJob } from "@/lib/db/queries/scan-jobs";
import { env } from "@/lib/env";
import { spendCredits } from "@/lib/services/credits";

const scanSchema = z.object({
  profileUrl: z.url("profileUrl must be a valid URL"),
  platform: z.enum(["upwork", "fiverr"], {
    message: "platform must be 'upwork' or 'fiverr'",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const parsed = await parseBody(request, scanSchema);
    if ("error" in parsed) return parsed.error;
    const { profileUrl, platform } = parsed.data;

    const credits = await spendCredits(authed.userId, "profile_scan", {
      profileUrl,
      platform,
    });
    if (!credits.success) return forbidden(credits.error);

    // Reserve Cloudflare crawl job quota (5 jobs/day) before enqueuing.
    const providerId = "cloudflare_browser_rendering";
    const CLOUDLARE_LIMIT_PER_DAY = 5;

    let cloudflareAllowed = true;
    let providerUsed: string | null = providerId;

    try {
      await consumeProviderDailyQuotaOrThrow({
        provider: providerId,
        limitPerDay: CLOUDLARE_LIMIT_PER_DAY,
      });
    } catch (error) {
      if (error instanceof ProviderDailyQuotaExceededError) {
        cloudflareAllowed = false;
        providerUsed = "firecrawl";
      } else {
        throw error;
      }
    }

    const { id: jobId } = await insertScanJob({
      userId: authed.userId,
      profileUrl,
      platform,
      providerUsed,
    });

    const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/scan-jobs/${jobId}/complete`;

    const enqueueResponse = await fetch(
      env.CLOUDFLARE_WORKER_SCAN_ENQUEUE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Gigscale-Backend/1.0", // identify the request source for better logging and debugging in Cloudflare Workers
        },
        body: JSON.stringify({
          jobId,
          profileUrl,
          platform,
          cloudflareAllowed,
          webhookUrl,
        }),
      },
    );

    console.log(`Enqueue response for job ${jobId}:`, {
      status: enqueueResponse.status,
      statusText: enqueueResponse.statusText,
    });

    if (!enqueueResponse.ok) {
      await failScanJob({
        jobId,
        errorMessage: `Failed to enqueue worker job (${enqueueResponse.status})`,
      });
      return handleRouteError(
        new Error("Worker enqueue failed"),
        "[POST /api/profiles/scan]",
      );
    }

    return created({ jobId });
  } catch (error) {
    return handleRouteError(error, "[POST /api/profiles/scan]");
  }
}
