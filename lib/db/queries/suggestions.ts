import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "..";
import { suggestions } from "../schema";

export async function insertSuggestions(
  data: Array<{
    analysisId: string;
    title: string;
    description: string;
    recommendedFix: string;
    priority: "critical" | "high" | "medium" | "low";
  }>,
) {
  if (data.length === 0) return [];
  await getDb().insert(suggestions).values(data);
  return findSuggestionsByAnalysisId(data[0].analysisId);
}

export async function findSuggestionsByAnalysisId(analysisId: string) {
  return getDb()
    .select()
    .from(suggestions)
    .where(eq(suggestions.analysisId, analysisId))
    .orderBy(desc(suggestions.createdAt));
}
