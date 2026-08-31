import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { deliverQuote } from "@/lib/quote-delivery";
import { buildQuoteEmail } from "@/lib/quote-email";
import { createFixedWindowLimiter } from "@/lib/quote-rate-limit";

/**
 * Quote enquiry endpoint.
 *
 * Configure exactly one delivery method with the matching environment variables:
 *   RESEND_API_KEY + QUOTE_TO_EMAIL   → email via Resend
 *   QUOTE_WEBHOOK_URL                 → POST to Zapier / Make / your CRM
 *
 * Invalid, incomplete or ambiguous configuration returns an error instead of
 * pretending that the enquiry was delivered. Vercel production builds fail
 * early on the same configuration contract in next.config.ts.
 */

export const runtime = "nodejs";

type QuotePayload = {
  name?: string;
  phone?: string;
  suburb?: string;
  vehicle?: string;
  expectedPrice?: string;
  condition?: string;
  /**
   * Honeypot — must be empty.
   *
   * Deliberately NOT named `website`, `url` or anything else in the autofill
   * vocabulary. Password managers and browser autofill do populate a field
   * named `website`, and a tripped honeypot answers 200 — so a real customer
   * would have seen the success panel while their enquiry was discarded, with
   * no trace anywhere. Keep this name meaningless.
   */
  contactRef?: string;
};

/**
 * Bounded in-memory burst brake.
 *
 * On Vercel each serverless isolate has its own Map, so this is a soft brake
 * against accidental double-submits on a warm instance — not a hard ceiling
 * under load. A platform WAF or shared limiter must supply deployment-wide
 * enforcement.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 32_000;
/** Cap on distinct IPs tracked, so a spray of unique sources cannot grow the map without bound. */
const MAX_TRACKED_IPS = 10_000;
const rateLimiter = createFixedWindowLimiter({
  maxKeys: MAX_TRACKED_IPS,
  maxRequests: MAX_PER_WINDOW,
  windowMs: WINDOW_MS,
});

function json(
  body: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function isQuotePayload(value: unknown): value is QuotePayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return [
    "name",
    "phone",
    "suburb",
    "vehicle",
    "expectedPrice",
    "condition",
    "contactRef",
  ].every((key) => payload[key] === undefined || typeof payload[key] === "string");
}

/**
 * Reads the body with a hard ceiling on bytes actually consumed.
 *
 * The Content-Length header alone is not a guard: a chunked request omits it
 * entirely, and `request.json()` would then buffer whatever arrived. This
 * stops pulling from the stream once the limit is passed.
 */
async function readBody(request: Request): Promise<string | null> {
  const stream = request.body;
  if (!stream) return "";

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json(
      { error: "This enquiry could not be verified. Please refresh and try again." },
      403,
    );
  }

  const forwardedIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = (forwardedIp || "unknown").slice(0, 128);

  const rate = rateLimiter.check(ip);
  if (rate.limited) {
    return json(
      { error: "Too many enquiries were sent. Please wait a minute and try again." },
      429,
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return json({ error: "This enquiry must be sent as JSON." }, 415);
  }

  const raw = await readBody(request);
  if (raw === null) {
    return json({ error: "This enquiry is too large." }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: "The enquiry could not be read." }, 400);
  }

  if (!isQuotePayload(parsed)) {
    return json({ error: "The enquiry could not be read." }, 400);
  }
  const body = parsed;

  // Honeypot tripped — accept silently so the bot doesn't learn.
  // No `leadId`: the client must not treat this as a delivered conversion.
  if (body.contactRef) return json({ ok: true });

  const name = text(body.name, 100);
  const phone = text(body.phone, 40);
  const suburb = text(body.suburb, 120);
  const vehicle = text(body.vehicle, 160);
  const expectedPrice = text(body.expectedPrice, 60) || "Not sure";

  // Phone-only contact. The public form does not collect email — we call back.
  if (!name || !phone) {
    return json({ error: "Name and phone are required." }, 400);
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return json({ error: "Please enter a valid phone number." }, 400);
  }
  if (!suburb) {
    return json({ error: "Suburb is required." }, 400);
  }
  if (!vehicle) {
    return json({ error: "Vehicle details are required." }, 400);
  }

  const leadId = crypto.randomUUID();

  const lead = {
    leadId,
    name,
    phone,
    suburb,
    vehicle,
    expectedPrice,
    condition: text(body.condition, 500) || "—",
    receivedAt: new Date().toISOString(),
  };

  const email = buildQuoteEmail(lead);
  const delivery = await deliverQuote({
    settings: {
      webhookUrl: process.env.QUOTE_WEBHOOK_URL,
      resendApiKey: process.env.RESEND_API_KEY,
      toEmail: process.env.QUOTE_TO_EMAIL,
      fromEmail: process.env.QUOTE_FROM_EMAIL,
    },
    lead,
    email: {
      subject: email.subject,
      text: email.text,
    },
  });

  if (!delivery.ok) {
    const configurationFailure = delivery.provider === "configuration";
    return json(
      {
        error:
          configurationFailure
            ? `Online enquiries are temporarily unavailable. Please call ${site.phone.display}.`
            : `Your enquiry could not be sent. Please try again or call ${site.phone.display}.`,
      },
      configurationFailure ? 503 : 502,
    );
  }

  return json({ ok: true, leadId });
}
