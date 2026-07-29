"use client";

import Script from "next/script";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const accountGoogleAdsId = "AW-750701638";
const accountQuoteConversionLabel = "PXg6CPz39usBEMaY--UC";
const accountPhoneConversionLabel = "sF8gCNG54ZgBEMaY--UC";
const phoneConversionNumber = "0423 476 111";

const googleAdsId =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || accountGoogleAdsId;
const quoteConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_LABEL?.trim() ||
  accountQuoteConversionLabel;
const phoneConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_LABEL?.trim() ||
  accountPhoneConversionLabel;

const validAdsId = /^AW-\d+$/.test(googleAdsId) ? googleAdsId : "";
const validLabel = (label: string) =>
  /^[A-Za-z0-9_-]+$/.test(label) ? label : "";

function sendConversion(
  label: string,
  parameters: Record<string, string | number | undefined> = {},
) {
  const conversionLabel = validLabel(label);
  if (!validAdsId || !conversionLabel || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${validAdsId}/${conversionLabel}`,
    ...parameters,
  });
}

/**
 * Records a delivered quote enquiry, not a button click or an attempted form
 * submission. The server-issued lead ID becomes Google Ads' transaction ID so
 * a retry cannot count the same customer twice.
 */
export function trackQuoteConversion(transactionId?: string) {
  sendConversion(quoteConversionLabel, {
    transaction_id: transactionId,
  });
}

/**
 * The public account identifiers default to the existing Google Ads conversion
 * action, while environment variables allow them to be changed without code.
 *
 * The phone configuration uses Google's forwarding-number measurement. It
 * counts connected calls that meet the duration threshold configured in Ads,
 * rather than counting every tap on a phone link as a conversion.
 */
export function GoogleAdsTracking() {
  if (!validAdsId) return null;

  const phoneSendTo = validLabel(phoneConversionLabel)
    ? `${validAdsId}/${phoneConversionLabel}`
    : "";

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validAdsId)}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(validAdsId)});
          ${
            phoneSendTo
              ? `gtag('config', ${JSON.stringify(phoneSendTo)}, {
                  'phone_conversion_number': ${JSON.stringify(phoneConversionNumber)}
                });`
              : ""
          }
        `}
      </Script>
    </>
  );
}
