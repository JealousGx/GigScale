export type PlanId = "free" | "pro" | "enterprise" | "custom";

export interface CreditCost {
  action: string;
  label: string;
  credits: number;
}

export interface PlanDetails {
  id: PlanId;
  name: string;
  price: number | null;
  interval: "month" | "year" | null;
  description: string;
  creditsPerMonth: number | null;
  features: string[];
  lockedFeatures?: string[];
  highlighted?: boolean;
  slug: string;
  isContactSales?: boolean;
}

export const CREDIT_COSTS: CreditCost[] = [
  { action: "profile_scan", label: "Profile Scan", credits: 3 },
  { action: "rewrite_generated", label: "AI Rewrite", credits: 5 },
  { action: "suggestion_generated", label: "AI Suggestion", credits: 1 },
  { action: "report_exported", label: "Report Export", credits: 2 },
];

export function getCreditCost(action: string): number {
  return CREDIT_COSTS.find((c) => c.action === action)?.credits ?? 1;
}

export const PLAN_FEATURE_ACCESS: Record<PlanId, string[]> = {
  free: ["profile_scan", "suggestion_generated"],
  pro: [
    "profile_scan",
    "suggestion_generated",
    "rewrite_generated",
    "report_exported",
  ],
  enterprise: [
    "profile_scan",
    "suggestion_generated",
    "rewrite_generated",
    "report_exported",
  ],
  custom: [
    "profile_scan",
    "suggestion_generated",
    "rewrite_generated",
    "report_exported",
  ],
};

export function canAccessFeature(plan: PlanId, action: string): boolean {
  return PLAN_FEATURE_ACCESS[plan]?.includes(action) ?? false;
}

export const plans: PlanDetails[] = [
  {
    id: "free",
    name: "Starter",
    slug: "starter",
    price: 0,
    interval: "month",
    description: "Try GigScale with a limited free trial",
    creditsPerMonth: 2,
    features: [
      "2 credits total (lifetime)",
      "Profile scans (3 credits each)",
      "Basic AI suggestions (1 credit each)",
    ],
    lockedFeatures: ["AI Rewrites", "Report Export"],
  },
  {
    id: "pro",
    name: "Pro",
    slug: "Pro",
    price: 19,
    interval: "month",
    description: "Full access to all optimization tools",
    creditsPerMonth: 150,
    features: [
      "150 credits",
      "All services unlocked",
      "AI rewrites (5 credits each)",
      "Report exports (2 credits each)",
      "Detailed score analytics",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    slug: "Enterprise",
    price: 49,
    interval: "month",
    description: "For agencies and power freelancers",
    creditsPerMonth: 500,
    features: [
      "500 credits",
      "All services unlocked",
      "Multi-profile management",
      "Team collaboration",
      "API access",
      "Dedicated support",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    slug: "custom",
    price: null,
    interval: null,
    description: "Tailored for your unique needs",
    creditsPerMonth: null,
    features: [
      "Custom credit allocation",
      "All services unlocked",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & uptime guarantees",
      "White-label options",
    ],
    isContactSales: true,
  },
];

export function getPlanById(id: PlanId): PlanDetails | undefined {
  return plans.find((p) => p.id === id);
}

export function getRequiredPlanForFeature(action: string): PlanId {
  if (PLAN_FEATURE_ACCESS.free.includes(action)) return "free";
  if (PLAN_FEATURE_ACCESS.pro.includes(action)) return "pro";
  return "enterprise";
}
