"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useCreditsStore } from "@/lib/stores";
import { queryKeys } from "@/lib/query-keys";

interface CreditsResponse {
  plan: string;
  credits: number;
  creditsUsed: number;
  creditsTotal: number;
  freeScansRemaining: number;
}

async function fetchCredits(): Promise<CreditsResponse> {
  const res = await fetch("/api/billing/credits");
  if (!res.ok) throw new Error("Failed to fetch credits");
  return res.json();
}

export function useCredits() {
  const setCredits = useCreditsStore((s) => s.setCredits);

  const query = useQuery<CreditsResponse>({
    queryKey: queryKeys.credits.all,
    queryFn: fetchCredits,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setCredits({
        plan: query.data.plan as "free" | "pro" | "enterprise" | "custom",
        credits: query.data.credits,
        creditsUsed: query.data.creditsUsed,
        creditsTotal: query.data.creditsTotal,
        freeScansRemaining: query.data.freeScansRemaining,
      });
    }
  }, [query.data, setCredits]);

  return query;
}
