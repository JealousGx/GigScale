import { apiClient } from "./apiClient";
import type { Analysis } from "@/types";

export const analysisService = {
  getByProfileId: (profileId: string) =>
    apiClient.get<Analysis>(`/analyses/${profileId}`),

  getLatest: () =>
    apiClient.get<Analysis>("/analyses/latest"),

  getHistory: () =>
    apiClient.get<Analysis[]>("/analyses/history"),
};
