"use client";

import { CircleCheck, Coins, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link as CustomLink } from "@/components/ui/link";

import type { PlanDetails } from "@/config/plans";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

interface PlanCardProps {
  plan: PlanDetails;
  currentPlan: Plan;
  onSelect: (slug: string) => void;
  isLoading: boolean;
}

export function PlanCard({
  plan,
  currentPlan,
  onSelect,
  isLoading,
}: PlanCardProps) {
  const isCurrent = currentPlan === plan.id;
  const isCustom = plan.isContactSales;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
        plan.highlighted
          ? "border-primary/30 bg-linear-to-b from-primary/4 to-transparent shadow-sm"
          : "border-border/40 hover:border-border/60",
        isCurrent && "ring-2 ring-primary/20",
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">
          Most Popular
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-base font-semibold">{plan.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <div className="mb-2 flex items-baseline gap-1">
        {isCustom ? (
          <span className="text-3xl font-bold tracking-tight">Custom</span>
        ) : (
          <>
            <span className="text-3xl font-bold tracking-tight">
              ${plan.price}
            </span>
            {/* <span className="text-xs text-muted-foreground">
              /{plan.interval}
            </span> */}
          </>
        )}
      </div>

      <div className="mb-5 flex items-center gap-1.5 text-sm font-medium text-primary">
        <Coins size={14} strokeWidth={1.5} />
        {isCustom ? "Custom credit allocation" : `${plan.creditsPerMonth} credits`}
      </div>

      <div className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <CircleCheck
              size={14}
              strokeWidth={2}
              className={cn(
                "mt-0.5 shrink-0",
                plan.highlighted
                  ? "text-primary"
                  : "text-muted-foreground/60",
              )}
            />
            <span className="text-[13px] leading-snug">{feature}</span>
          </div>
        ))}
      </div>

      {isCustom ? (
        <CustomLink href={`mailto:${env.NEXT_PUBLIC_SALES_EMAIL}`} variant="outline" size="sm" className="w-full rounded-xl">
          <Mail size={14} strokeWidth={1.5} />
          Contact Sales
        </CustomLink>
      ) : (
        <Button
          variant={
            isCurrent ? "secondary" : plan.highlighted ? "default" : "outline"
          }
          size="sm"
          className="w-full rounded-xl"
          onClick={() => onSelect(plan.slug)}
          disabled={isCurrent || isLoading || plan.price === 0}
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isCurrent ? (
            "Current Plan"
          ) : plan.price === 0 ? (
            "Free Tier"
          ) : (
            `Upgrade to ${plan.name}`
          )}
        </Button>
      )}
    </div>
  );
}
