"use client";

import type { Analysis, Profile } from "@/types";
import { ScoreRing } from "./ScoreRing";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { Eye, TrendingUp, ShieldCheck, ClipboardCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreColor, getScoreBg } from "../utils/scanHelpers";

interface ScanResultsProps {
  profile: Profile;
  analysis: Analysis;
}

interface Metric {
  label: string;
  score: number;
  icon: LucideIcon;
  description: string;
}

export function ScanResults({ profile, analysis }: ScanResultsProps) {
  const metrics: Metric[] = [
    {
      label: "Visibility",
      score: analysis.visibilityScore,
      icon: Eye,
      description: "How easily clients find your profile",
    },
    {
      label: "Conversion",
      score: analysis.conversionScore,
      icon: TrendingUp,
      description: "How well your profile converts visitors",
    },
    {
      label: "Trust",
      score: analysis.trustScore,
      icon: ShieldCheck,
      description: "Client confidence signals",
    },
    {
      label: "Completeness",
      score: analysis.completenessScore,
      icon: ClipboardCheck,
      description: "Profile information coverage",
    },
  ];

  const visibilityItems = [
    { label: "Keyword Coverage", score: Math.round(analysis.visibilityScore * 0.9), weight: "40%" },
    { label: "Title Optimization", score: Math.round(analysis.visibilityScore * 1.05), weight: "30%" },
    { label: "Tag Optimization", score: Math.round(analysis.visibilityScore * 0.85), weight: "20%" },
    { label: "Category Relevance", score: Math.round(analysis.visibilityScore * 1.1), weight: "10%" },
  ];

  const conversionItems = [
    { label: "Description Quality", score: Math.round(analysis.conversionScore * 0.95), weight: "30%" },
    { label: "Portfolio Strength", score: Math.round(analysis.conversionScore * 1.05), weight: "30%" },
    { label: "CTA Presence", score: Math.round(analysis.conversionScore * 0.8), weight: "20%" },
    { label: "Proof Elements", score: Math.round(analysis.conversionScore * 1.1), weight: "20%" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-muted/40 px-4 py-1 text-xs font-medium capitalize text-muted-foreground">
          {profile.platform} Profile
        </div>
        <h2 className="max-w-md text-lg font-semibold tracking-tight">
          {profile.profileTitle}
        </h2>
      </div>

      <div className="flex justify-center">
        <ScoreRing
          score={analysis.profileScore}
          size={160}
          strokeWidth={10}
          label="Profile Score"
        />
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-3 bg-background p-6 transition-colors hover:bg-muted/20"
            >
              <div className={cn("rounded-xl p-2.5", getScoreBg(metric.score))}>
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={getScoreColor(metric.score)}
                />
              </div>
              <div className="text-center">
                <p className={cn("text-2xl font-bold tabular-nums", getScoreColor(metric.score))}>
                  {metric.score}
                </p>
                <p className="mt-0.5 text-sm font-medium">{metric.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <ScoreBreakdown title="Visibility Breakdown" items={visibilityItems} />
        <ScoreBreakdown title="Conversion Breakdown" items={conversionItems} />
      </div>
    </div>
  );
}
