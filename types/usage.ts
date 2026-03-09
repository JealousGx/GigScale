export type UsageAction =
  | "profile_scan"
  | "suggestion_generated"
  | "rewrite_generated"
  | "report_exported";

export interface UsageLog {
  id: string;
  userId: string;
  action: UsageAction;
  creditsConsumed: number;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
}
