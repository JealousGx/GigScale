import "server-only";

import { and, eq, sql } from "drizzle-orm";
import type { ResultSetHeader } from "mysql2/promise";
import { getDb } from "..";
import type { LocalDb } from "../local";
import { subscriptions } from "../schema";

/**
 * mysql2 returns `[ResultSetHeader, FieldPacket[]]`; TiDB serverless returns a
 * `FullResult` with `rowsAffected`. Drizzle passes through either shape.
 */
function affectedRowsFromUpdate(result: unknown): number {
  if (result == null) return 0;
  if (Array.isArray(result) && result[0]) {
    const header = result[0] as ResultSetHeader;
    if (typeof header.affectedRows === "number") return header.affectedRows;
  }
  if (typeof result === "object") {
    const r = result as Record<string, unknown>;
    const n =
      (typeof r.rowsAffected === "number" ? r.rowsAffected : undefined) ??
      (typeof r.affectedRows === "number" ? r.affectedRows : undefined) ??
      (typeof r.rowCount === "number" ? r.rowCount : undefined);
    if (typeof n === "number") return n;
  }
  return 0;
}

type DbExecutor =
  | LocalDb
  | Parameters<Parameters<LocalDb["transaction"]>[0]>[0];

/**
 * Atomically increments credits_used only if credits_total - credits_used >= cost.
 * Pass `tx` from `getDb().transaction(...)` to pair with `insertUsageLog` in one commit.
 */
export async function incrementCreditsUsedIfAffordable(
  userId: string,
  cost: number,
  db: DbExecutor = getDb(),
): Promise<number> {
  const result = await db
    .update(subscriptions)
    .set({
      creditsUsed: sql`${subscriptions.creditsUsed} + ${cost}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(subscriptions.userId, userId),
        sql`(${subscriptions.creditsTotal} - ${subscriptions.creditsUsed}) >= ${cost}`,
      ),
    );
  return affectedRowsFromUpdate(result);
}

export async function findSubscriptionByUserId(userId: string) {
  const rows = await getDb()
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSubscription(
  userId: string,
  data: {
    plan: "free" | "pro" | "enterprise" | "custom";
    status: "active" | "inactive" | "cancelled" | "past_due";
    creditsTotal: number;
    creditsUsed: number;
    polarSubscriptionId: string | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
  },
) {
  const existing = await findSubscriptionByUserId(userId);

  if (existing) {
    await getDb()
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.userId, userId));
  } else {
    await getDb()
      .insert(subscriptions)
      .values({ userId, ...data });
  }
}

export async function updateSubscription(
  userId: string,
  data: Partial<{
    plan: "free" | "pro" | "enterprise" | "custom";
    status: "active" | "inactive" | "cancelled" | "past_due";
    creditsTotal: number;
    creditsUsed: number;
    polarSubscriptionId: string | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
  }>,
) {
  await getDb()
    .update(subscriptions)
    .set(data)
    .where(eq(subscriptions.userId, userId));
}
