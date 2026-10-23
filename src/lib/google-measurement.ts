/**
 * Public Google Ads and GA4 identifiers.
 *
 * The inline measurement snippet below is hashed into the Content-Security-Policy
 * at build time. next/script inserts this exact string, so the whitespace is
 * part of the allowlist and has to stay stable.
 *
 * The phone number is duplicated from site.ts rather than imported. next.config
 * loads this module while collecting those hashes, and that loader cannot
 * resolve extensionless TypeScript imports. tests/csp.test.mjs checks the two
 * copies still match.
 */
const phoneDisplay = "0423 476 111";
const accountGoogleAdsId = "AW-750701638";
const accountGoogleAnalyticsId = "G-VZT8S8WXDH";
const accountQuoteConversionLabel = "PXg6CPz39usBEMaY--UC";
const accountPhoneConversionLabel = "sF8gCNG54ZgBEMaY--UC";

export function validMeasurementLabel(label: string) {
  return /^[A-Za-z0-9_-]+$/.test(label) ? label : "";
}

export function googleMeasurementInlineScript(input: {
  adsId: string;
  analyticsId: string;
  phoneSendTo: string;
  phoneDisplay: string;
}) {
  const { adsId, analyticsId, phoneSendTo, phoneDisplay } = input;
  return `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          ${adsId ? `gtag('config', ${JSON.stringify(adsId)});` : ""}
          ${analyticsId ? `gtag('config', ${JSON.stringify(analyticsId)});` : ""}
          ${
            phoneSendTo
              ? `gtag('config', ${JSON.stringify(phoneSendTo)}, {
                  'phone_conversion_number': ${JSON.stringify(phoneDisplay)}
                });`
              : ""
          }
        `;
}

export function resolveGoogleMeasurement(
  env: Record<string, string | undefined> = process.env,
) {
  const googleAdsId = env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || accountGoogleAdsId;
  const googleAnalyticsId =
    env.NEXT_PUBLIC_GA4_ID?.trim() || accountGoogleAnalyticsId;
  const quoteConversionLabel =
    env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_LABEL?.trim() ||
    accountQuoteConversionLabel;
  const phoneConversionLabel =
    env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_LABEL?.trim() ||
    accountPhoneConversionLabel;

  const validAdsId = /^AW-\d+$/.test(googleAdsId) ? googleAdsId : "";
  const validAnalyticsId = /^G-[A-Z0-9]+$/.test(googleAnalyticsId)
    ? googleAnalyticsId
    : "";
  const phoneSendTo =
    validAdsId && validMeasurementLabel(phoneConversionLabel)
      ? `${validAdsId}/${phoneConversionLabel}`
      : "";

  return {
    validAdsId,
    validAnalyticsId,
    quoteConversionLabel,
    phoneConversionLabel,
    inlineScript: googleMeasurementInlineScript({
      adsId: validAdsId,
      analyticsId: validAnalyticsId,
      phoneSendTo,
      phoneDisplay,
    }),
  };
}
