import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/shared/LegalArticle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Billing & Credits Policy",
  description: `Billing and Credits Policy for ${siteConfig.name}. Understand how credit packs, one-time payments, and credits work.`,
};

export default function BillingPolicyPage() {
  const lastUpdated = "March 9, 2026";

  return (
    <LegalArticle>
      <h1>Billing &amp; Credits Policy</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <p>
        This policy explains how billing, credit packs, and payments work on{" "}
        {siteConfig.name}. By purchasing credits or using the Service, you agree
        to the terms outlined below.
      </p>

      <h2>1. Credit Packs</h2>
      <p>
        {siteConfig.name} operates on a credit-based system. Credits are
        purchased as <strong>one-time payments</strong> — there are no recurring
        subscriptions. The following credit packs are available:
      </p>
      <ul>
        <li>
          <strong>Starter (Free):</strong> 2 credits included with every new
          account. Includes access to profile scans and basic AI suggestions.
        </li>
        <li>
          <strong>Pro ($19):</strong> 150 credits with full access to all
          features including AI rewrites, report exports, and detailed
          analytics.
        </li>
        <li>
          <strong>Enterprise ($49):</strong> 500 credits with multi-profile
          management, team collaboration, API access, and dedicated support.
        </li>
        <li>
          <strong>Custom:</strong> Tailored credit packs with custom
          allocations. Contact our sales team for pricing.
        </li>
      </ul>

      <h2>2. How Credits Work</h2>
      <p>
        Credits are the currency used to access {siteConfig.name}&apos;s
        features. Each action consumes a specific number of credits:
      </p>
      <ul>
        <li>
          <strong>Profile Scan:</strong> 3 credits per scan
        </li>
        <li>
          <strong>AI Suggestion:</strong> 1 credit per suggestion set
        </li>
        <li>
          <strong>AI Rewrite:</strong> 5 credits per rewrite (Pro and above)
        </li>
        <li>
          <strong>Report Export:</strong> 2 credits per export (Pro and above)
        </li>
      </ul>

      <h2>3. Credit Allocation</h2>
      <ul>
        <li>
          Credits are added to your account immediately upon successful payment.
        </li>
        <li>
          <strong>Credits do not expire.</strong> Purchased credits remain in
          your account until used.
        </li>
        <li>
          You may purchase additional credit packs at any time. New credits are
          added to your existing balance.
        </li>
        <li>
          Credit usage is tracked in real-time and visible in your dashboard
          sidebar and billing settings.
        </li>
        <li>
          The Starter (Free) credits are a one-time allocation included with
          account creation and cannot be replenished for free.
        </li>
      </ul>

      <h2>4. Payments</h2>
      <ul>
        <li>
          All credit pack purchases are <strong>one-time payments</strong>. You
          will not be charged again unless you make another purchase.
        </li>
        <li>
          Payments are processed through our payment provider,{" "}
          <strong>Polar.sh</strong>.
        </li>
        <li>
          You will receive a receipt via email for each successful payment.
        </li>
        <li>
          Prices are listed on our pricing page and are displayed in USD.
        </li>
      </ul>

      <h2>5. Feature Access</h2>
      <p>
        The features available to you depend on the credit pack you purchased:
      </p>
      <ul>
        <li>
          <strong>Starter credits</strong> provide access to profile scans and
          basic AI suggestions only.
        </li>
        <li>
          <strong>Pro and Enterprise credit packs</strong> unlock all features,
          including AI rewrites, report exports, and advanced analytics. This
          access persists as long as you have remaining credits from that pack.
        </li>
        <li>
          When all credits from a paid pack are used, your account reverts to
          Starter-level feature access until you purchase another pack.
        </li>
      </ul>

      <h2>6. No Refunds</h2>
      <p>
        All credit pack purchases are <strong>final and non-refundable</strong>.
        We encourage you to use the free Starter credits to evaluate the
        Service before making a purchase. For full details, see our{" "}
        <Link href="/refund-policy">Refund Policy</Link>.
      </p>

      <h2>7. Failed Payments</h2>
      <ul>
        <li>
          If a payment fails, no credits will be added to your account.
        </li>
        <li>
          You may retry the purchase at any time from the billing page.
        </li>
        <li>
          If you believe you were charged but did not receive credits, contact
          us at{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>{" "}
          with your payment receipt.
        </li>
      </ul>

      <h2>8. Price Changes</h2>
      <p>
        We reserve the right to change credit pack prices at any time. Price
        changes apply only to future purchases — previously purchased credits
        are not affected.
      </p>

      <h2>9. Free Credits Limitations</h2>
      <p>
        The Starter (Free) credits are subject to the following limitations:
      </p>
      <ul>
        <li>2 credits per account (non-replenishable).</li>
        <li>Access limited to profile scans and basic AI suggestions.</li>
        <li>No access to AI rewrites, report exports, or advanced features.</li>
        <li>
          We reserve the right to modify or discontinue the free credit
          allocation at any time.
        </li>
      </ul>

      <h2>10. Contact Us</h2>
      <p>
        For billing questions, disputes, or refund requests, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        See also: <Link href="/terms">Terms of Service</Link> &middot;{" "}
        <Link href="/privacy">Privacy Policy</Link> &middot;{" "}
        <Link href="/refund-policy">Refund Policy</Link> &middot;{" "}
        <Link href="/disclaimer">Disclaimer</Link>
      </p>
    </LegalArticle>
  );
}
