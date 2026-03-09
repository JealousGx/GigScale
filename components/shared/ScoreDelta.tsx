import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

interface ScoreDeltaProps {
  current: number;
  previous: number;
  className?: string;
}

export function ScoreDelta({ current, previous, className }: ScoreDeltaProps) {
  const delta = Math.round(current - previous);

  if (delta === 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs text-muted-foreground", className)}>
        <Minus size={12} />
        <span>0</span>
      </span>
    );
  }

  const isPositive = delta > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        className,
      )}
    >
      {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      <span>{isPositive ? `+${delta}` : delta}</span>
    </span>
  );
}
