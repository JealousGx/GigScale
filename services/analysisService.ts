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

export interface ProfileAnalysisResponse {
  profile: Profile;
  analysis: Analysis;
  previousAnalysis: Analysis | null;
}

export const analysisService = {
  getByProfileId: (profileId: string) =>
    apiClient.get<ProfileAnalysisResponse>(`/analyses/${profileId}`),

  getLatest: () =>
    apiClient.get<LatestAnalysisResponse>("/analyses/latest"),

  getHistory: () =>
    apiClient.get<AnalysisHistoryEntry[]>("/analyses/history"),
};
