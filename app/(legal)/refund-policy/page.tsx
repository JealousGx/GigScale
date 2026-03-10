import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/shared/LegalArticle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `Refund Policy for ${siteConfig.name}. All credit pack purchases are final and non-refundable.`,
};

export default function RefundPolicyPage() {
  const lastUpdated = "March 9, 2026";

  return (
    <LegalArticle>
      <h1>Refund Policy</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <h2>1. All Sales Are Final</h2>
      <p>
        All credit pack purchases on {siteConfig.name} are{" "}
        <strong>final and non-refundable</strong>. By completing a purchase, you
        acknowledge and agree that no refunds will be issued under any
        circumstances, including but not limited to:
      </p>
      <ul>
        <li>Unused or partially used credits.</li>
        <li>Dissatisfaction with AI-generated outputs or scores.</li>
        <li>Accidental or duplicate purchases.</li>
        <li>Change of mind after purchase.</li>
        <li>Account deletion with remaining credits.</li>
      </ul>

      <h2>2. Why We Have a No-Refund Policy</h2>
      <p>
        {siteConfig.name} delivers AI-powered digital services that are consumed
        immediately upon use. Credits provide instant access to computational
        resources (profile analysis, AI suggestions, rewrites) that cannot be
        &quot;returned&quot; once delivered. This policy allows us to keep prices
        fair for all users.
      </p>

      <h2>3. Free Credits</h2>
      <p>
        Every new account receives complimentary Starter credits at no cost.
        We encourage you to use these free credits to evaluate the Service
        before making any purchase. This ensures you can make an informed
        decision before spending money.
      </p>

      <h2>4. Pre-Purchase Responsibility</h2>
      <p>
        Before purchasing a credit pack, you are responsible for:
      </p>
      <ul>
        <li>
          Reviewing the credit pack details, pricing, and included features on
          our pricing page.
        </li>
        <li>
          Understanding how credits are consumed by reading our{" "}
          <Link href="/billing-policy">Billing &amp; Credits Policy</Link>.
        </li>
        <li>
          Testing the Service using the free Starter credits to ensure it meets
          your needs.
        </li>
      </ul>

      <h2>5. Payment Errors</h2>
      <p>
        If you experience a technical issue where payment was collected but
        credits were not added to your account, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        . We will investigate and ensure your credits are properly allocated.
        This is a credit delivery issue, not a refund — no money will be
        returned.
      </p>

      <h2>6. Chargebacks</h2>
      <p>
        Filing a chargeback or payment dispute with your bank or card issuer
        without contacting us first will result in{" "}
        <strong>immediate account suspension</strong> and potential permanent
        ban from the Service. If you believe there has been a billing error,
        please contact us directly so we can resolve the issue.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Refund Policy from time to time. Changes will be
        posted on this page with an updated &quot;Last updated&quot; date and
        apply to all purchases made after the change.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        For billing questions, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        See also: <Link href="/terms">Terms of Service</Link> &middot;{" "}
        <Link href="/privacy">Privacy Policy</Link> &middot;{" "}
        <Link href="/billing-policy">Billing &amp; Credits Policy</Link> &middot;{" "}
        <Link href="/disclaimer">Disclaimer</Link>
      </p>
    </LegalArticle>
  );
}
