"use client";

import { useState } from "react";
import type { Suggestion } from "@/types";
import { PriorityBadge } from "./PriorityBadge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 px-1 py-5 text-left transition-colors hover:bg-muted/10"
      >
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">{suggestion.title}</h3>
            <PriorityBadge priority={suggestion.priority} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {suggestion.description}
          </p>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={cn(
            "mt-1 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="pb-5 pl-12 pr-4">
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Details
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{suggestion.description}</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                Recommended Fix
              </p>
              <p className="text-sm leading-relaxed">{suggestion.recommendedFix}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
