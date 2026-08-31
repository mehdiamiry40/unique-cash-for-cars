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
}>;

function oneLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
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

export function buildQuoteEmail(lead: QuoteEmailLead): QuoteEmail {
  const name = oneLine(lead.name);
  const phone = oneLine(lead.phone);
  const suburb = oneLine(lead.suburb);
  const vehicle = oneLine(lead.vehicle);
  const condition = oneLine(lead.condition);
  const expectedPrice = displayPrice(lead.expectedPrice);
  const received = receivedTime(lead.receivedAt);
  const reference = oneLine(lead.leadId).split("-", 1)[0].slice(0, 8).toUpperCase();
  const subjectCustomer = suburb === "—" ? name : `${name} (${suburb})`;
  const subject = truncate(`New car quote enquiry — ${subjectCustomer}`, 120);

  const text = [
    "New quote enquiry",
    "",
    "Customer",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Suburb: ${suburb}`,
    "",
    "Vehicle",
    `Vehicle: ${vehicle}`,
    `Customer's expected price: ${expectedPrice}`,
    `Condition: ${condition}`,
    "",
    `Received: ${received}`,
    `Reference: ${reference}`,
  ].join("\n");

  return { subject, text };
}
