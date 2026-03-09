import { apiClient } from "./apiClient";
import type { Analysis, Profile } from "@/types";

export interface LatestAnalysisResponse {
  analysis: Analysis;
  previousAnalysis: Analysis | null;
}

export interface AnalysisHistoryEntry {
  analysis: Analysis;
  profile: Profile;
}

export const analysisService = {
  getByProfileId: (profileId: string) =>
    apiClient.get<Analysis>(`/analyses/${profileId}`),

  getLatest: () =>
    apiClient.get<LatestAnalysisResponse>("/analyses/latest"),

  getHistory: () =>
    apiClient.get<AnalysisHistoryEntry[]>("/analyses/history"),
};
