import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { Section } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy — Unique Cash For Cars",
  description:
    "How Unique Cash For Cars collects, uses and stores the personal information you provide when requesting a vehicle quote.",
  path: "/privacy-policy",
});

/**
 * NOT LEGAL ADVICE. This is a plain-English starting point covering what the
 * site actually does. Have it reviewed against the Privacy Act 1988 (Cth) and
 * the Australian Privacy Principles before launch — particularly if you start
 * storing leads in a CRM or running remarketing ads.
 */
export default function PrivacyPolicyPage() {
  // Hardcoded on purpose. This is the date the policy was last reviewed, not
  // the date the site was last deployed — a build-time date would silently
  // claim a review that never happened. Bump it when you change the text.
  const updated = "28 July 2026";

  return (
    <Section>
      <div className="prose-site mx-auto max-w-3xl">
        <h1 className="heading-xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink-muted">Last updated {updated}</p>

        <h2>What we collect</h2>
        <p>
          When you submit a quote request we collect your name, phone number, email
          address, the suburb where the vehicle is located, and the details you give
          us about the vehicle itself. When you call us we record the same
          information so we can quote and arrange collection.
        </p>
        <p>
          When you complete a sale we additionally sight your photo identification
          and vehicle registration documents, as required for the transfer of
          registration. We record only what the transfer requires.
        </p>

        <h2>Why we collect it</h2>
        <p>
          To quote on your vehicle, arrange collection, complete the transfer of
          registration, and meet our record-keeping obligations as a vehicle buyer in
          Queensland. We do not sell your information to anyone.
        </p>

        {/*
          This section previously described analytics and cookies that the site
          does not have — no Google Analytics, GTM, Clarity or advertising
          pixel is loaded, and no cookie is set. Overstating collection is its
          own compliance problem. If tags are re-added (see the launch checklist
          in README.md), rewrite this section at the same time.
        */}
        <h2>Analytics and cookies</h2>
        <p>
          This site sets no cookies and loads no third-party analytics,
          advertising or tracking scripts. Nothing is shared with Google,
          Meta or any other third party when you browse it.
        </p>
        <p>
          Our hosting provider keeps standard server logs — the requested page,
          a timestamp, and the browser and network the request came from — which
          are used to keep the site running and secure, and are not used to
          build a profile of you.
        </p>

        <h2>Who we share it with</h2>
        <p>
          Your details are shared only where necessary to complete the transaction:
          with the Queensland Department of Transport and Main Roads for the
          registration transfer, with our towing operator to arrange collection, and
          with our accountant or auditor where required by law.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Quote enquiries that don&apos;t proceed are kept for up to 12 months.
          Completed transaction records are kept for the period required under
          Queensland law for vehicle dealers and for tax purposes.
        </p>

        <h2>Accessing or correcting your information</h2>
        <p>
          You can ask us what we hold about you, ask us to correct it, or ask us to
          delete it where we&apos;re not legally required to keep it. Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
          <a href={site.phone.href}>{site.phone.display}</a>.
        </p>

        <h2>Complaints</h2>
        <p>
          If you believe we&apos;ve mishandled your information, contact us first and
          we&apos;ll try to resolve it. If you&apos;re not satisfied, you can complain
          to the Office of the Australian Information Commissioner at oaic.gov.au.
        </p>

        <h2>Contact</h2>
        <p>
          {site.legalName}
          <br />
          <a href={site.phone.href}>{site.phone.display}</a> ·{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </Section>
  );
}
