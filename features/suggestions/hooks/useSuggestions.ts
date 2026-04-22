"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { Suggestion, SuggestionsPage } from "@/types";

import { featureSuggestionsService } from "../services/suggestionsService";

export function useSuggestions(analysisId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<SuggestionsPage>({
    queryKey: queryKeys.suggestions.byAnalysis(analysisId!),
    queryFn: ({ pageParam }) =>
      featureSuggestionsService.getByAnalysis(analysisId!, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    staleTime: 10 * 60_000,
    enabled: !!analysisId,
  });

  const generateMutation = useMutation<Suggestion[], Error, string>({
    mutationFn: (id) => featureSuggestionsService.generate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.suggestions.byAnalysis(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
    },
  });

  const suggestions: Suggestion[] = query.data
    ? query.data.pages.flatMap((page) => page.items)
    : [];

  return {
    suggestions,
    hasMore: !!query.hasNextPage,
    isFetchingMore: query.isFetchingNextPage,
    isLoading: query.isLoading || generateMutation.isPending,
    error: query.error?.message ?? generateMutation.error?.message ?? null,
    loadSuggestions: () => query.refetch(),
    loadMoreSuggestions: () => query.fetchNextPage(),
    generateSuggestions: (id: string) => generateMutation.mutateAsync(id),
  };
}
