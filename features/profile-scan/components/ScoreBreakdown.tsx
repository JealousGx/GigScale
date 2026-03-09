"use client";

import { cn } from "@/lib/utils";
import { getScoreColor, getScoreGradient, getScoreLabel } from "../utils/scanHelpers";

interface ScoreItem {
  label: string;
  score: number;
  weight: string;
}

interface ScoreBreakdownProps {
  title: string;
  items: ScoreItem[];
}

export function ScoreBreakdown({ title, items }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {item.weight}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold tabular-nums", getScoreColor(item.score))}>
                  {item.score}
                </span>
                <span className="text-xs text-muted-foreground">{getScoreLabel(item.score)}</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn(
                  "h-full rounded-full bg-linear-to-r transition-all duration-1000 ease-out",
                  getScoreGradient(item.score)
                )}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
