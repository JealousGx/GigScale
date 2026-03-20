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

export interface ProfilesPageResponse {
  items: Profile[];
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
}

export const profileService = {
  scan: (payload: ScanPayload) =>
    apiClient.post<ScanResponse>("/profiles/scan", payload),

  getScanJob: (jobId: string) =>
    apiClient.get<ScanJobStatusResponse>(`/scan-jobs/${jobId}`),

  getProfile: (id: string) => apiClient.get<Profile>(`/profiles/${id}`),

  getUserProfiles: (options?: { cursor?: string; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (options?.cursor) searchParams.set("cursor", options.cursor);
    if (options?.pageSize) searchParams.set("pageSize", String(options.pageSize));
    const query = searchParams.toString();
    return apiClient.get<ProfilesPageResponse>(`/profiles${query ? `?${query}` : ""}`);
  },
};
