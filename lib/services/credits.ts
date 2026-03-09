import "server-only";

import { getCreditCost } from "@/config/plans";
import {
  findSubscriptionByUserId,
  updateSubscription,
} from "@/lib/db/queries/subscriptions";
import { insertUsageLog } from "@/lib/db/queries/usage-logs";

type CreditAction =
  | "profile_scan"
  | "suggestion_generated"
  | "rewrite_generated"
  | "report_exported";

interface SpendResult {
  success: boolean;
  remaining: number;
  error?: string;
}

export async function checkCredits(
  userId: string,
  action: CreditAction,
): Promise<{ hasEnough: boolean; cost: number; remaining: number }> {
  const cost = getCreditCost(action);
  const subscription = await findSubscriptionByUserId(userId);

  if (!subscription) {
    return { hasEnough: cost <= 2, cost, remaining: 2 };
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
  const { hasEnough, cost, remaining } = await checkCredits(userId, action);

  if (!hasEnough) {
    return {
      success: false,
      remaining,
      error: `Insufficient credits. Need ${cost}, have ${remaining}.`,
    };
  }

  const subscription = await findSubscriptionByUserId(userId);

  if (subscription) {
    await updateSubscription(userId, {
      creditsUsed: subscription.creditsUsed + cost,
    });
  }

  await insertUsageLog({
    userId,
    action,
    creditsConsumed: cost,
    metadata,
  });

  return { success: true, remaining: remaining - cost };
}
