import { apiClient } from "./apiClient";
import type { Plan } from "@/types";

export const billingService = {
  getCredits: () =>
    apiClient.get<{
      plan: Plan;
      credits: number;
      creditsUsed: number;
      creditsTotal: number;
    }>("/billing/credits"),
};
