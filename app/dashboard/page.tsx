"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  Clock,
  Eye,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";

import { PRIORITY_CONFIG } from "@/features/suggestions/types/suggestionsTypes";

import { cn } from "@/lib/utils";

interface ScoreMetric {
  label: string;
  value: number;
  delta: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

const scores: ScoreMetric[] = [
  {
    label: "Profile Score",
    value: 74,
    delta: +5,
    icon: BarChart3,
    colorClass: "text-primary-foreground",
    bgClass: "bg-primary",
  },
  {
    label: "Visibility",
    value: 68,
    delta: +12,
    icon: Eye,
    colorClass: "text-primary-foreground",
    bgClass: "bg-secondary",
  },
  {
    label: "Conversion",
    value: 72,
    delta: -3,
    icon: TrendingUp,
    colorClass: "text-primary-foreground",
    bgClass: "bg-chart-2",
  },
  {
    label: "Trust",
    value: 85,
    delta: +2,
    icon: ShieldCheck,
    colorClass: "text-secondary-foreground",
    bgClass: "bg-chart-1",
  },
  {
    label: "Completeness",
    value: 60,
    delta: 0,
    icon: ClipboardCheck,
    colorClass: "text-foreground",
    bgClass: "bg-chart-3",
  },
];

const recentActions = [
  { action: "Profile scanned", platform: "Upwork", time: "2 hours ago" },
  { action: "Headline rewritten", platform: "Fiverr", time: "5 hours ago" },
  { action: "12 suggestions generated", platform: "Upwork", time: "1 day ago" },
  { action: "Description rewritten", platform: "Upwork", time: "2 days ago" },
];

const quickSuggestions = [
  { title: "Add a compelling CTA", priority: "high" as const, impact: "+8 conversion" },
  { title: "Include 3 more portfolio items", priority: "medium" as const, impact: "+5 trust" },
  { title: "Optimize title keywords", priority: "critical" as const, impact: "+12 visibility" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile performance at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 sm:grid-cols-3 lg:grid-cols-5">
        {scores.map((score) => {
          const Icon = score.icon;
          return (
            <div
              key={score.label}
              className="group relative flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-muted/10"
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl shadow-md",
                  score.bgClass,
                  score.colorClass
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums tracking-tight">
                    {score.value}
                  </span>
                  {score.delta !== 0 && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        score.delta > 0 ? "text-chart-1" : "text-destructive"
                      )}
                    >
                      {score.delta > 0 ? (
                        <ArrowUpRight size={12} strokeWidth={2} />
                      ) : (
                        <ArrowDownRight size={12} strokeWidth={2} />
                      )}
                      {Math.abs(score.delta)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{score.label}</p>
              </div>
            </div>
          );
        })}
      </div>

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
