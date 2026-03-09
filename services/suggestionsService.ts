import { apiClient } from "./apiClient";
import type { Suggestion } from "@/types";

export const suggestionsService = {
  getByAnalysisId: (analysisId: string) =>
    apiClient.get<Suggestion[]>(`/suggestions/${analysisId}`),

  generate: (analysisId: string) =>
    apiClient.post<Suggestion[]>(`/suggestions/generate`, { analysisId }),
};
