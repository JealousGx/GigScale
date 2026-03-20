"use client";

import { AlertTriangle, ArrowLeft, LifeBuoy, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Link as CustomLink } from "@/components/ui/link";

import { siteConfig } from "@/config/site";

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
      <div
        className="flex w-full max-w-lg flex-col items-center text-center"
      >
        <div
          className="mb-8 flex size-20 items-center justify-center rounded-full bg-destructive/10"
        >
          <AlertTriangle
            size={40}
            strokeWidth={1.5}
            className="text-destructive"
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Checkout unsuccessful
        </h1>

        <p className="mt-3 max-w-sm text-base text-muted-foreground">{message}</p>

        <div className="mt-8 w-full max-w-xs rounded-2xl border border-border/40 bg-muted/5 p-5">
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
        </div>

        <div className="mt-10 flex items-center gap-3">
          <CustomLink href="/dashboard/billing" size="lg" className="rounded-xl px-8">
            <RotateCcw size={16} strokeWidth={1.5} />
            Try Again
          </CustomLink>
          <CustomLink href="/dashboard" variant="ghost" size="lg" className="rounded-xl px-6">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Dashboard
          </CustomLink>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Charged but didn&apos;t receive credits?{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
