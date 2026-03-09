"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Link as CustomLink } from "@/components/ui/link";

import { getPlanById } from "@/config/plans";
import { authClient } from "@/lib/auth/client";
import { useCreditsStore } from "@/lib/stores";

const stagger = (i: number) => ({ delay: 0.08 * i, duration: 0.35 });

export default function ManageSubscriptionPage() {
  const plan = useCreditsStore((s) => s.plan);
  const { credits, creditsUsed, creditsTotal } = useCreditsStore();
  const planDetails = getPlanById(plan);
  const [isOpening, setIsOpening] = useState(false);

  const openPortal = async () => {
    setIsOpening(true);
    try {
      await authClient.customer.portal();
    } catch {
      setIsOpening(false);
    }
  };

  const isPaid = plan !== "free";

  const actions = [
    {
      icon: CreditCard,
      title: "Payment Method",
      description: "Update your card or payment details",
    },
    {
      icon: FileText,
      title: "Invoices & Receipts",
      description: "View and download past invoices",
    },
    {
      icon: RefreshCw,
      title: "Change Plan",
      description: "Upgrade, downgrade, or switch billing cycle",
    },
    {
      icon: XCircle,
      title: "Cancel Subscription",
      description: "Cancel your plan at the end of the billing period",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/dashboard/billing"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Billing
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Subscription
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your subscription through Polar&apos;s secure customer
          portal
        </p>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-border/40 bg-muted/5 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(1)}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Plan
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {planDetails?.name ?? "Starter"}
              </span>
              {isPaid && (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Active
                </span>
              )}
            </div>
            {planDetails?.price != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                ${planDetails.price}/{planDetails.interval}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Credits
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
              {credits}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {creditsTotal}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {creditsUsed} used
            </p>
          </div>
        </div>
      </motion.div>

      {isPaid ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(2)}
          >
            <Button
              size="lg"
              className="w-full rounded-xl py-6 text-base"
              onClick={openPortal}
              disabled={isOpening}
            >
              {isOpening ? (
                <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <ArrowUpRight size={18} strokeWidth={1.5} />
              )}
              {isOpening ? "Opening Portal…" : "Open Customer Portal"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              You&apos;ll be redirected to Polar&apos;s secure portal to manage
              your subscription
            </p>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(3)}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              What you can do in the portal
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={openPortal}
                  disabled={isOpening}
                  className="flex items-start gap-3.5 rounded-xl border border-border/40 bg-muted/5 p-4 text-left transition-colors hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon
                      size={16}
                      strokeWidth={1.5}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2.5 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={stagger(4)}
          >
            <ShieldCheck size={14} strokeWidth={1.5} />
            Payments are securely processed by Polar. GigScale never stores your
            card details.
          </motion.div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border/60 py-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(2)}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted/30">
            <CreditCard
              size={22}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>
          <div>
            <p className="font-medium">No active subscription</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upgrade to a paid plan to access the customer portal
            </p>
          </div>
          <CustomLink href="/dashboard/billing" className="rounded-xl px-6">
            View Plans
          </CustomLink>
        </motion.div>
      )}
    </div>
  );
}
