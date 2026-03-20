import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "..";
import { scanJobs } from "../schema";

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
