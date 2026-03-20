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

export interface AnalysisHistoryPageResponse {
  items: AnalysisHistoryEntry[];
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
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

  getHistory: (options?: { cursor?: string; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (options?.cursor) searchParams.set("cursor", options.cursor);
    if (options?.pageSize) searchParams.set("pageSize", String(options.pageSize));
    const query = searchParams.toString();
    return apiClient.get<AnalysisHistoryPageResponse>(
      `/analyses/history${query ? `?${query}` : ""}`,
    );
  },
};
