"use client";

import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

import { useLatestAnalysis } from "@/features/profile-scan/hooks/useAnalyses";
import { SuggestionsList } from "@/features/suggestions/components/SuggestionsList";
import { useSuggestions } from "@/features/suggestions/hooks/useSuggestions";
import { PRIORITY_CONFIG } from "@/features/suggestions/types/suggestionsTypes";

export default function SuggestionsPage() {
  const { data: latestData, isLoading: analysisLoading } = useLatestAnalysis();
  const latestAnalysis = latestData?.analysis ?? null;
  const analysisId = latestAnalysis?.id;
  const { suggestions, isLoading, error, generateSuggestions } = useSuggestions(analysisId);

  const handleGenerate = async () => {
    if (!analysisId) return;
    try {
      await generateSuggestions(analysisId);
    } catch {
      // Hook handles error
    }
  };

  if (analysisLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!latestAnalysis) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-muted/5 py-16 text-center">
          <AlertCircle size={32} className="text-muted-foreground" />
          <div>
            <p className="font-medium">No analysis available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan a profile first to get AI-powered suggestions
            </p>
          </div>
          <Link href="/dashboard/analyze" variant="default" className="mt-2 rounded-2xl">
            Analyze a Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suggestions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered recommendations to improve your profile performance
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="rounded-2xl">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {suggestions.length === 0 ? "Generate" : "Regenerate"}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex items-center gap-6 border-b border-border/30 pb-4">
          {(["critical", "high", "medium", "low"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${PRIORITY_CONFIG[p].dotColor}`} />
              <span className="text-xs text-muted-foreground">
                {suggestions.filter((s) => s.priority === p).length} {PRIORITY_CONFIG[p].label}
              </span>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !isLoading && !error && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No suggestions yet. Click &ldquo;Generate&rdquo; to get AI-powered recommendations.
        </div>
      )}

      <SuggestionsList suggestions={suggestions} isLoading={isLoading} />
    </div>
  );
}
