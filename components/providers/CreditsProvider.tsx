"use client";

import { useEffect } from "react";

import { useSession } from "@/lib/auth/client";
import { useCreditsStore } from "@/lib/stores";

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isLoaded = useCreditsStore((s) => s.isLoaded);
  const setCredits = useCreditsStore((s) => s.setCredits);

  useEffect(() => {
    if (!session?.user || isLoaded) return;

    let cancelled = false;

    async function fetchCredits() {
      try {
        const res = await fetch("/api/billing/credits");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCredits({
            plan: data.plan,
            credits: data.credits,
            creditsUsed: data.creditsUsed,
            creditsTotal: data.creditsTotal,
          });
        }
      } catch {
        // Silently fail — store keeps defaults
      }
    }

    fetchCredits();

    return () => {
      cancelled = true;
    };
  }, [session?.user, isLoaded, setCredits]);

  return <>{children}</>;
}
