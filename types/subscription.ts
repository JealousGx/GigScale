export type Plan = "free" | "pro" | "enterprise" | "custom";
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "past_due";

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  polarSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditBalance {
  total: number;
  used: number;
  remaining: number;
}
