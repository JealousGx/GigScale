"use client";

import { useState } from "react";
import { featureSuggestionsService } from "../services/suggestionsService";
import type { Suggestion } from "@/types";

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await featureSuggestionsService.getByAnalysis(analysisId);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await featureSuggestionsService.generate(analysisId);
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  return { suggestions, isLoading, error, loadSuggestions, generateSuggestions };
}
