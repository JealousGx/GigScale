import "server-only";

import { and, desc, eq, ne } from "drizzle-orm";
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

export async function findAnalysisHistoryByUserId(userId: string) {
  const rows = await getDb()
    .select({ analysis: analyses, profile: profiles })
    .from(analyses)
    .innerJoin(profiles, eq(analyses.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .orderBy(desc(analyses.createdAt));
  return rows;
}
