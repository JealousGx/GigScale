"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { analysisService } from "@/services";
import type {
  AnalysisHistoryEntry,
  LatestAnalysisResponse,
  ProfileAnalysisResponse,
} from "@/services/analysisService";

export function useLatestAnalysis() {
  return useQuery<LatestAnalysisResponse>({
    queryKey: queryKeys.analyses.latest,
    queryFn: () => analysisService.getLatest(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useAnalysisByProfile(profileId: string | undefined) {
  return useQuery<ProfileAnalysisResponse>({
    queryKey: queryKeys.analyses.byProfile(profileId as string),
    queryFn: () => analysisService.getByProfileId(profileId as string),
    staleTime: 5 * 60_000,
    enabled: !!profileId,
    retry: false,
  });
}

export function useAnalysisHistory() {
  return useQuery<AnalysisHistoryEntry[]>({
    queryKey: queryKeys.analyses.history,
    queryFn: () => analysisService.getHistory(),
    staleTime: 5 * 60_000,
  });
}
