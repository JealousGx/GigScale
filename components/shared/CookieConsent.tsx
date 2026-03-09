"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gigscale-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(CONSENT_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl items-center gap-4 rounded-2xl border border-border/50 bg-background/95 px-5 py-3.5 shadow-lg backdrop-blur-sm">
        <p className="flex-1 text-sm text-muted-foreground">
          We use essential cookies for authentication and session management. No
          tracking or advertising cookies are used.{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={accept} className="rounded-xl">
            Accept
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
