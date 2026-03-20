"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { queryKeys } from "@/lib/query-keys";
import { useActiveProfileStore } from "@/lib/stores";

import { scanService } from "../services/scanService";
import type {
  ScanFormData,
  ScanJobStatusResponse,
  ScanResult,
  ScanStatus,
} from "../types/scanTypes";

export function useProfileScan() {
  const queryClient = useQueryClient();
  const setProfileId = useActiveProfileStore((s) => s.setProfileId);

  const [scanJobId, setScanJobId] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<{ jobId: string }, Error, ScanFormData>({
    mutationFn: (data) => scanService.scan(data),
    onSuccess: (result) => {
      setResult(null);
      setError(null);
      setScanJobId(result.jobId);
    },
    onError: (e) => {
      setError(e.message);
      setScanJobId(null);
    },
  });

  const jobQuery = useQuery<ScanJobStatusResponse>({
    queryKey: ["scan-jobs", scanJobId],
    queryFn: () => scanService.getScanJob(scanJobId as string),
    enabled: !!scanJobId,
    retry: false,
    refetchInterval: 2000,
  });

  useEffect(() => {
    const job = jobQuery.data;
    if (!job) return;

    if (job.status === "completed" && job.profile && job.analysis) {
      setResult({
        profile: job.profile,
        analysis: job.analysis,
        previousAnalysis: null,
      });

      setProfileId(job.profile.id);

      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.latest });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });

      // Stop polling.
      setScanJobId(null);
      return;
    }

    if (job.status === "error") {
      setError(job.errorMessage ?? "Scan failed");
      setScanJobId(null);
    }
  }, [jobQuery.data, queryClient, setProfileId]);

  const status: ScanStatus = result
    ? "complete"
    : error
      ? "error"
      : mutation.isPending || jobQuery.isFetching
        ? "scanning"
        : "idle";

  const reset = () => {
    mutation.reset();
    setResult(null);
    setError(null);
    setScanJobId(null);
  };

  return {
    scan: (data: ScanFormData) => mutation.mutateAsync(data),
    status,
    result,
    error,
    reset,
  };
}
