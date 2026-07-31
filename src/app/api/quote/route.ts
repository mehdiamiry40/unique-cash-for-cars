import { NextResponse } from "next/server";
import { site } from "@/content/site";

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
 * Naive in-memory rate limit.
 *
 * On Vercel each serverless isolate has its own Map, so this is a soft brake
 * against accidental double-submits on a warm instance — not a hard ceiling
 * under load. Swap for Upstash / Vercel KV if abuse becomes an issue.
 */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 32_000;
/** Cap on distinct IPs tracked, so a spray of unique sources cannot grow the map without bound. */
const MAX_TRACKED_IPS = 10_000;
const DELIVERY_TIMEOUT_MS = 10_000;

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

/**
 * Drops IPs whose window has emptied.
 *
 * Without this the map only ever grows: every distinct IP left a permanent
 * key, including ones whose timestamps had long since aged out. On a warm
 * serverless instance that is an unbounded leak.
 */
function sweep(now: number) {
  for (const [ip, hits] of recent) {
    if (hits.length === 0 || now - hits[hits.length - 1] >= WINDOW_MS) {
      recent.delete(ip);
    }
  }
}

function rateLimited(ip: string) {
  const now = Date.now();

  // Sweep stale keys every request. The previous "only at 10k" threshold left
  // aged IPs sitting in memory on long-lived isolates until the ceiling hit.
  if (recent.size > 0) sweep(now);
  if (recent.size >= MAX_TRACKED_IPS) {
    // Still full after a sweep — drop the oldest tracked IP rather than grow.
    const oldest = recent.keys().next().value;
    if (oldest !== undefined) recent.delete(oldest);
  }

  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
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

  return new TextDecoder().decode(
    chunks.reduce<Uint8Array>((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length);
      merged.set(acc);
      merged.set(chunk, acc.length);
      return merged;
    }, new Uint8Array()),
  );
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json(
      { error: "This enquiry could not be verified. Please refresh and try again." },
      403,
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return json(
      { error: "Too many enquiries were sent. Please wait a minute and try again." },
      429,
    );
  }

  const raw = await readBody(request);
  if (raw === null) {
    return json({ error: "This enquiry is too large." }, 413);
  }

  let body: QuotePayload;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "The enquiry could not be read." }, 400);
  }

  // Honeypot tripped — accept silently so the bot doesn't learn.
  // No `leadId`: the client must not treat this as a delivered conversion.
  if (body.contactRef) return json({ ok: true });

  const name = text(body.name, 100);
  const phone = text(body.phone, 40);

  // Phone-only contact. The public form does not collect email — we call back.
  if (!name || !phone) {
    return json({ error: "Name and phone are required." }, 400);
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return json({ error: "Please enter a valid phone number." }, 400);
  }

  const leadId = crypto.randomUUID();

  const lead = {
    leadId,
    name,
    phone,
    suburb: text(body.suburb, 120) || "—",
    vehicle: text(body.vehicle, 160) || "—",
    // Kept for older clients / CRM mappings; the public form no longer asks.
    expectedPrice: text(body.expectedPrice, 60) || "—",
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
          `Online enquiries are temporarily unavailable. Please call ${site.phone.display}.`,
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
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
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
          subject: `New car quote enquiry — ${name} (${lead.suburb})`,
          text: Object.entries(lead)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        }),
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    }
  } catch (err) {
    console.error("[quote] Delivery failed:", err);
    return json(
      {
        error:
          `Your enquiry could not be sent. Please try again or call ${site.phone.display}.`,
      },
      502,
    );
  }

  return json({ ok: true, leadId });
}
