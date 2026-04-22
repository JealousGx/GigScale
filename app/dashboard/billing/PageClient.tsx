"use client";

import { plans } from "@/config/plans";
import { CreditsDisplay } from "@/features/billing/components/CreditsDisplay";
import { PlanCard } from "@/features/billing/components/PlanCard";
import { SubscriptionStatus } from "@/features/billing/components/SubscriptionStatus";
import { useBilling } from "@/features/billing/hooks/useBilling";
import { useCreditsStore } from "@/lib/stores";

export default function BillingPage() {
  const plan = useCreditsStore((s) => s.plan);
  const { checkout, isLoading } = useBilling();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and credits
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatus />
        <CreditsDisplay />
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Available Plans
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              currentPlan={plan}
              onSelect={checkout}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <a href="/billing-policy" className="transition-colors hover:text-foreground">
          Billing &amp; Credits Policy
        </a>
        <a href="/refund-policy" className="transition-colors hover:text-foreground">
          Refund Policy
        </a>
        <a href="/terms" className="transition-colors hover:text-foreground">
          Terms of Service
        </a>
      </div>
    </div>
  );
}