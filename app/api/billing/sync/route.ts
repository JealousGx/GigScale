import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { type PlanId, plans } from "@/config/plans";
import { auth } from "@/lib/auth";
import { upsertSubscription } from "@/lib/db/queries/subscriptions";
import { env } from "@/lib/env";
import { polarClient } from "@/lib/polar";

function resolvePlanFromProductId(productId: string): PlanId {
  const productToPlan: Record<string, PlanId> = {
    [env.POLAR_PRO_PRODUCT_ID]: "pro",
    [env.POLAR_ENTERPRISE_PRODUCT_ID]: "enterprise",
  };
  return productToPlan[productId] ?? "pro";
}

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const email = session.user.email;

    const { result: customers } = await polarClient.customers.list({
      email,
    });

    const customer = customers.items[0];
    if (!customer) {
      console.log(`[Billing Sync] No Polar customer found for ${email}`);
      return NextResponse.json({ synced: false, reason: "no_customer" });
    }

    if (customer.externalId !== userId) {
      await polarClient.customers.update({
        id: customer.id,
        customerUpdate: { externalId: userId },
      });
      console.log(
        `[Billing Sync] Linked Polar customer ${customer.id} to user ${userId}`,
      );
    }

    const { result: subscriptions } = await polarClient.subscriptions.list({
      customerId: customer.id,
      active: true,
    });

    const activeSub = subscriptions.items[0];
    if (!activeSub) {
      console.log(`[Billing Sync] No active subscription for user=${userId}`);
      return NextResponse.json({ synced: false, reason: "no_subscription" });
    }

    const plan = resolvePlanFromProductId(activeSub.productId);
    const planConfig = plans.find((p) => p.id === plan);
    const creditsTotal = planConfig?.creditsPerMonth ?? 150;

    await upsertSubscription(userId, {
      plan,
      status: "active",
      creditsTotal,
      creditsUsed: 0,
      polarSubscriptionId: activeSub.id,
      currentPeriodStart: activeSub.currentPeriodStart,
      currentPeriodEnd: activeSub.currentPeriodEnd,
    });

    console.log(
      `[Billing Sync] Synced: user=${userId} plan=${plan} credits=${creditsTotal}`,
    );

    return NextResponse.json({
      synced: true,
      plan,
      creditsTotal,
    });
  } catch (error) {
    console.error("[Billing Sync] Failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
