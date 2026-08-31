import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { Section } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy — Unique Cash For Cars",
  description:
    "How Unique Cash For Cars collects, uses and stores the personal information you provide when requesting a vehicle quote.",
  path: "/privacy-policy",
  noIndex: true,
});

/**
 * NOT LEGAL ADVICE. This is a plain-English starting point covering what the
 * site actually does. Have it reviewed against the Privacy Act 1988 (Cth) and
 * the Australian Privacy Principles — particularly before changing retention,
 * adding a CRM, or running remarketing ads.
 */
export default function PrivacyPolicyPage() {
  // Hardcoded on purpose. This is the date the policy was last reviewed, not
  // the date the site was last deployed — a build-time date would silently
  // claim a review that never happened. Bump it when you change the text.
  const updated = "1 September 2026";

  return (
    <Section>
      <div className="prose-site mx-auto max-w-3xl">
        <h1 className="heading-xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink-muted">Last updated {updated}</p>

        <h2>What we collect</h2>
        <p>
          When you submit a quote request we collect your name, phone number, the
          suburb where the vehicle is located, the details you give us about the
          vehicle itself and, if you choose to provide it, your expected price.
          When you call us we record the same information so we can quote and
          arrange collection. The online form does not ask for an email address —
          we call you back on the number you provide.
        </p>
        <p>
          When you submit the online form, we temporarily use the request&apos;s IP
          address in server memory to limit repeated submissions and protect the
          form from abuse. Our hosting provider may separately retain standard
          request logs as described below.
        </p>
        <p>
          Valid online enquiries are stored in a managed database before we try
          to notify our team. We keep a submission reference, the details listed
          above, delivery status, attempt count and the email provider&apos;s message
          reference where available. This lets us recover an enquiry if the email
          provider is temporarily unavailable without asking you to submit it again.
          We do not add your IP address to the stored enquiry.
        </p>
        <p>
          When you complete a sale we additionally sight your photo identification
          and vehicle registration documents, as required for the applicable
          transfer, cancellation or dealer record. We record only what the
          transaction requires.
        </p>

        <h2>Why we collect it</h2>
        <p>
          To quote on your vehicle, arrange collection, complete the applicable
          registration or disposal process, and meet our record-keeping obligations as
          a vehicle buyer in Queensland. We do not sell your information to anyone.
        </p>

        {/*
          Keep this section honest about every third-party script the layout
          actually loads. If you add GTM, Clarity or a CRM pixel, update this
          section and bump `updated` in the same change.
        */}
        <h2>Analytics, advertising and cookies</h2>
        <p>
          This site loads Google Ads conversion and call-measurement tags, plus
          Google Analytics 4, so we can understand visits and tell which ads led
          to a safely stored quote enquiry or phone call. Analytics records page
          views and interactions such as scrolls, outbound links and phone-link
          clicks. It also records quote-button clicks, the first interaction with
          the quote form, broad error categories such as validation or network
          failure, and a lead event after the quote system safely stores the
          enquiry. Email-provider acceptance and inbox delivery are tracked
          separately from that measurement event. We
          do not send error messages or the values entered in the quote form —
          including your name, phone number, optional expected price, suburb,
          vehicle or condition details — to Google through these measurement
          events.
        </p>
        <p>
          Google may set or read cookies and similar technologies for measurement
          and receive technical details about the visit, such as the page URL,
          browser and IP address. We intend to use these tags for measurement rather
          than remarketing; the features that are active depend on the Google Ads and
          Analytics account and tag settings in force. We do not load Meta Pixel or
          Microsoft Clarity.
        </p>
        <p>
          Our hosting provider keeps standard server logs — the requested page,
          a timestamp, and the browser and network the request came from — which
          are used to keep the site running and secure, and are not used to
          build a profile of you.
        </p>

        <h2>Who we share it with</h2>
        <p>
          The personal details and vehicle information you provide are shared only
          where necessary: with our managed database and hosting providers so the
          enquiry can be stored safely; with our email or form-delivery provider so
          our team can receive it; with our towing operator to arrange a collection you
          accept; with the Queensland Department of Transport and Main Roads for an
          applicable registration transfer or cancellation; and with our accountant
          or auditor where required by law.
        </p>
        <p>
          Google receives the separate website-measurement data described above. We
          do not send the values entered in the quote form to Google as part of those
          measurement events.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Quote enquiries that don&apos;t proceed are kept for up to 12 months. The
          database removes expired enquiries and their delivery records together.
          Completed transaction records are kept for the period required under
          Queensland law for vehicle dealers and for tax purposes.
        </p>
        <p>
          The in-memory IP record used by the quote form covers a short anti-abuse
          window and is not added to the quote details. Standard hosting logs are
          retained according to the hosting provider&apos;s settings.
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
          {site.name}
          <br />
          Operated by {site.registeredEntityName} · ABN {site.abn}
          <br />
          <a href={site.phone.href}>{site.phone.display}</a> ·{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </Section>
  );
}
