import type { Metadata } from "next";
import Link from "next/link";

import { LegalArticle } from "@/components/shared/LegalArticle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}. Read the terms and conditions governing your use of the platform.`,
};

export default function TermsOfServicePage() {
  const lastUpdated = "March 9, 2026";

  return (
    <LegalArticle>
      <h1>Terms of Service</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the {siteConfig.name} platform at {siteConfig.domain} (the
        &quot;Service&quot;) operated by {siteConfig.name} (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service,
        you agree to be bound by these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using the Service, you confirm that you are at
        least 16 years old and agree to these Terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do
        not use the Service.
      </p>

      <h2>2. Account Registration</h2>
      <ul>
        <li>
          You must provide accurate and complete information when creating an
          account.
        </li>
        <li>
          You are responsible for maintaining the security of your account
          credentials.
        </li>
        <li>
          You must notify us immediately of any unauthorized access to your
          account.
        </li>
        <li>
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </li>
      </ul>

      <h2>3. Description of Service</h2>
      <p>
        {siteConfig.name} provides AI-powered freelancer profile optimization
        tools including:
      </p>
      <ul>
        <li>Profile scanning and analysis with scoring.</li>
        <li>AI-generated suggestions for profile improvement.</li>
        <li>AI-powered profile section rewrites.</li>
        <li>Historical tracking of analyses and improvements.</li>
      </ul>
      <p>
        The Service is provided on a credit-based system. Features require
        credits to use, which are available as one-time credit pack purchases.
      </p>

      <h2>4. Payments and Credits</h2>
      <ul>
        <li>
          Credits are purchased as one-time payments through our payment
          provider, Polar.sh. There are no recurring subscriptions.
        </li>
        <li>
          Prices are listed on our pricing page and may change with reasonable
          notice. Price changes apply only to future purchases.
        </li>
        <li>
          Purchased credits are added to your account immediately and do not
          expire.
        </li>
        <li>
          All purchases are final and non-refundable. See our{" "}
          <Link href="/refund-policy">Refund Policy</Link> for details.
        </li>
      </ul>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Service for any unlawful purpose or in violation of any
          applicable laws.
        </li>
        <li>
          Submit content that is defamatory, obscene, or infringing on
          third-party rights.
        </li>
        <li>
          Attempt to gain unauthorized access to the Service, other accounts, or
          our systems.
        </li>
        <li>
          Use automated tools (bots, scrapers) to access the Service without our
          written consent.
        </li>
        <li>
          Reverse-engineer, decompile, or otherwise attempt to extract the
          source code of the Service.
        </li>
        <li>
          Resell, redistribute, or sublicense access to the Service or its
          outputs.
        </li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <ul>
        <li>
          The Service, including its design, code, branding, and AI models, is
          owned by {siteConfig.name} and protected by intellectual property
          laws.
        </li>
        <li>
          You retain ownership of the profile data you submit. By using the
          Service, you grant us a limited license to process this data solely to
          provide the Service.
        </li>
        <li>
          AI-generated outputs (suggestions, rewrites, scores) are provided for
          your personal use in optimizing your freelancer profiles.
        </li>
      </ul>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, express or implied. We do not guarantee
        that:
      </p>
      <ul>
        <li>The Service will be uninterrupted, secure, or error-free.</li>
        <li>
          AI-generated suggestions or rewrites will achieve specific results on
          freelancing platforms.
        </li>
        <li>
          Profile scores accurately predict performance on third-party
          platforms.
        </li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, {siteConfig.name} shall not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages, including loss of revenue, profits, data, or business
        opportunities, arising from your use of the Service.
      </p>
      <p>
        Our total liability for any claims arising from the Service shall not
        exceed the amount you paid to us in the one (1) month preceding the event giving rise to the claim.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {siteConfig.name}, its
        officers, employees, and affiliates from any claims, losses, damages,
        liabilities, and expenses arising from your use of the Service or
        violation of these Terms.
      </p>

      <h2>10. Modifications to the Service</h2>
      <p>
        We reserve the right to modify, suspend, or discontinue any part of the
        Service at any time with or without notice. We are not liable for any
        modification, suspension, or discontinuation.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify you of
        material changes by posting the updated Terms and revising the
        &quot;Last updated&quot; date. Continued use of the Service after changes
        constitutes acceptance of the new Terms.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may terminate or suspend your access to the Service at any time for
        violations of these Terms. Upon termination, your right to use the
        Service ceases immediately. You may delete your account at any time
        through the Settings page.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with applicable
        laws. Any disputes shall be resolved through good-faith negotiation
        before resorting to formal proceedings.
      </p>

      <h2>14. Contact Us</h2>
      <p>
        If you have questions about these Terms, contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <hr />

      <p className="text-sm text-muted-foreground">
        See also: <Link href="/privacy">Privacy Policy</Link> &middot;{" "}
        <Link href="/refund-policy">Refund Policy</Link> &middot;{" "}
        <Link href="/disclaimer">Disclaimer</Link> &middot;{" "}
        <Link href="/billing-policy">Billing &amp; Credits Policy</Link>
      </p>
    </LegalArticle>
  );
}
