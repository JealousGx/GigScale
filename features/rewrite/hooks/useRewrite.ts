"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { Rewrite, RewriteMode, RewriteType } from "@/types";

import { featureRewriteService } from "../services/rewriteService";
import type { RewriteStatus } from "../types/rewriteTypes";

interface GenerateArgs {
  profileId: string;
  type: RewriteType;
  originalText: string;
  mode: RewriteMode;
}

export function useRewrite() {
  const queryClient = useQueryClient();

  const mutation = useMutation<Rewrite, Error, GenerateArgs>({
    mutationFn: ({ profileId, type, originalText, mode }) =>
      featureRewriteService.generate(profileId, type, originalText, mode),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rewrites.byProfile(variables.profileId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
    },
  });

  const status: RewriteStatus = mutation.isPending
    ? "generating"
    : mutation.isSuccess
      ? "complete"
      : mutation.isError
        ? "error"
        : "idle";

  return {
    generate: (
      profileId: string,
      type: RewriteType,
      originalText: string,
      mode: RewriteMode,
    ) => mutation.mutateAsync({ profileId, type, originalText, mode }),
    result: mutation.data ?? null,
    status,
    error: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}

export function useRewriteHistory(profileId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.rewrites.byProfile(profileId!),
    queryFn: ({ pageParam }) =>
      featureRewriteService.getHistory(profileId!, {
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60_000,
    enabled: !!profileId,
  });

  const data: Rewrite[] = query.data
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
