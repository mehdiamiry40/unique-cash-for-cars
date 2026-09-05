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

export type QuoteFormErrorCategory =
  | "validation_name"
  | "validation_phone"
  | "validation_suburb"
  | "validation_vehicle"
  | "validation_expected_price"
  | "validation_condition"
  | "rate_limited"
  | "request_rejected"
  | "delivery_unavailable"
  | "network_error";

/** Records the first meaningful interaction with a quote form. */
export function trackQuoteFormStart() {
  sendAnalyticsEvent("quote_form_start", {
    form_name: "quote_form",
  });
}

/**
 * Records only a broad failure category. Error messages and form field values
 * can contain personal information and must never be sent to GA4.
 */
export function trackQuoteFormError(errorCategory: QuoteFormErrorCategory) {
  sendAnalyticsEvent("quote_form_error", {
    form_name: "quote_form",
    error_category: errorCategory,
  });
}

/**
 * Records a durably captured quote enquiry, not a button click or an attempted
 * form submission. Requires the server-issued lead ID after the database
 * commit — honeypot responses and failed persistence must not count. That ID
 * becomes Google Ads' transaction ID so replaying the same accepted response
 * cannot count it twice.
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
    function trackIntentClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const phoneLink = event.target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (phoneLink) {
        sendAnalyticsEvent("click_to_call", {
          cta_location: phoneLink.dataset.cta || "phone-link",
        });
        return;
      }

      const quoteCta = event.target.closest<HTMLElement>('[data-cta^="quote-"]');
      if (!quoteCta) return;

      sendAnalyticsEvent("quote_cta_click", {
        cta_location: quoteCta.dataset.cta || "quote-link",
      });
    }

    document.addEventListener("click", trackIntentClick);
    return () => document.removeEventListener("click", trackIntentClick);
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
