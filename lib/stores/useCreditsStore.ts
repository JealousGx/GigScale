import { create } from "zustand";
import type { Plan } from "@/types";

interface CreditsStore {
  plan: Plan;
  credits: number;
  creditsUsed: number;
  creditsTotal: number;
  isLoaded: boolean;

  setPlan: (plan: Plan) => void;
  setCredits: (data: {
    plan: Plan;
    credits: number;
    creditsUsed: number;
    creditsTotal: number;
  }) => void;
  spendCredits: (amount: number) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useCreditsStore = create<CreditsStore>((set) => ({
  plan: "free",
  credits: 2,
  creditsUsed: 0,
  creditsTotal: 2,
  isLoaded: false,

  setPlan: (plan) => set({ plan }),
  setCredits: ({ plan, credits, creditsUsed, creditsTotal }) =>
    set({ plan, credits, creditsUsed, creditsTotal, isLoaded: true }),
  spendCredits: (amount) =>
    set((s) => ({
      credits: Math.max(0, s.credits - amount),
      creditsUsed: s.creditsUsed + amount,
    })),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
