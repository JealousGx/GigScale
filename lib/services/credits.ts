import "server-only";

import { getCreditCost } from "@/config/plans";
import { getDb } from "@/lib/db";
import {
  findSubscriptionByUserId,
  incrementCreditsUsedIfAffordable,
} from "@/lib/db/queries/subscriptions";
import {
  countUserActionUsage,
  insertUsageLog,
} from "@/lib/db/queries/usage-logs";

type CreditAction =
  | "profile_scan"
  | "suggestion_generated"
  | "rewrite_generated"
  | "report_exported";

interface SpendResult {
  success: boolean;
  remaining: number;
  error?: string;
  wasFree?: boolean;
}

const FREE_SCAN_LIMIT = 1;

async function isFirstFreeScan(
  userId: string,
  action: CreditAction,
): Promise<boolean> {
  if (action !== "profile_scan") return false;
  const pastScans = await countUserActionUsage(userId, "profile_scan");
  return pastScans < FREE_SCAN_LIMIT;
}

export async function checkCredits(
  userId: string,
  action: CreditAction,
): Promise<{ hasEnough: boolean; cost: number; remaining: number }> {
  const cost = getCreditCost(action);

  if (action === "profile_scan") {
    const [pastScans, subscription] = await Promise.all([
      countUserActionUsage(userId, "profile_scan"),
      findSubscriptionByUserId(userId),
    ]);
    if (pastScans < FREE_SCAN_LIMIT) {
      return { hasEnough: true, cost: 0, remaining: 0 };
    }
    if (!subscription) {
      return { hasEnough: false, cost, remaining: 0 };
    }
    const remaining = Math.max(
      0,
      subscription.creditsTotal - subscription.creditsUsed,
    );
    return { hasEnough: remaining >= cost, cost, remaining };
  }

  const subscription = await findSubscriptionByUserId(userId);
  if (!subscription) {
    return { hasEnough: false, cost, remaining: 0 };
  }
  const remaining = Math.max(
    0,
    subscription.creditsTotal - subscription.creditsUsed,
  );
  return { hasEnough: remaining >= cost, cost, remaining };
}

export async function spendCredits(
  userId: string,
  action: CreditAction,
  metadata?: Record<string, unknown>,
): Promise<SpendResult> {
  const freeEligible = await isFirstFreeScan(userId, action);
  const cost = freeEligible ? 0 : getCreditCost(action);

  if (freeEligible) {
    await insertUsageLog({
      userId,
      action,
      creditsConsumed: cost,
      metadata: { ...metadata, freeEligible },
    });
    const subscription = await findSubscriptionByUserId(userId);
    const remaining = subscription
      ? Math.max(0, subscription.creditsTotal - subscription.creditsUsed)
      : 0;
    return { success: true, remaining, wasFree: true };
  }

  const subscription = await findSubscriptionByUserId(userId);
  if (!subscription) {
    return {
      success: false,
      remaining: 0,
      error: "No active plan. Please purchase credits to continue.",
    };
  }

  try {
    await getDb().transaction(async (tx) => {
      const affected = await incrementCreditsUsedIfAffordable(userId, cost, tx);
      if (affected === 0) {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      await insertUsageLog(
        {
          userId,
          action,
          creditsConsumed: cost,
          metadata: { ...metadata, freeEligible },
        },
        tx,
      );
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_CREDITS") {
      const sub = await findSubscriptionByUserId(userId);
      const remaining = sub
        ? Math.max(0, sub.creditsTotal - sub.creditsUsed)
        : 0;
      return {
        success: false,
        remaining,
        error: `Insufficient credits. Need ${cost}, have ${remaining}.`,
      };
    }
    throw e;
  }

  const remaining = Math.max(
    0,
    subscription.creditsTotal - subscription.creditsUsed - cost,
  );
  return { success: true, remaining, wasFree: false };
}
