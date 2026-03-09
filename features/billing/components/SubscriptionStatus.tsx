"use client";

import { CreditCard, ExternalLink, Sparkles, Zap } from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";

import { getPlanById } from "@/config/plans";
import { useCreditsStore } from "@/lib/stores";

export function SubscriptionStatus() {
  const plan = useCreditsStore((s) => s.plan);
  const planDetails = getPlanById(plan);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/40 bg-muted/5 p-6">
      <div className="mb-5 flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
        <CreditCard size={15} strokeWidth={1.5} />
        Current Plan
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {planDetails?.name ?? "Starter"}
          </span>
          {plan !== "free" && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Paid
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {planDetails?.creditsPerMonth} credits / month
        </p>
      </div>

      <div className="mt-auto space-y-3 border-t border-border/30 pt-5">
        {plan !== "free" ? (
          <CustomLink href="/dashboard/billing/manage" variant="outline" size="sm" className="w-full rounded-xl">
            <Sparkles size={14} strokeWidth={1.5} />
            Manage Subscription
            <ExternalLink size={12} strokeWidth={1.5} className="ml-auto opacity-50" />
          </CustomLink>
        ) : (
          <div className="flex items-center gap-2.5 text-sm">
            <Zap size={14} strokeWidth={1.5} className="text-primary" />
            <span className="text-muted-foreground">
              Upgrade for more credits &amp; features
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
