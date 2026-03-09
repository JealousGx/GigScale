import "server-only";

import { getCreditCost } from "@/config/plans";
import {
  findSubscriptionByUserId,
  updateSubscription,
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
  const freeEligible = await isFirstFreeScan(userId, action);
  if (freeEligible) return { hasEnough: true, cost: 0, remaining: 0 };

  const cost = getCreditCost(action);
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
  const subscription = await findSubscriptionByUserId(userId);

  if (!freeEligible) {
    if (!subscription) {
      return {
        success: false,
        remaining: 0,
        error: "No active plan. Please purchase credits to continue.",
      };
    }

    const remaining = Math.max(
      0,
      subscription.creditsTotal - subscription.creditsUsed,
    );

    if (remaining < cost) {
      return {
        success: false,
        remaining,
        error: `Insufficient credits. Need ${cost}, have ${remaining}.`,
      };
    }

    await updateSubscription(userId, {
      creditsUsed: subscription.creditsUsed + cost,
    });
  }

  await insertUsageLog({
    userId,
    action,
    creditsConsumed: cost,
    metadata: { ...metadata, freeEligible },
  });

  const remaining = subscription
    ? Math.max(0, subscription.creditsTotal - subscription.creditsUsed - cost)
    : 0;

  return { success: true, remaining, wasFree: freeEligible };
}
