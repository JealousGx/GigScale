"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.checkout({ slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const openPortal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.customer.portal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open portal",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { checkout, openPortal, isLoading, error };
}
