export type QuoteEmailLead = Readonly<{
  leadId: string;
  name: string;
  phone: string;
  suburb: string;
  vehicle: string;
  expectedPrice: string;
  condition: string;
  receivedAt: string;
}>;

export type QuoteEmail = Readonly<{
  subject: string;
  text: string;
  html: string;
}>;

const BRAND_NAME = "Unique Cash For Cars";
const BRAND_URL = "https://uniquecashforcars.com.au";
const BRAND_COLOUR = "#c14142";
const BRAND_DARK = "#a63839";

function oneLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function displayPrice(value: string) {
  const cleaned = oneLine(value);
  const numeric = cleaned.replace(/[$,\s]/g, "");

  if (/^\d+(?:\.\d{1,2})?$/.test(numeric)) {
    const hasFraction = numeric.includes(".");
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(Number(numeric));
  }

  return cleaned;
}

function phoneUri(value: string) {
  const raw = oneLine(value);
  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) return `+${digits}`;
  if (/^0[23478]\d{8}$/.test(digits)) return `+61${digits.slice(1)}`;
  if (/^61\d{9}$/.test(digits)) return `+${digits}`;
  return digits;
}

function receivedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return oneLine(value);

  const day = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

  return `${day} at ${time}`;
}

function detailRow(label: string, value: string, emphasis = false) {
  return `
    <tr>
      <td style="width: 38%; padding: 11px 12px; border-bottom: 1px solid #e5e5e5; color: #696969; font-size: 13px; line-height: 19px; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 11px 12px; border-bottom: 1px solid #e5e5e5; color: #333333; font-size: ${emphasis ? "18px" : "14px"}; font-weight: ${emphasis ? "700" : "600"}; line-height: ${emphasis ? "24px" : "20px"}; overflow-wrap: anywhere; vertical-align: top;">${escapeHtml(value)}</td>
    </tr>`;
}

export function buildQuoteEmail(lead: QuoteEmailLead): QuoteEmail {
  const name = oneLine(lead.name);
  const phone = oneLine(lead.phone);
  const suburb = oneLine(lead.suburb);
  const vehicle = oneLine(lead.vehicle);
  const condition = oneLine(lead.condition);
  const expectedPrice = displayPrice(lead.expectedPrice);
  const phoneTarget = phoneUri(phone);
  const canSendSms = /^\+614\d{8}$/.test(phoneTarget);
  const received = receivedTime(lead.receivedAt);
  const reference = oneLine(lead.leadId).split("-", 1)[0].slice(0, 8).toUpperCase();
  const subjectVehicle = vehicle === "—" ? name : vehicle;
  const subjectParts = [
    truncate(subjectVehicle, 56),
    suburb === "—" ? "" : truncate(suburb, 32),
    truncate(expectedPrice, 24),
  ].filter(Boolean);
  const subject = truncate(`New quote: ${subjectParts.join(" · ")}`, 120);
  const preheader = `${name} — ${vehicle} — ${suburb} — ${expectedPrice}`;
  const actionLines = [
    `Call: tel:${phoneTarget}`,
    ...(canSendSms ? [`Text: sms:${phoneTarget}`] : []),
  ];
  const smsButton = canSendSms
    ? `
                    <td class="quote-action-cell" width="50%" style="width: 50%; padding: 0 0 10px 6px;">
                      <a href="sms:${escapeHtml(phoneTarget)}" style="display: block; padding: 12px 16px; border: 1px solid ${BRAND_COLOUR}; border-radius: 6px; background: #ffffff; color: ${BRAND_DARK}; font-size: 15px; font-weight: 700; line-height: 20px; text-align: center; text-decoration: none;">Send a text</a>
                    </td>`
    : "";

  const text = [
    "NEW QUOTE ENQUIRY",
    BRAND_NAME,
    "",
    "CUSTOMER",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Suburb: ${suburb}`,
    "",
    "VEHICLE",
    `Vehicle: ${vehicle}`,
    `Customer's expected price: ${expectedPrice}`,
    `Condition: ${condition}`,
    "",
    ...actionLines,
    "",
    `Received: ${received}`,
    `Reference: ${reference}`,
    `Lead ID: ${oneLine(lead.leadId)}`,
    "",
    `Sent from the online quote form at ${BRAND_URL}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
    <style>
      @media only screen and (max-width: 480px) {
        .quote-action-cell {
          display: block !important;
          width: 100% !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: #f1f1f1; color: #333333; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: #f1f1f1;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 620px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 24px 28px; background: ${BRAND_COLOUR}; color: #ffffff;">
                <div style="font-size: 13px; font-weight: 700; letter-spacing: 1.2px; line-height: 18px; text-transform: uppercase;">${BRAND_NAME}</div>
                <div style="margin-top: 5px; font-size: 24px; font-weight: 700; line-height: 31px;">New quote enquiry</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px;">
                <div style="color: #696969; font-size: 12px; font-weight: 700; letter-spacing: 1px; line-height: 18px; text-transform: uppercase;">Customer</div>
                <div style="margin-top: 6px; color: #333333; font-size: 25px; font-weight: 700; line-height: 32px; overflow-wrap: anywhere;">${escapeHtml(name)}</div>
                <div style="margin-top: 5px; color: #555555; font-size: 15px; line-height: 22px;">${escapeHtml(suburb)}</div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 20px;">
                  <tr>
                    <td class="quote-action-cell" width="${canSendSms ? "50%" : "100%"}" style="width: ${canSendSms ? "50%" : "100%"}; padding: 0 ${canSendSms ? "6px" : "0"} 10px 0;">
                      <a href="tel:${escapeHtml(phoneTarget)}" style="display: block; padding: 13px 16px; border-radius: 6px; background: ${BRAND_COLOUR}; color: #ffffff; font-size: 15px; font-weight: 700; line-height: 20px; text-align: center; text-decoration: none;">Call ${escapeHtml(phone)}</a>
                    </td>
                    ${smsButton}
                  </tr>
                </table>

                <div style="margin-top: 17px; color: #696969; font-size: 12px; font-weight: 700; letter-spacing: 1px; line-height: 18px; text-transform: uppercase;">Vehicle details</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 8px; border: 1px solid #e5e5e5; border-radius: 7px; border-collapse: separate; border-spacing: 0;">
                  ${detailRow("Vehicle", vehicle)}
                  ${detailRow("Customer's expected price", expectedPrice, true)}
                  ${detailRow("Condition", condition)}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-top: 22px; padding-top: 18px; border-top: 1px solid #e5e5e5;">
                  <tr>
                    <td style="color: #696969; font-size: 12px; line-height: 18px; vertical-align: top;">Received<br><strong style="color: #555555;">${escapeHtml(received)}</strong></td>
                    <td align="right" style="color: #696969; font-size: 12px; line-height: 18px; vertical-align: top;">Reference<br><strong style="color: #555555;">${escapeHtml(reference)}</strong></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 17px 28px; background: #fafafa; color: #696969; font-size: 12px; line-height: 18px; text-align: center;">
                Sent from the <a href="${BRAND_URL}" style="color: ${BRAND_DARK}; text-decoration: underline;">${BRAND_NAME}</a> online quote form.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
