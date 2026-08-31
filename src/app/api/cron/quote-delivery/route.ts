import { NextResponse } from "next/server";

import { processDueQuoteLeads } from "@/lib/quote-outbox";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error(
      JSON.stringify({
        event: "quote_outbox_cron",
        outcome: "failure",
        reason: "missing_configuration",
      }),
    );
    return json({ error: "Scheduled delivery is not configured." }, 503);
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized." }, 401);
  }

  try {
    const result = await processDueQuoteLeads(10);
    console.info(
      JSON.stringify({
        event: "quote_outbox_cron",
        outcome: "success",
        ...result,
      }),
    );
    return json({ ok: true, ...result });
  } catch {
    console.error(
      JSON.stringify({
        event: "quote_outbox_cron",
        outcome: "failure",
        reason: "worker_error",
      }),
    );
    return json({ error: "Scheduled delivery failed." }, 500);
  }
}

