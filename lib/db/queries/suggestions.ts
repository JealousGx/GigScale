import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";
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

export interface SuggestionsCursor {
  createdAt: Date;
  id: string;
}

export async function findSuggestionsPageByAnalysisId(
  analysisId: string,
  pageSize: number,
  cursor?: SuggestionsCursor,
) {
  const whereCondition = cursor
    ? and(
        eq(suggestions.analysisId, analysisId),
        or(
          lt(suggestions.createdAt, cursor.createdAt),
          and(
            eq(suggestions.createdAt, cursor.createdAt),
            lt(suggestions.id, cursor.id),
          ),
        ),
      )
    : eq(suggestions.analysisId, analysisId);

  const rows = await getDb()
    .select()
    .from(suggestions)
    .where(whereCondition)
    .orderBy(desc(suggestions.createdAt), desc(suggestions.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  return {
    items,
    hasMore,
    nextCursor: hasMore
      ? ({
          createdAt: items[items.length - 1]!.createdAt,
          id: items[items.length - 1]!.id,
        } as SuggestionsCursor)
      : null,
  };
}
