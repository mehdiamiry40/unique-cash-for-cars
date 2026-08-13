"use client";

import Script from "next/script";
import { useEffect } from "react";

import { site } from "@/content/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const accountGoogleAdsId = "AW-750701638";
const accountGoogleAnalyticsId = "G-VZT8S8WXDH";
const accountQuoteConversionLabel = "PXg6CPz39usBEMaY--UC";
const accountPhoneConversionLabel = "sF8gCNG54ZgBEMaY--UC";

const googleAdsId =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || accountGoogleAdsId;
const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA4_ID?.trim() || accountGoogleAnalyticsId;
const quoteConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_LABEL?.trim() ||
  accountQuoteConversionLabel;
const phoneConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_LABEL?.trim() ||
  accountPhoneConversionLabel;

const validAdsId = /^AW-\d+$/.test(googleAdsId) ? googleAdsId : "";
const validAnalyticsId = /^G-[A-Z0-9]+$/.test(googleAnalyticsId)
  ? googleAnalyticsId
  : "";
const validLabel = (label: string) =>
  /^[A-Za-z0-9_-]+$/.test(label) ? label : "";

function getGtag() {
  if (typeof window === "undefined") return null;

  // Queue early phone taps even if gtag.js has not finished downloading yet.
  // The standard Google snippet reuses this function when it initializes.
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  return window.gtag;
}

function sendConversion(
  label: string,
  parameters: Record<string, string | number | undefined> = {},
) {
  const conversionLabel = validLabel(label);
  const gtag = getGtag();
  if (!validAdsId || !conversionLabel || !gtag) return;

  gtag("event", "conversion", {
    send_to: `${validAdsId}/${conversionLabel}`,
    ...parameters,
  });
}

function sendAnalyticsEvent(
  name: string,
  parameters: Record<string, string | number | undefined> = {},
) {
  const gtag = getGtag();
  if (!validAnalyticsId || !gtag) return;

  gtag("event", name, {
    send_to: validAnalyticsId,
    ...parameters,
  });
}

/**
 * Records a delivered quote enquiry, not a button click or an attempted form
 * submission. Requires the server-issued lead ID — honeypot responses and
 * failed deliveries must not count. That ID becomes Google Ads' transaction ID
 * so a retry cannot count the same customer twice.
 */
export function trackQuoteConversion(transactionId?: string) {
  if (!transactionId) return;
  sendConversion(quoteConversionLabel, {
    transaction_id: transactionId,
  });
  sendAnalyticsEvent("generate_lead", {
    method: "quote_form",
  });
}

/**
 * The public account identifiers default to the existing Google Ads conversion
 * actions and GA4 web stream, while environment variables allow them to be
 * changed without code.
 *
 * The phone configuration uses Google's forwarding-number measurement. It
 * counts connected calls that meet the duration threshold configured in Ads,
 * rather than counting every tap on a phone link as a conversion.
 *
 * GA4 phone-link events measure intent. Google Ads call measurement remains
 * forwarding-number based, so a tap and a connected call are not counted as
 * two Ads conversions.
 *
 * This component is only mounted in production — see `isAdsEnabled` in
 * `src/lib/deploy.ts` and the root layout.
 */
export function GoogleAdsTracking() {
  useEffect(() => {
    function trackPhoneClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (!link) return;

      sendAnalyticsEvent("click_to_call", {
        cta_location: link.dataset.cta || "phone-link",
      });
    }

    document.addEventListener("click", trackPhoneClick);
    return () => document.removeEventListener("click", trackPhoneClick);
  }, []);

  const tagId = validAdsId || validAnalyticsId;
  if (!tagId) return null;

  const phoneSendTo = validAdsId && validLabel(phoneConversionLabel)
    ? `${validAdsId}/${phoneConversionLabel}`
    : "";

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-measurement-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          ${validAdsId ? `gtag('config', ${JSON.stringify(validAdsId)});` : ""}
          ${validAnalyticsId ? `gtag('config', ${JSON.stringify(validAnalyticsId)});` : ""}
          ${
            phoneSendTo
              ? `gtag('config', ${JSON.stringify(phoneSendTo)}, {
                  'phone_conversion_number': ${JSON.stringify(site.phone.display)}
                });`
              : ""
          }
        `}
      </Script>
    </>
  );
}
