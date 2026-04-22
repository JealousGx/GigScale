"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
  const query = useInfiniteQuery({
    queryKey: queryKeys.analyses.history,
    queryFn: ({ pageParam }) =>
      analysisService.getHistory({
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60_000,
  });

  const data: AnalysisHistoryEntry[] = query.data
    ? query.data.pages.flatMap((page) => page.items)
    : [];

  return {
    ...query,
    data,
    hasMore: !!query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}
