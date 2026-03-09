"use client";

import { useState } from "react";
import { featureRewriteService } from "../services/rewriteService";
import { useCreditsStore } from "@/lib/stores";
import { getCreditCost } from "@/config/plans";
import type { Rewrite, RewriteMode, RewriteType } from "@/types";
import type { RewriteStatus } from "../types/rewriteTypes";

export function useRewrite() {
  const [result, setResult] = useState<Rewrite | null>(null);
  const [status, setStatus] = useState<RewriteStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const spendCredits = useCreditsStore((s) => s.spendCredits);

  const generate = async (
    profileId: string,
    type: RewriteType,
    originalText: string,
    mode: RewriteMode,
  ) => {
    setStatus("generating");
    setError(null);
    try {
      const rewrite = await featureRewriteService.generate(
        profileId,
        type,
        originalText,
        mode,
      );
      setResult(rewrite);
      setStatus("complete");
      spendCredits(getCreditCost("rewrite_generated"));
      return rewrite;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setResult(null);
    setStatus("idle");
    setError(null);
  };

  return { generate, result, status, error, reset };
}
