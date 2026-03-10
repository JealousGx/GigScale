"use client";

import { Clock, ExternalLink, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScanInput } from "@/features/profile-scan/components/ScanInput";
import {
  useAnalysisByProfile,
  useAnalysisHistory,
} from "@/features/profile-scan/hooks/useAnalyses";
import { useProfileScan } from "@/features/profile-scan/hooks/useProfileScan";
import { useActiveProfileStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const ScanResults = dynamic(() =>
  import("@/features/profile-scan/components/ScanResults").then(
    (m) => m.ScanResults,
  ),
);

export default function AnalyzePage() {
  const { status, result, error, scan, reset } = useProfileScan();
  const { data: history, isLoading: historyLoading } = useAnalysisHistory();
  const setGlobalProfileId = useActiveProfileStore((s) => s.setProfileId);

  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const { data: viewingData, isLoading: viewingLoading } =
    useAnalysisByProfile(viewingProfileId ?? undefined);

  const handleScan = async (url: string, platform: "upwork" | "fiverr") => {
    setViewingProfileId(null);
    try {
      await scan({ profileUrl: url, platform });
    } catch {
      // Hook handles error state
    }
  };

  const handleSelectProfile = (profileId: string) => {
    reset();
    setViewingProfileId(profileId);
    setGlobalProfileId(profileId);
  };

  const handleClearView = () => {
    setViewingProfileId(null);
  };

  const uniqueProfiles = useMemo(() => {
    if (!history) return [];
    return Array.from(
      new Map(history.map((h) => [h.profile.id, h])).values(),
    );
  }, [history]);

  const showingResult = result && !viewingProfileId;
  const showingViewed = viewingProfileId && viewingData;
  const showingIdle = !showingResult && !viewingProfileId && status === "idle";

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analyze Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your Upwork or Fiverr profile URL to get a detailed performance breakdown
        </p>
      </div>

      <ScanInput onScan={handleScan} status={status} />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          <div className="flex items-center justify-between">
            {error}
            <button type="button" onClick={reset} className="text-xs underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showingResult && (
        <ScanResults
          profile={result.profile}
          analysis={result.analysis}
          previousAnalysis={result.previousAnalysis}
        />
      )}

      {viewingProfileId && viewingLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {showingViewed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Viewing saved analysis
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearView}
              className="gap-1 text-xs text-muted-foreground"
            >
              <X size={14} />
              Clear
            </Button>
          </div>
          <ScanResults
            profile={viewingData.profile}
            analysis={viewingData.analysis}
            previousAnalysis={viewingData.previousAnalysis}
          />
        </div>
      )}

      {showingIdle && uniqueProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Past Analyses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueProfiles.map(({ profile, analysis }) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSelectProfile(profile.id)}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border border-border/40 bg-muted/5 p-5 text-left transition-all hover:border-border/80 hover:bg-muted/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {profile.platform}
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-primary">
                    {Math.round(Number(analysis.profileScore))}
                  </span>
                </div>
                <p className="line-clamp-1 text-sm font-medium">
                  {profile.profileTitle}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <ExternalLink size={11} />
                    View profile
                  </a>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showingIdle && uniqueProfiles.length === 0 && !historyLoading && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Enter your Upwork or Fiverr profile URL above to get started
          </p>
        </div>
      )}
    </div>
  );
}
