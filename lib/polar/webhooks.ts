import type { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload.js";
import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js";
import type { WebhookSubscriptionCanceledPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js";
import type { WebhookSubscriptionRevokedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js";
import type { WebhookSubscriptionUncanceledPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionuncanceledpayload.js";
import type { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";

import { type PlanId, plans } from "@/config/plans";
import {
  updateSubscription,
  upsertSubscription,
} from "@/lib/db/queries/subscriptions";
import { env } from "@/lib/env";

function resolvePlanFromProductId(productId: string): PlanId {
  const productToPlan: Record<string, PlanId> = {
    [env.POLAR_PRO_PRODUCT_ID]: "pro",
    [env.POLAR_ENTERPRISE_PRODUCT_ID]: "enterprise",
  };
  return productToPlan[productId] ?? "pro";
}

function resolveUserId(
  data: { customer: { externalId?: string | null } },
  eventName: string,
): string | null {
  const userId = data.customer.externalId;
  if (!userId) {
    console.error(
      `[Polar Webhook] ${eventName}: No externalId on customer — cannot map to user. Customer:`,
      JSON.stringify(data.customer),
    );
    return null;
  }
  return userId;
}

export async function handleSubscriptionActive({
  data,
}: WebhookSubscriptionActivePayload) {
  const userId = resolveUserId(data, "subscription.active");
  if (!userId) return;

  try {
    const plan = resolvePlanFromProductId(data.productId);
    const planConfig = plans.find((p) => p.id === plan);
    const creditsTotal = planConfig?.creditsPerMonth ?? 150;

    await upsertSubscription(userId, {
      plan,
      status: "active",
      creditsTotal,
      creditsUsed: 0,
      polarSubscriptionId: data.id,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    });

    console.log(
      `[Polar Webhook] Subscription active: user=${userId} plan=${plan} credits=${creditsTotal}`,
    );
  } catch (error) {
    console.error(
      `[Polar Webhook] subscription.active FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}

export async function handleSubscriptionCanceled({
  data,
}: WebhookSubscriptionCanceledPayload) {
  const userId = resolveUserId(data, "subscription.canceled");
  if (!userId) return;

  try {
    await updateSubscription(userId, { status: "cancelled" });
    console.log(`[Polar Webhook] Subscription canceled: user=${userId}`);
  } catch (error) {
    console.error(
      `[Polar Webhook] subscription.canceled FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}

export async function handleSubscriptionRevoked({
  data,
}: WebhookSubscriptionRevokedPayload) {
  const userId = resolveUserId(data, "subscription.revoked");
  if (!userId) return;

  try {
    await updateSubscription(userId, {
      status: "inactive",
      plan: "free",
      creditsTotal: 2,
      creditsUsed: 0,
      polarSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
    });

    console.log(
      `[Polar Webhook] Subscription revoked — downgraded to free: user=${userId}`,
    );
  } catch (error) {
    console.error(
      `[Polar Webhook] subscription.revoked FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}

export async function handleSubscriptionUncanceled({
  data,
}: WebhookSubscriptionUncanceledPayload) {
  const userId = resolveUserId(data, "subscription.uncanceled");
  if (!userId) return;

  try {
    await updateSubscription(userId, { status: "active" });
    console.log(`[Polar Webhook] Subscription uncanceled: user=${userId}`);
  } catch (error) {
    console.error(
      `[Polar Webhook] subscription.uncanceled FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}

export async function handleSubscriptionUpdated({
  data,
}: WebhookSubscriptionUpdatedPayload) {
  const userId = resolveUserId(data, "subscription.updated");
  if (!userId) return;

  try {
    const plan = resolvePlanFromProductId(data.productId);
    const planConfig = plans.find((p) => p.id === plan);
    const creditsTotal = planConfig?.creditsPerMonth ?? 150;

    await updateSubscription(userId, {
      plan,
      creditsTotal,
      polarSubscriptionId: data.id,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
    });

    console.log(
      `[Polar Webhook] Subscription updated: user=${userId} plan=${plan}`,
    );
  } catch (error) {
    console.error(
      `[Polar Webhook] subscription.updated FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}

export async function handleOrderPaid({ data }: WebhookOrderPaidPayload) {
  const userId = resolveUserId(data, "order.paid");
  if (!userId) return;

  try {
    if (data.subscription && data.productId) {
      const plan = resolvePlanFromProductId(data.productId);
      const planConfig = plans.find((p) => p.id === plan);
      const creditsTotal = planConfig?.creditsPerMonth ?? 150;

      await upsertSubscription(userId, {
        plan,
        status: "active",
        creditsTotal,
        creditsUsed: 0,
        polarSubscriptionId: data.subscription.id,
        currentPeriodStart: data.subscription.currentPeriodStart,
        currentPeriodEnd: data.subscription.currentPeriodEnd,
      });

      console.log(
        `[Polar Webhook] Order paid — credits synced: user=${userId} plan=${plan} credits=${creditsTotal}`,
      );
    } else {
      console.log(
        `[Polar Webhook] Order paid (one-time): user=${userId} order=${data.id}`,
      );
    }
  } catch (error) {
    console.error(
      `[Polar Webhook] order.paid FAILED for user=${userId}:`,
      error,
    );
    throw error;
  }
}
