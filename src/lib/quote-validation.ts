/** Shared browser/API contract. Never shorten customer details to fit storage. */
export const quoteFieldLimits = {
  name: 100,
  phone: 40,
  suburb: 120,
  vehicle: 160,
  expectedPrice: 60,
  condition: 500,
} as const;

export type QuoteFieldName = keyof typeof quoteFieldLimits;
export type QuoteFieldErrors = Partial<Record<QuoteFieldName, string>>;
export const quoteFieldOrder = Object.keys(quoteFieldLimits) as QuoteFieldName[];

const fieldLabels: Record<QuoteFieldName, string> = {
  name: "Name",
  phone: "Phone",
  suburb: "Suburb",
  vehicle: "Vehicle details",
  expectedPrice: "Expected price",
  condition: "Condition",
};

export function normalizeQuoteValue(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateQuoteFields(input: Partial<Record<QuoteFieldName, unknown>>) {
  const errors: QuoteFieldErrors = {};
  const values = Object.fromEntries(
    quoteFieldOrder.map((field) => [field, normalizeQuoteValue(input[field])]),
  ) as Record<QuoteFieldName, string>;

  if (!values.name) errors.name = "Please enter your name.";
  if (values.phone.replace(/\D/g, "").length < 8) {
    errors.phone = "Please enter a valid phone number so we can call you back.";
  }
  if (!values.suburb) {
    errors.suburb = "Please enter the suburb where the vehicle is located.";
  }
  if (!values.vehicle) {
    errors.vehicle = "Please enter the vehicle’s make, model and year.";
  }

  for (const field of quoteFieldOrder) {
    if (values[field].length > quoteFieldLimits[field]) {
      errors[field] = `${fieldLabels[field]} must be ${quoteFieldLimits[field]} characters or fewer. Please shorten it before sending.`;
    }
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export const quoteIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function savedQuoteReference(result: unknown) {
  if (!result || typeof result !== "object") return null;
  const body = result as Record<string, unknown>;
  if (
    body.code !== "quote_saved_delivery_failed" ||
    body.stored !== true ||
    typeof body.leadId !== "string" ||
    !quoteIdPattern.test(body.leadId)
  ) return null;
  return body.leadId.slice(0, 8).toUpperCase();
}
