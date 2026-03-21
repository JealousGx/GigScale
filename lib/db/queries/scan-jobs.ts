import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "..";
import { analyses, profiles, scanJobs } from "../schema";

export async function insertScanJob(data: {
  userId: string;
  profileUrl: string;
  platform: "upwork" | "fiverr";
  providerUsed?: string | null;
}): Promise<{ id: string }> {
  const [row] = await getDb()
    .insert(scanJobs)
    .values({
      userId: data.userId,
      profileUrl: data.profileUrl,
      platform: data.platform,
      status: "queued",
      providerUsed: data.providerUsed ?? null,
    })
    .$returningId();

  return { id: row.id };
}

export async function findScanJobByIdForUser(data: {
  userId: string;
  jobId: string;
}) {
  const rows = await getDb()
    .select()
    .from(scanJobs)
    .where(and(eq(scanJobs.id, data.jobId), eq(scanJobs.userId, data.userId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findScanJobById(data: { jobId: string }) {
  const rows = await getDb()
    .select()
    .from(scanJobs)
    .where(eq(scanJobs.id, data.jobId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateScanJobRunning(data: { jobId: string }) {
  await getDb()
    .update(scanJobs)
    .set({
      status: "running",
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, data.jobId));
}

export async function completeScanJob(data: {
  jobId: string;
  profileId: string;
  analysisId: string;
}) {
  await getDb()
    .update(scanJobs)
    .set({
      status: "completed",
      profileId: data.profileId,
      analysisId: data.analysisId,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, data.jobId));
}

export async function failScanJob(data: {
  jobId: string;
  errorMessage: string;
}) {
  await getDb()
    .update(scanJobs)
    .set({
      status: "error",
      errorMessage: data.errorMessage,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scanJobs.id, data.jobId));
}

/**
 * Marks the job running, inserts profile + analysis, links them on the job — atomically.
 */
export async function runScanCompletionTransaction(params: {
  jobId: string;
  userId: string;
  platform: "upwork" | "fiverr";
  profileUrl: string;
  crawled: {
    title: string;
    description: string;
    skills: string[];
    reviewRating: number;
    reviewCount: number;
    portfolioCount: number;
    hourlyRate: string | null;
    completedJobs: number | null;
    memberSince: string | null;
    location: string | null;
  };
  analysis: {
    profileScore: number;
    visibilityScore: number;
    conversionScore: number;
    trustScore: number;
    completenessScore: number;
    summary: string | null;
    evidenceContext?: string | null;
    evidenceType?: string | null;
  };
}): Promise<void> {
  const now = new Date();
  await getDb().transaction(async (tx) => {
    await tx
      .update(scanJobs)
      .set({
        status: "running",
        startedAt: now,
        updatedAt: now,
      })
      .where(eq(scanJobs.id, params.jobId));

    const [profileRow] = await tx
      .insert(profiles)
      .values({
        userId: params.userId,
        platform: params.platform,
        profileUrl: params.profileUrl,
        profileTitle: params.crawled.title,
        profileDescription: params.crawled.description,
        reviewRating: params.crawled.reviewRating.toFixed(2),
        reviewCount: params.crawled.reviewCount,
        portfolioCount: params.crawled.portfolioCount,
        crawlMeta: {
          skills: params.crawled.skills,
          hourlyRate: params.crawled.hourlyRate,
          completedJobs: params.crawled.completedJobs,
          memberSince: params.crawled.memberSince,
          location: params.crawled.location,
        },
        lastScannedAt: now,
      })
      .$returningId();

    const [analysisRow] = await tx
      .insert(analyses)
      .values({
        profileId: profileRow.id,
        profileScore: params.analysis.profileScore.toFixed(2),
        visibilityScore: params.analysis.visibilityScore.toFixed(2),
        conversionScore: params.analysis.conversionScore.toFixed(2),
        trustScore: params.analysis.trustScore.toFixed(2),
        completenessScore: params.analysis.completenessScore.toFixed(2),
        summary: params.analysis.summary ?? undefined,
        analysisEvidenceContext: params.analysis.evidenceContext ?? null,
        analysisEvidenceType: params.analysis.evidenceType ?? null,
      })
      .$returningId();

    await tx
      .update(scanJobs)
      .set({
        status: "completed",
        profileId: profileRow.id,
        analysisId: analysisRow.id,
        finishedAt: now,
        updatedAt: now,
      })
      .where(eq(scanJobs.id, params.jobId));
  });
}
