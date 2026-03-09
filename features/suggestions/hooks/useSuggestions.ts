"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { featureSuggestionsService } from "../services/suggestionsService";
import { queryKeys } from "@/lib/query-keys";
import type { Suggestion } from "@/types";

export function useSuggestions(analysisId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<Suggestion[]>({
    queryKey: queryKeys.suggestions.byAnalysis(analysisId!),
    queryFn: () => featureSuggestionsService.getByAnalysis(analysisId!),
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

  return {
    suggestions: query.data ?? [],
    isLoading: query.isLoading || generateMutation.isPending,
    error:
      query.error?.message ?? generateMutation.error?.message ?? null,
    loadSuggestions: () => query.refetch(),
    generateSuggestions: (id: string) => generateMutation.mutateAsync(id),
  };
}
