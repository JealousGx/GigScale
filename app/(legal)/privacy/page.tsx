import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/shared/LegalArticle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}. Learn how we collect, use, and protect your personal information.`,
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 9, 2026";

  return (
    <LegalArticle>
      <h1>Privacy Policy</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <p>
        {siteConfig.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        operates the {siteConfig.domain} website and the {siteConfig.name}{" "}
        platform (the &quot;Service&quot;). This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our
        Service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Personal Information You Provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> Name, email address, and profile
          picture when you create an account.
        </li>
        <li>
          <strong>Authentication data:</strong> Passwords (hashed), OAuth tokens
          from third-party providers (e.g., Google), and one-time passcodes.
        </li>
        <li>
          <strong>Payment data:</strong> Billing information processed through
          our payment provider, Polar.sh. We do not store full credit card
          numbers on our servers.
        </li>
        <li>
          <strong>Profile data:</strong> Freelancer profile URLs and platform
          information you submit for analysis.
        </li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Usage data:</strong> Pages visited, features used, credit
          consumption, and interaction patterns.
        </li>
        <li>
          <strong>Device data:</strong> IP address, browser type, operating
          system, and device identifiers.
        </li>
        <li>
          <strong>Cookies:</strong> Session cookies for authentication and
          preferences. We use essential cookies only — no advertising or
          third-party tracking cookies.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and maintain the Service.</li>
        <li>
          To analyze freelancer profiles and generate AI-powered suggestions,
          rewrites, and scores.
        </li>
        <li>To process payments and manage credit balances.</li>
        <li>To send transactional emails (verification codes, receipts).</li>
        <li>To respond to support inquiries.</li>
        <li>
          To detect, prevent, and address security issues or abuse.
        </li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>
        We do not sell your personal information. We may share data with:
      </p>
      <ul>
        <li>
          <strong>Service providers:</strong> Payment processors (Polar.sh),
          email delivery (Resend), cloud storage (Cloudflare R2), and database
          hosting — only as necessary to operate the Service.
        </li>
        <li>
          <strong>Legal compliance:</strong> When required by law, regulation,
          legal process, or governmental request.
        </li>
        <li>
          <strong>Business transfers:</strong> In connection with a merger,
          acquisition, or sale of assets, your data may be transferred as part
          of that transaction.
        </li>
      </ul>

      <h2>4. Data Storage and Security</h2>
      <p>
        Your data is stored on secure servers with encryption in transit (TLS)
        and at rest. We implement industry-standard security measures including
        hashed passwords, secure session management, and access controls.
        However, no method of transmission or storage is 100% secure.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active or as
        needed to provide the Service. You may request deletion of your account
        and associated data at any time through the Settings page. Upon
        deletion, we remove your personal data within 30 days, except where
        retention is required by law.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your data.</li>
        <li>Object to or restrict processing of your data.</li>
        <li>Data portability — receive your data in a structured format.</li>
        <li>Withdraw consent at any time.</li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <h2>7. Third-Party Links</h2>
      <p>
        The Service may contain links to third-party websites or services. We
        are not responsible for their privacy practices. We encourage you to
        review their privacy policies.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for users under 16 years of age. We do not
        knowingly collect data from children. If you believe a child has
        provided us with personal information, please contact us.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of material changes by posting the new policy on this page and updating
        the &quot;Last updated&quot; date.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        See also: <Link href="/terms">Terms of Service</Link> &middot;{" "}
        <Link href="/refund-policy">Refund Policy</Link> &middot;{" "}
        <Link href="/disclaimer">Disclaimer</Link> &middot;{" "}
        <Link href="/billing-policy">Billing &amp; Credits Policy</Link>
      </p>
    </LegalArticle>
  );
}
