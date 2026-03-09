"use client";

import { ScanInput } from "@/features/profile-scan/components/ScanInput";
import { ScanResults } from "@/features/profile-scan/components/ScanResults";
import { useProfileScan } from "@/features/profile-scan/hooks/useProfileScan";
import type { Analysis, Profile } from "@/types";

const mockProfile: Profile = {
  id: "p1",
  userId: "u1",
  platform: "upwork",
  profileUrl: "https://www.upwork.com/freelancers/~example",
  profileTitle: "Senior Full-Stack Developer | React, Node.js, TypeScript Expert",
  profileDescription: "I build high-quality web applications...",
  reviewRating: 4.9,
  reviewCount: 127,
  portfolioCount: 8,
  profileAgeYears: 4.5,
  lastScannedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAnalysis: Analysis = {
  id: "a1",
  profileId: "p1",
  profileScore: 74,
  visibilityScore: 68,
  conversionScore: 72,
  trustScore: 85,
  completenessScore: 60,
  createdAt: new Date(),
};

export default function AnalyzePage() {
  const { status, result, error, scan } = useProfileScan();

  const handleScan = async (url: string, platform: "upwork" | "fiverr") => {
    try {
      await scan({ profileUrl: url, platform });
    } catch {
      // Hook handles error state
    }
  };

  const displayResult = result ?? (status === "idle" ? null : null);
  const showMockDemo = status === "idle";

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
          {error}
        </div>
      )}

      {displayResult && (
        <ScanResults profile={displayResult.profile} analysis={displayResult.analysis} />
      )}

      {showMockDemo && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Preview
            </span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <ScanResults profile={mockProfile} analysis={mockAnalysis} />
        </div>
      )}
    </div>
  );
}
