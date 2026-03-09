import { apiClient } from "./apiClient";
import type { Platform, Profile, Analysis } from "@/types";

interface ScanPayload {
  profileUrl: string;
  platform: Platform;
}

interface ScanResponse {
  profile: Profile;
  analysis: Analysis;
}

export const profileService = {
  scan: (payload: ScanPayload) =>
    apiClient.post<ScanResponse>("/profiles/scan", payload),

  getProfile: (id: string) =>
    apiClient.get<Profile>(`/profiles/${id}`),

  getUserProfiles: () =>
    apiClient.get<Profile[]>("/profiles"),
};
