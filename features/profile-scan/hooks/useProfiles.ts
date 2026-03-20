"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { profileService } from "@/services";
import type { Profile } from "@/types";

export function useProfiles() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: ({ pageParam }) =>
      profileService.getUserProfiles({
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60_000,
  });

  const data: Profile[] = query.data
    ? query.data.pages.flatMap((page) => page.items)
    : [];

  return {
    ...query,
    data,
    hasMore: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id!),
    queryFn: () => profileService.getProfile(id!),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}
