"use client";

import { useSession } from "@/lib/auth/client";
import { useCredits } from "@/features/billing/hooks/useCredits";

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Only fetch credits when user is authenticated.
  // The hook manages TanStack Query + Zustand sync automatically.
  if (session?.user) {
    return <CreditsLoader>{children}</CreditsLoader>;
  }

  return <>{children}</>;
}

function CreditsLoader({ children }: { children: React.ReactNode }) {
  useCredits();
  return <>{children}</>;
}
