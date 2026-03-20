import type { NextRequest } from "next/server";
import { z } from "zod";

import { badRequest, notFound, ok, serverError } from "@/lib/api";
import { insertAnalysis } from "@/lib/db/queries/analyses";
import { insertProfile } from "@/lib/db/queries/profiles";
import {
  completeScanJob,
  failScanJob,
  findScanJobById,
  updateScanJobRunning,
} from "@/lib/db/queries/scan-jobs";
import { env } from "@/lib/env";

const workerSecretHeader = "x-scan-jobs-secret";

const profileSchema = z.object({
  title: z.string(),
  description: z.string(),
  platform: z.enum(["upwork", "fiverr"]),
  url: z.string().url(),
  skills: z.array(z.string()),
  reviewRating: z.number(),
  reviewCount: z.number(),
  portfolioCount: z.number(),
  hourlyRate: z.string().nullable(),
  completedJobs: z.number().nullable(),
  memberSince: z.string().nullable(),
  location: z.string().nullable(),
});

const analysisSchema = z.object({
  profileScore: z.number(),
  visibilityScore: z.number(),
  conversionScore: z.number(),
  trustScore: z.number(),
  completenessScore: z.number(),
  summary: z.string().nullable(),
});

const completePayloadSchema = z
  .object({
    jobId: z.string().min(1),
    errorMessage: z.string().optional(),
    profile: profileSchema.optional(),
    analysis: analysisSchema.optional(),
  })
  .refine(
    (data) => {
      const hasError = !!data.errorMessage;
      const hasProfileAnalysis = !!data.profile && !!data.analysis;
      return hasError ? !hasProfileAnalysis : hasProfileAnalysis;
    },
    { message: "Provide either errorMessage or profile+analysis" },
  );

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  let jobIdFromParams: string | undefined;
  try {
    const resolvedParams = await params;
    jobIdFromParams = resolvedParams.jobId;

    const secret = request.headers.get(workerSecretHeader);
    if (!secret || secret !== env.SCAN_JOBS_WEBHOOK_SECRET) {
      return serverError("Unauthorized webhook");
    }

    const parsed = completePayloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Invalid webhook payload");
    }

    const jobId = resolvedParams.jobId;
    if (parsed.data.jobId !== jobId) {
      return badRequest("jobId mismatch");
    }

    const job = await findScanJobById({ jobId });
    if (!job) return notFound();

    if (job.status === "completed" && job.profileId && job.analysisId) {
      return ok({ status: "completed" });
    }

    if (parsed.data.errorMessage) {
      await failScanJob({ jobId, errorMessage: parsed.data.errorMessage });
      return ok({ status: "error" });
    }

    await updateScanJobRunning({ jobId });

    if (!parsed.data.profile || !parsed.data.analysis) {
      return badRequest("Invalid payload: missing profile or analysis");
    }

    const crawled = parsed.data.profile;
    const ai = parsed.data.analysis;

    const profile = await insertProfile({
      userId: job.userId,
      platform: job.platform,
      profileUrl: job.profileUrl,
      profileTitle: crawled.title,
      profileDescription: crawled.description,
      reviewRating: crawled.reviewRating.toFixed(2),
      reviewCount: crawled.reviewCount,
      portfolioCount: crawled.portfolioCount,
      crawlMeta: {
        skills: crawled.skills,
        hourlyRate: crawled.hourlyRate,
        completedJobs: crawled.completedJobs,
        memberSince: crawled.memberSince,
        location: crawled.location,
      },
    });

    const analysis = await insertAnalysis({
      profileId: profile.id,
      profileScore: ai.profileScore.toFixed(2),
      visibilityScore: ai.visibilityScore.toFixed(2),
      conversionScore: ai.conversionScore.toFixed(2),
      trustScore: ai.trustScore.toFixed(2),
      completenessScore: ai.completenessScore.toFixed(2),
      summary: ai.summary ?? undefined,
    });

    await completeScanJob({
      jobId,
      profileId: profile.id,
      analysisId: analysis.id,
    });

    return ok({ status: "completed" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";
    // Best effort update so UI can show something meaningful.
    if (jobIdFromParams) {
      await failScanJob({ jobId: jobIdFromParams, errorMessage: message });
    }
    return serverError("Failed to complete scan job");
  }
}
