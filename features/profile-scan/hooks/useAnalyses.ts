"use client";

import { useQuery } from "@tanstack/react-query";
import { analysisService } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useLatestAnalysis() {
  return useQuery({
    queryKey: queryKeys.analyses.latest,
    queryFn: () => analysisService.getLatest(),
    retry: false,
  });
}

export function useAnalysisByProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.analyses.byProfile(profileId!),
    queryFn: () => analysisService.getByProfileId(profileId!),
    enabled: !!profileId,
    retry: false,
  });
}

export function useAnalysisHistory() {
  return useQuery({
    queryKey: queryKeys.analyses.history,
    queryFn: () => analysisService.getHistory(),
  });
}
