"use client";

import { ScanInput } from "@/features/profile-scan/components/ScanInput";
import { ScanResults } from "@/features/profile-scan/components/ScanResults";
import { useProfileScan } from "@/features/profile-scan/hooks/useProfileScan";

export default function AnalyzePage() {
  const { status, result, error, scan, reset } = useProfileScan();

  const handleScan = async (url: string, platform: "upwork" | "fiverr") => {
    try {
      await scan({ profileUrl: url, platform });
    } catch {
      // Hook handles error state
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analyze Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan your freelancer profile and get a detailed performance breakdown
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

      {result && (
        <ScanResults
          profile={result.profile}
          analysis={result.analysis}
          previousAnalysis={result.previousAnalysis}
        />
      )}

      {status === "idle" && !result && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Enter your Upwork or Fiverr profile URL above to get started
          </p>
        </div>
      )}
    </div>
  );
}
