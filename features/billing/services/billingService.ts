import { apiClient } from "@/services/apiClient";
import type { Plan } from "@/types";

export const featureBillingService = {
  getCredits: async (): Promise<{
    plan: Plan;
    credits: number;
    creditsUsed: number;
    creditsTotal: number;
  }> => {
    return apiClient.get("/billing/credits");
  },
};
