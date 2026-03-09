import "server-only";

import { and, count, eq } from "drizzle-orm";
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

export async function countUserActionUsage(
  userId: string,
  action: UsageAction,
): Promise<number> {
  const [row] = await getDb()
    .select({ total: count() })
    .from(usageLogs)
    .where(
      and(eq(usageLogs.userId, userId), eq(usageLogs.action, action)),
    );
  return row?.total ?? 0;
}
