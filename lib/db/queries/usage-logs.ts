import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "..";
import { usageLogs } from "../schema";

type UsageAction =
  | "profile_scan"
  | "suggestion_generated"
  | "rewrite_generated"
  | "report_exported";

export async function insertUsageLog(data: {
  userId: string;
  action: UsageAction;
  creditsConsumed: number;
  metadata?: Record<string, unknown>;
}) {
  await getDb().insert(usageLogs).values(data);
}

export async function findUsageLogsByUserId(userId: string) {
  return getDb().select().from(usageLogs).where(eq(usageLogs.userId, userId));
}
