"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services";
import { queryKeys } from "@/lib/query-keys";

export function useProfiles() {
  return useQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: () => profileService.getUserProfiles(),
    staleTime: 5 * 60_000,
  });
}

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id!),
    queryFn: () => profileService.getProfile(id!),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}
