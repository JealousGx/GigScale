"use client";

import { useEffect } from "react";

import { useActiveProfileStore } from "@/lib/stores";

import { useAnalysisByProfile } from "./useAnalyses";
import { useProfiles } from "./useProfiles";

/**
 * Returns the currently active profile's analysis data.
 * Auto-selects the most recent profile if none is set.
 * All downstream data (suggestions, rewrites) should key off this.
 */
export function useActiveProfile() {
  const profileId = useActiveProfileStore((s) => s.profileId);
  const setProfileId = useActiveProfileStore((s) => s.setProfileId);

  const { data: profiles, isLoading: profilesLoading } = useProfiles();

  useEffect(() => {
    if (profileId || profilesLoading || !profiles?.length) return;
    setProfileId(profiles[0].id);
  }, [profileId, profiles, profilesLoading, setProfileId]);

  const activeId = profileId ?? profiles?.[0]?.id;
  const activeProfile = profiles?.find((p) => p.id === activeId) ?? null;

  const { data: analysisData, isLoading: analysisLoading } =
    useAnalysisByProfile(activeId);

  return {
    profileId: activeId ?? null,
    profile: activeProfile,
    profiles: profiles ?? [],
    analysis: analysisData?.analysis ?? null,
    previousAnalysis: analysisData?.previousAnalysis ?? null,
    isLoading: profilesLoading || analysisLoading,
    setProfileId,
  };
}
