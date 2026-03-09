"use client";

import { AlertTriangle, ArrowLeft, LifeBuoy, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";

import { Link as CustomLink } from "@/components/ui/link";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "You cancelled the checkout before completing payment.",
  expired: "Your checkout session expired. Please try again.",
  declined: "Your payment was declined. Please check your card details.",
};

const DEFAULT_MESSAGE =
  "Something went wrong during checkout. No charges were made to your account.";

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const message =
    (reason && ERROR_MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <motion.div
        className="flex w-full max-w-lg flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="mb-8 flex size-20 items-center justify-center rounded-full bg-destructive/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.15,
          }}
        >
          <AlertTriangle
            size={40}
            strokeWidth={1.5}
            className="text-destructive"
          />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          Checkout unsuccessful
        </motion.h1>

        <motion.p
          className="mt-3 max-w-sm text-base text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="mt-8 w-full max-w-xs rounded-2xl border border-border/40 bg-muted/5 p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            What you can do
          </p>
          <ul className="mt-3 space-y-2.5 text-left text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <RotateCcw
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-foreground"
              />
              Try again with a different payment method
            </li>
            <li className="flex items-start gap-2.5">
              <LifeBuoy
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-foreground"
              />
              Contact support if the issue persists
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="mt-10 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <CustomLink href="/dashboard/billing" size="lg" className="rounded-xl px-8">
            <RotateCcw size={16} strokeWidth={1.5} />
            Try Again
          </CustomLink>
          <CustomLink href="/dashboard" variant="ghost" size="lg" className="rounded-xl px-6">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Dashboard
          </CustomLink>
        </motion.div>
      </motion.div>
    </div>
  );
}
