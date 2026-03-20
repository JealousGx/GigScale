import type { Analysis, Platform, Profile } from "@/types";

export interface ScanFormData {
  profileUrl: string;
  platform: Platform;
}

export interface ScanResult {
  profile: Profile;
  analysis: Analysis;
  previousAnalysis?: Analysis | null;
}

export interface ScanJobResponse {
  jobId: string;
}

export interface ScanJobStatusResponse {
  status: "queued" | "running" | "completed" | "error";
  errorMessage?: string | null;
  profile?: Profile | null;
  analysis?: Analysis | null;
}

export type ScanStatus = "idle" | "scanning" | "complete" | "error";
