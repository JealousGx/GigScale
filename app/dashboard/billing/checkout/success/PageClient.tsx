"use client";

import { CheckCircle, CreditCard, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Link as CustomLink } from "@/components/ui/link";

import { getPlanById } from "@/config/plans";
import { useCreditsStore } from "@/lib/stores";

const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: `confetti-${i}`,
  left: `${Math.random() * 100}%`,
  color:
    i % 5 === 0
      ? "bg-primary"
      : i % 5 === 1
        ? "bg-chart-1"
        : i % 5 === 2
          ? "bg-chart-2"
          : i % 5 === 3
            ? "bg-chart-4"
            : "bg-chart-5",
}));

export default function CheckoutSuccessPage() {
  const plan = useCreditsStore((s) => s.plan);
  const credits = useCreditsStore((s) => s.creditsTotal);
  const setCredits = useCreditsStore((s) => s.setCredits);
  const planDetails = getPlanById(plan);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;

    async function syncAndRefresh() {
      try {
        const creditsRes = await fetch("/api/billing/credits");
        if (creditsRes.ok) {
          const data = await creditsRes.json();
          if (data.plan !== "free") {
            setCredits(data);
            return;
          }
        }

        if (attempts < maxAttempts) {
          attempts++;
          await fetch("/api/billing/sync", { method: "POST" });
          const retryRes = await fetch("/api/billing/credits");
          if (retryRes.ok) {
            setCredits(await retryRes.json());
          }
        }
      } catch {
        // Will show stale store data
      }
    }
    syncAndRefresh();
  }, [setCredits]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI_PIECES.map((piece) => (
            <div
              key={piece.id}
              className={`absolute top-0 size-2 rounded-sm ${piece.color}`}
              style={{ left: piece.left }}
            />
          ))}
        </div>
      )}

      <div
        className="relative flex w-full max-w-lg flex-col items-center text-center"
      >
        <div
          className="mb-8 flex size-20 items-center justify-center rounded-full bg-primary/10"
        >
          <CheckCircle size={40} strokeWidth={1.5} className="text-primary" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>

        <p className="mt-3 max-w-sm text-base text-muted-foreground">
          Your credits have been added. Start scanning profiles, generating rewrites, and
          more.
        </p>

        <div
          className="mt-8 flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border/40 bg-muted/5 p-5"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CreditCard size={14} strokeWidth={1.5} />
              Plan
            </span>
            <span className="font-semibold">{planDetails?.name ?? "Pro"}</span>
          </div>
          <div className="h-px bg-border/30" />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Zap size={14} strokeWidth={1.5} />
              Credits
            </span>
            <span className="font-semibold tabular-nums">
              {credits ?? planDetails?.creditsPerMonth ?? "—"}
            </span>
          </div>
        </div>

        <div
          className="mt-10 flex items-center gap-3"
        >
          <CustomLink href="/dashboard" size="lg" className="rounded-xl px-8">
            <Sparkles size={16} strokeWidth={1.5} />
            Go to Dashboard
          </CustomLink>
          <CustomLink href="/dashboard/billing" variant="ghost" size="lg" className="rounded-xl px-6">
            View Billing
          </CustomLink>
        </div>
      </div>
    </div>
  );
}