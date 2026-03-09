import type { Platform, Profile, Analysis } from "@/types";

export interface ScanFormData {
  profileUrl: string;
  platform: Platform;
}

export interface ScanResult {
  profile: Profile;
  analysis: Analysis;
}

export type ScanStatus = "idle" | "scanning" | "complete" | "error";
