"use client";

import { randomUUID } from "node:crypto";

import { Skeleton } from "@/components/ui/skeleton";

import type { Priority, Suggestion } from "@/types";

import { SuggestionCard } from "./SuggestionCard";

interface SuggestionsListProps {
  suggestions: Suggestion[];
  isLoading: boolean;
}

const priorityOrder: Priority[] = ["critical", "high", "medium", "low"];

export function SuggestionsList({ suggestions, isLoading }: SuggestionsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skeleton-${randomUUID()}`} className="flex items-start gap-4 py-5">
            <Skeleton className="size-7 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-2xl bg-muted/40 p-4">
          <span className="text-3xl">💡</span>
        </div>
        <h3 className="text-sm font-medium">No suggestions yet</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Run a profile analysis first to get AI-powered improvement suggestions
        </p>
      </div>
    );
  }

  const sorted = [...suggestions].sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""} found
        </p>
      </div>
      <div>
        {sorted.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
