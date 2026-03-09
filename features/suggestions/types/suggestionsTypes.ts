import type { Priority, Suggestion } from "@/types";

export interface SuggestionsState {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
}

export const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string; dotColor: string; label: string }> = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive", label: "Critical" },
  high: { color: "text-chart-2", bg: "bg-chart-2/10", dotColor: "bg-chart-2", label: "High" },
  medium: { color: "text-chart-3", bg: "bg-chart-3/10", dotColor: "bg-chart-3", label: "Medium" },
  low: { color: "text-chart-1", bg: "bg-chart-1/10", dotColor: "bg-chart-1", label: "Low" },
};
