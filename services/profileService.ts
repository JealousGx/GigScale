import type { Analysis, Platform, Profile } from "@/types";
import { apiClient } from "./apiClient";

interface ScanPayload {
  profileUrl: string;
  platform: Platform;
}

interface ScanResponse {
  jobId: string;
}

interface ScanJobStatusResponse {
  status: "queued" | "running" | "completed" | "error";
  errorMessage?: string | null;
  profile?: Profile | null;
  analysis?: Analysis | null;
}

export const profileService = {
  scan: (payload: ScanPayload) =>
    apiClient.post<ScanResponse>("/profiles/scan", payload),

  getScanJob: (jobId: string) =>
    apiClient.get<ScanJobStatusResponse>(`/scan-jobs/${jobId}`),

  getProfile: (id: string) => apiClient.get<Profile>(`/profiles/${id}`),

  getUserProfiles: () => apiClient.get<Profile[]>("/profiles"),
};
