import { suggestionsService as apiSuggestions } from "@/services";
import type { Suggestion, SuggestionsPage } from "@/types";

export const featureSuggestionsService = {
  getByAnalysis: async (
    analysisId: string,
    options?: { cursor?: string; pageSize?: number },
  ): Promise<SuggestionsPage> => {
    return apiSuggestions.getByAnalysisId(analysisId, options);
  },
  generate: async (analysisId: string): Promise<Suggestion[]> => {
    return apiSuggestions.generate(analysisId);
  },
};
