import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { findSubscriptionByUserId } from "@/lib/db/queries/subscriptions";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await findSubscriptionByUserId(session.user.id);

  if (!subscription) {
    return NextResponse.json({
      plan: "free",
      credits: 2,
      creditsUsed: 0,
      creditsTotal: 2,
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
  });
}
