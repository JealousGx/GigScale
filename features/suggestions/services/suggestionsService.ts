import { suggestionsService as apiSuggestions } from "@/services";
import type { Suggestion } from "@/types";

export const featureSuggestionsService = {
  getByAnalysis: async (analysisId: string): Promise<Suggestion[]> => {
    return apiSuggestions.getByAnalysisId(analysisId);
  },
  generate: async (analysisId: string): Promise<Suggestion[]> => {
    return apiSuggestions.generate(analysisId);
  },
};
