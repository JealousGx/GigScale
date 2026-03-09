"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scanService } from "../services/scanService";
import { queryKeys } from "@/lib/query-keys";
import type { ScanFormData, ScanResult, ScanStatus } from "../types/scanTypes";

export function useProfileScan() {
  const queryClient = useQueryClient();

  const mutation = useMutation<ScanResult, Error, ScanFormData>({
    mutationFn: (data) => scanService.scan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.latest });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.credits.all });
    },
  });

  const status: ScanStatus = mutation.isPending
    ? "scanning"
    : mutation.isSuccess
      ? "complete"
      : mutation.isError
        ? "error"
        : "idle";

  return {
    scan: (data: ScanFormData) => mutation.mutateAsync(data),
    status,
    result: mutation.data ?? null,
    error: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}
