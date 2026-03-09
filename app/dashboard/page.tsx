"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  Clock,
  Eye,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";
import { useLatestAnalysis } from "@/features/profile-scan/hooks/useAnalyses";
import { PRIORITY_CONFIG } from "@/features/suggestions/types/suggestionsTypes";

import { cn } from "@/lib/utils";

interface ScoreMetric {
  label: string;
  key: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

const scoreConfig: ScoreMetric[] = [
  {
    label: "Profile Score",
    key: "profileScore",
    icon: BarChart3,
    colorClass: "text-primary-foreground",
    bgClass: "bg-primary",
  },
  {
    label: "Visibility",
    key: "visibilityScore",
    icon: Eye,
    colorClass: "text-primary-foreground",
    bgClass: "bg-secondary",
  },
  {
    label: "Conversion",
    key: "conversionScore",
    icon: TrendingUp,
    colorClass: "text-primary-foreground",
    bgClass: "bg-chart-2",
  },
  {
    label: "Trust",
    key: "trustScore",
    icon: ShieldCheck,
    colorClass: "text-secondary-foreground",
    bgClass: "bg-chart-1",
  },
  {
    label: "Completeness",
    key: "completenessScore",
    icon: ClipboardCheck,
    colorClass: "text-foreground",
    bgClass: "bg-chart-3",
  },
];

const quickSuggestions = [
  { title: "Add a compelling CTA", priority: "high" as const, impact: "+8 conversion" },
  { title: "Include 3 more portfolio items", priority: "medium" as const, impact: "+5 trust" },
  { title: "Optimize title keywords", priority: "critical" as const, impact: "+12 visibility" },
];

const recentActions = [
  { action: "Profile scanned", platform: "Upwork", time: "2 hours ago" },
  { action: "Headline rewritten", platform: "Fiverr", time: "5 hours ago" },
  { action: "12 suggestions generated", platform: "Upwork", time: "1 day ago" },
  { action: "Description rewritten", platform: "Upwork", time: "2 days ago" },
];

export default function DashboardPage() {
  const { data: analysis, isLoading } = useLatestAnalysis();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile performance at a glance
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : !analysis ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-muted/5 py-14 text-center">
          <p className="font-medium">No profile data yet</p>
          <p className="text-sm text-muted-foreground">
            Scan your first profile to see your performance scores
          </p>
          <CustomLink href="/dashboard/analyze" variant="default" className="mt-2 rounded-2xl">
            Analyze a Profile
          </CustomLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 sm:grid-cols-3 lg:grid-cols-5">
          {scoreConfig.map((score) => {
            const Icon = score.icon;
            const value = Number(analysis[score.key as keyof typeof analysis]) || 0;
            return (
              <div
                key={score.label}
                className="group relative flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-muted/10"
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl shadow-md",
                    score.bgClass,
                    score.colorClass,
                  )}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-3xl font-bold tabular-nums tracking-tight">
                    {Math.round(value)}
                  </span>
                  <p className="mt-0.5 text-sm text-muted-foreground">{score.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Top Suggestions
            </h2>
            <CustomLink href="/dashboard/suggestions" variant="ghost" size="xs" className="rounded-lg text-xs">
              View all
            </CustomLink>
          </div>
          <div className="space-y-1">
            {quickSuggestions.map((s, i) => (
              <div
                key={s.title}
                className="flex items-center gap-4 rounded-xl px-1 py-3.5 transition-colors hover:bg-muted/10"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <span className={cn("size-2 shrink-0 rounded-full", PRIORITY_CONFIG[s.priority].dotColor)} />
                <span className="flex-1 text-sm font-medium">{s.title}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {s.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </h2>
          <div className="space-y-1">
            {recentActions.map((a) => (
              <div key={`${a.action}-${a.time}`} className="flex items-start gap-3 py-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                  <Clock size={14} strokeWidth={1.5} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.platform} &middot; {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <CustomLink href="/dashboard/analyze" variant="outline" className="rounded-2xl">
          Analyze a Profile
        </CustomLink>
        <CustomLink href="/dashboard/rewrite" variant="outline" className="rounded-2xl">
          Rewrite Content
        </CustomLink>
        <CustomLink href="/dashboard/suggestions" variant="outline" className="rounded-2xl">
          View Suggestions
        </CustomLink>
      </div>
    </div>
  );
}
