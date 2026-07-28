import { NextResponse } from "next/server";

/**
 * Quote enquiry endpoint.
 *
 * TODO before launch — pick one delivery method and set the matching env var:
 *   RESEND_API_KEY + QUOTE_TO_EMAIL   → email via Resend
 *   QUOTE_WEBHOOK_URL                 → POST to Zapier / Make / your CRM
 *
 * With neither set, the endpoint returns an error instead of pretending that
 * the enquiry was delivered.
 */

export const runtime = "nodejs";

type QuotePayload = {
  name?: string;
  phone?: string;
  email?: string;
  suburb?: string;
  vehicle?: string;
  expectedPrice?: string;
  fuel?: string;
  condition?: string;
  /** Honeypot — must be empty. */
  website?: string;
};

/** Naive in-memory rate limit. Swap for Upstash/Vercel KV if abuse becomes an issue. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 32_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FUEL_TYPES = new Set(["Petrol", "Diesel", "Hybrid"]);

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
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

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json(
      { error: "This enquiry could not be verified. Please refresh and try again." },
      403,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "This enquiry is too large." }, 413);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return json(
      { error: "Too many enquiries were sent. Please wait a minute and try again." },
      429,
    );
  }

  let body: QuotePayload;
  try {
    body = await request.json();
  } catch {
    return json({ error: "The enquiry could not be read." }, 400);
  }

  // Honeypot tripped — accept silently so the bot doesn't learn.
  if (body.website) return json({ ok: true });

  const name = text(body.name, 100);
  const phone = text(body.phone, 40);
  const email = text(body.email, 254);

  if (!name || !phone || !email) {
    return json(
      { error: "Name, phone and email are required." },
      400,
    );
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return json({ error: "Please enter a valid phone number." }, 400);
  }
  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const lead = {
    name,
    phone,
    email,
    suburb: text(body.suburb, 120) || "—",
    vehicle: text(body.vehicle, 160) || "—",
    expectedPrice: text(body.expectedPrice, 60) || "—",
    fuel: ALLOWED_FUEL_TYPES.has(text(body.fuel, 20))
      ? text(body.fuel, 20)
      : "—",
    condition: text(body.condition, 500) || "—",
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.QUOTE_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.QUOTE_TO_EMAIL;
  const fromEmail =
    process.env.QUOTE_FROM_EMAIL ??
    "Unique Cash for Cars <onboarding@resend.dev>";

  if (!webhook && (!resendKey || !toEmail)) {
    return json(
      {
        error:
          "Online enquiries are temporarily unavailable. Please call 0423 476 111.",
      },
      503,
    );
  }

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else if (resendKey && toEmail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: email,
          subject: `New car quote enquiry — ${name} (${lead.suburb})`,
          text: Object.entries(lead)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    }
  } catch (err) {
    console.error("[quote] Delivery failed:", err);
    return json(
      {
        error:
          "Your enquiry could not be sent. Please try again or call 0423 476 111.",
      },
      502,
    );
  }

  return json({ ok: true });
}
