import { apiClient } from "./apiClient";
import type { Suggestion, SuggestionsPage } from "@/types";

export const suggestionsService = {
  getByAnalysisId: (
    analysisId: string,
    options?: { cursor?: string; pageSize?: number },
  ) => {
    const searchParams = new URLSearchParams();
    if (options?.cursor) searchParams.set("cursor", options.cursor);
    if (options?.pageSize) searchParams.set("pageSize", String(options.pageSize));
    const query = searchParams.toString();
    return apiClient.get<SuggestionsPage>(
      `/suggestions/${analysisId}${query ? `?${query}` : ""}`,
    );
  },

  generate: (analysisId: string) =>
    apiClient.post<Suggestion[]>(`/suggestions/generate`, { analysisId }),
};
