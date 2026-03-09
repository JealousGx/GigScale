import { eq } from "drizzle-orm";

import { getDb } from "..";
import { subscriptions } from "../schema";

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
