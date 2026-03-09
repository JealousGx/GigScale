"use client";

import { useState } from "react";
import { scanService } from "../services/scanService";
import { useCreditsStore } from "@/lib/stores";
import { getCreditCost } from "@/config/plans";
import type { ScanFormData, ScanResult, ScanStatus } from "../types/scanTypes";

export function useProfileScan() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const spendCredits = useCreditsStore((s) => s.spendCredits);

  const scan = async (data: ScanFormData) => {
    setStatus("scanning");
    setError(null);
    try {
      const scanResult = await scanService.scan(data);
      setResult(scanResult);
      setStatus("complete");
      spendCredits(getCreditCost("profile_scan"));
      return scanResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scan failed";
      setError(message);
      setStatus("error");
      throw err;
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
  };

  return { scan, status, result, error, reset };
}
