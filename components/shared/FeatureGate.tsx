"use client";

import { Lock } from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";
import {
  canAccessFeature,
  getPlanById,
  getRequiredPlanForFeature,
} from "@/config/plans";
import { useCreditsStore } from "@/lib/stores";

interface FeatureGateProps {
  action: string;
  children: React.ReactNode;
}

export function FeatureGate({ action, children }: FeatureGateProps) {
  const plan = useCreditsStore((s) => s.plan);
  const hasAccess = canAccessFeature(plan, action);

  if (hasAccess) return <>{children}</>;

  const requiredPlan = getRequiredPlanForFeature(action);
  const planDetails = getPlanById(requiredPlan);

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border/60 bg-background/95 px-8 py-10 text-center shadow-xl backdrop-blur-md">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Lock size={22} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {planDetails?.name} Plan Required
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This feature is only available to{" "}
              <span className="font-medium text-foreground">
                {planDetails?.name}
              </span>{" "}
              plan users. Upgrade to unlock full access.
            </p>
          </div>
          <CustomLink href="/dashboard/billing" variant="default" className="rounded-xl px-6">
            Upgrade to {planDetails?.name}
          </CustomLink>
        </div>
      </div>
    </div>
  );
}
