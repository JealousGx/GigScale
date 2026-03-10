"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  Eye,
  Loader2,
  Scan,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { ScoreDelta } from "@/components/shared/ScoreDelta";
import { Link as CustomLink } from "@/components/ui/link";
import { useActiveProfile } from "@/features/profile-scan/hooks/useActiveProfile";

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

const quickActions = [
  {
    label: "Analyze a Profile",
    description: "Scan your Upwork or Fiverr profile for a detailed breakdown",
    href: "/dashboard/analyze",
    icon: Scan,
  },
  {
    label: "Get Suggestions",
    description: "AI-powered recommendations to improve your scores",
    href: "/dashboard/suggestions",
    icon: Sparkles,
  },
  {
    label: "Rewrite Content",
    description: "Optimize your headline, description, or gig text",
    href: "/dashboard/rewrite",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  const { profile, analysis, previousAnalysis, isLoading } = useActiveProfile();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile
            ? `Viewing ${profile.profileTitle} on ${profile.platform === "upwork" ? "Upwork" : "Fiverr"}`
            : "Your profile performance at a glance"}
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
        <>
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xl font-bold tabular-nums tracking-tight">
                        {Math.round(value)}
                      </span>
                      {previousAnalysis && (
                        <ScoreDelta
                          current={value}
                          previous={Number(previousAnalysis[score.key as keyof typeof previousAnalysis]) || 0}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{score.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {analysis.summary && (
            <div className="rounded-2xl border border-border/40 bg-muted/10 px-6 py-5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI Analysis
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">{analysis.summary}</p>
            </div>
          )}
        </>
      )}

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CustomLink
                key={action.href}
                href={action.href}
                variant="outline"
                className="flex h-auto flex-col items-start gap-2 rounded-2xl p-5 text-left"
              >
                <Icon size={20} strokeWidth={1.5} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CustomLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
