import "server-only";

import { and, desc, eq, lt, ne, or } from "drizzle-orm";
import { getDb } from "..";
import { analyses, profiles } from "../schema";

export async function insertAnalysis(data: {
  profileId: string;
  profileScore: string;
  visibilityScore: string;
  conversionScore: string;
  trustScore: string;
  completenessScore: string;
  summary?: string;
  analysisEvidenceContext?: string | null;
  analysisEvidenceType?: string | null;
}) {
  const [row] = await getDb().insert(analyses).values(data).$returningId();
  return findAnalysisById(row.id);
}

export async function findAnalysisById(id: string) {
  const rows = await getDb()
    .select()
    .from(analyses)
    .where(eq(analyses.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findLatestAnalysisByProfileId(profileId: string) {
  const rows = await getDb()
    .select()
    .from(analyses)
    .where(eq(analyses.profileId, profileId))
    .orderBy(desc(analyses.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function findLatestAnalysisByUserId(userId: string) {
  const rows = await getDb()
    .select({ analysis: analyses })
    .from(analyses)
    .innerJoin(profiles, eq(analyses.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(1);
  return rows[0]?.analysis ?? null;
}

export async function findPreviousAnalysisByProfileId(
  profileId: string,
  excludeId: string,
) {
  const rows = await getDb()
    .select()
    .from(analyses)
    .where(
      and(
        eq(analyses.profileId, profileId),
        ne(analyses.id, excludeId),
      ),
    )
    .orderBy(desc(analyses.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Finds the most recent analysis for the same user + profile URL (e.g. re-scan of same URL).
 * Used to show improvement vs. previous run when the same profile is analyzed again.
 */
export async function findPreviousAnalysisByUserAndProfileUrl(
  userId: string,
  profileUrl: string,
  excludeAnalysisId: string,
) {
  const rows = await getDb()
    .select({ analysis: analyses })
    .from(analyses)
    .innerJoin(profiles, eq(analyses.profileId, profiles.id))
    .where(
      and(
        eq(profiles.userId, userId),
        eq(profiles.profileUrl, profileUrl),
        ne(analyses.id, excludeAnalysisId),
      ),
    )
    .orderBy(desc(analyses.createdAt))
    .limit(1);
  return rows[0]?.analysis ?? null;
}

export async function findAnalysisHistoryByUserId(userId: string) {
  const rows = await getDb()
    .select({ analysis: analyses, profile: profiles })
    .from(analyses)
    .innerJoin(profiles, eq(analyses.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .orderBy(desc(analyses.createdAt));
  return rows;
}

export interface AnalysisHistoryCursor {
  createdAt: Date;
  id: string;
}

export async function findAnalysisHistoryPageByUserId(
  userId: string,
  pageSize: number,
  cursor?: AnalysisHistoryCursor,
) {
  const whereCondition = cursor
    ? and(
        eq(profiles.userId, userId),
        or(
          lt(analyses.createdAt, cursor.createdAt),
          and(eq(analyses.createdAt, cursor.createdAt), lt(analyses.id, cursor.id)),
        ),
      )
    : eq(profiles.userId, userId);

  const rows = await getDb()
    .select({ analysis: analyses, profile: profiles })
    .from(analyses)
    .innerJoin(profiles, eq(analyses.profileId, profiles.id))
    .where(whereCondition)
    .orderBy(desc(analyses.createdAt), desc(analyses.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  return {
    items,
    hasMore,
    nextCursor: hasMore
      ? ({
          createdAt: items[items.length - 1]!.analysis.createdAt,
          id: items[items.length - 1]!.analysis.id,
        } as AnalysisHistoryCursor)
      : null,
  };
}
