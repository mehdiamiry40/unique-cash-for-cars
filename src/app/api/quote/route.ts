import { NextResponse } from "next/server";

/**
 * Quote enquiry endpoint.
 *
 * TODO before launch — pick one delivery method and set the matching env var:
 *   RESEND_API_KEY + QUOTE_TO_EMAIL   → email via Resend
 *   QUOTE_WEBHOOK_URL                 → POST to Zapier / Make / your CRM
 *
 * With neither set, submissions are logged to the server console only. That's
 * fine in development and a lost lead in production, so don't ship without it.
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

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: QuotePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot tripped — accept silently so the bot doesn't learn.
  if (body.website) return NextResponse.json({ ok: true });

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();

  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "Name, phone and email are required" },
      { status: 400 },
    );
  }

  const lead = {
    name,
    phone,
    email,
    suburb: body.suburb?.trim() || "—",
    vehicle: body.vehicle?.trim() || "—",
    expectedPrice: body.expectedPrice?.trim() || "—",
    fuel: body.fuel?.trim() || "—",
    condition: body.condition?.trim() || "—",
    receivedAt: new Date().toISOString(),
    ip,
  };

  const webhook = process.env.QUOTE_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.QUOTE_TO_EMAIL;

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
          from: "Website Enquiry <onboarding@resend.dev>",
          to: [toEmail],
          reply_to: email,
          subject: `New car quote enquiry — ${name} (${lead.suburb})`,
          text: Object.entries(lead)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    } else {
      console.warn(
        "[quote] No QUOTE_WEBHOOK_URL or RESEND_API_KEY set — lead logged only:",
        lead,
      );
    }
  } catch (err) {
    console.error("[quote] Delivery failed:", err);
    return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
