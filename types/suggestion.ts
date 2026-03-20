export type Priority = "critical" | "high" | "medium" | "low";

export interface Suggestion {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  recommendedFix: string;
  priority: Priority;
  isApplied: boolean;
  createdAt: Date;
}

export interface SuggestionsPage {
  items: Suggestion[];
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
}
