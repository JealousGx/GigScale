"use client";

import { cn } from "@/lib/utils";
import type { RewriteMode } from "@/types";
import { REWRITE_MODE_LABELS } from "@/types";
import { Search, TrendingUp, Crown, AlignLeft, type LucideIcon } from "lucide-react";

const modeIcons: Record<RewriteMode, LucideIcon> = {
  seo_optimization: Search,
  conversion_optimization: TrendingUp,
  premium_client_targeting: Crown,
  clarity_improvement: AlignLeft,
};

const modeDescriptions: Record<RewriteMode, string> = {
  seo_optimization: "Maximize search visibility with targeted keywords",
  conversion_optimization: "Increase client inquiries and project wins",
  premium_client_targeting: "Attract high-budget, quality clients",
  clarity_improvement: "Make your message clear and compelling",
};

interface ModeSelectorProps {
  value: RewriteMode;
  onChange: (mode: RewriteMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const modes = Object.entries(REWRITE_MODE_LABELS) as [RewriteMode, string][];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Optimization Mode</p>
      <div className="grid grid-cols-2 gap-3">
        {modes.map(([mode, label]) => {
          const Icon = modeIcons[mode];
          const isSelected = value === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-primary/40 bg-primary/5 ring-2 ring-primary/10"
                  : "border-border/40 hover:border-border hover:bg-muted/20"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className={cn("text-sm font-medium", isSelected && "text-primary")}>
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {modeDescriptions[mode]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
