import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { findSubscriptionByUserId } from "@/lib/db/queries/subscriptions";
import { countUserActionUsage } from "@/lib/db/queries/usage-logs";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subscription, pastScans] = await Promise.all([
    findSubscriptionByUserId(session.user.id),
    countUserActionUsage(session.user.id, "profile_scan"),
  ]);

  const freeScansRemaining = Math.max(0, 1 - pastScans);

  if (!subscription) {
    return NextResponse.json({
      plan: "free",
      credits: 0,
      creditsUsed: 0,
      creditsTotal: 0,
      freeScansRemaining,
    });
  }

  const remaining = Math.max(
    0,
    subscription.creditsTotal - subscription.creditsUsed,
  );

  return NextResponse.json({
    plan: subscription.plan,
    credits: remaining,
    creditsUsed: subscription.creditsUsed,
    creditsTotal: subscription.creditsTotal,
    freeScansRemaining,
  });
}
