"use client";

import { Coins } from "lucide-react";

import { CREDIT_COSTS } from "@/config/plans";
import { useCreditsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

export function CreditsDisplay() {
  const { credits, creditsUsed, creditsTotal } = useCreditsStore();
  const percentage =
    creditsTotal > 0 ? Math.min((creditsUsed / creditsTotal) * 100, 100) : 0;
  const isLow = creditsTotal > 0 && credits <= creditsTotal * 0.2;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/40 bg-muted/5 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Coins size={15} strokeWidth={1.5} />
          Credits
        </div>
        {isLow && (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            Low
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "text-4xl font-bold tabular-nums tracking-tight",
              isLow && "text-destructive",
            )}
          >
            {credits}
          </span>
          <span className="text-sm text-muted-foreground">
            / {creditsTotal}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          credits remaining this month
        </p>
      </div>

      <div className="mb-6">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isLow
                ? "bg-linear-to-r from-destructive to-destructive/60"
                : "bg-linear-to-r from-primary to-primary/60",
            )}
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-auto space-y-2 border-t border-border/30 pt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Credit Costs
        </p>
        {CREDIT_COSTS.map((cost) => (
          <div
            key={cost.action}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{cost.label}</span>
            <span className="font-medium tabular-nums">
              {cost.credits} {cost.credits === 1 ? "credit" : "credits"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
