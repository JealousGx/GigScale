"use client";

import { CheckCircle, CreditCard, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Link as CustomLink } from "@/components/ui/link";

import { getPlanById } from "@/config/plans";
import { useCreditsStore } from "@/lib/stores";

const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => ({
  id: `confetti-${i}`,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 0.5,
  duration: 1.8 + Math.random() * 1.2,
  rotation: Math.random() * 360,
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
    async function refreshCredits() {
      try {
        const res = await fetch("/api/billing/credits");
        if (!res.ok) return;
        const data = await res.json();
        setCredits(data);
      } catch {
        // Will show stale store data
      }
    }
    refreshCredits();
  }, [setCredits]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden">
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI_PIECES.map((piece) => (
            <motion.div
              key={piece.id}
              className={`absolute top-0 size-2 rounded-sm ${piece.color}`}
              style={{ left: piece.left }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                rotate: piece.rotation,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="relative flex w-full max-w-lg flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="mb-8 flex size-20 items-center justify-center rounded-full bg-primary/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.15,
          }}
        >
          <CheckCircle size={40} strokeWidth={1.5} className="text-primary" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          You&apos;re all set!
        </motion.h1>

        <motion.p
          className="mt-3 max-w-sm text-base text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          Your subscription is now active. Start using your credits to scan
          profiles, generate rewrites, and more.
        </motion.p>

        <motion.div
          className="mt-8 flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-border/40 bg-muted/5 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
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
              {credits ?? planDetails?.creditsPerMonth ?? "—"} / month
            </span>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <CustomLink href="/dashboard" size="lg" className="rounded-xl px-8">
            <Sparkles size={16} strokeWidth={1.5} />
            Go to Dashboard
          </CustomLink>
          <CustomLink href="/dashboard/billing" variant="ghost" size="lg" className="rounded-xl px-6">
            View Billing
          </CustomLink>
        </motion.div>
      </motion.div>
    </div>
  );
}
