import { NextResponse } from "next/server";

import { processDueQuoteLeads } from "@/lib/quote-outbox";
import { reconcileQuoteReceipts } from "@/lib/quote-reconciliation";
import { recordQuoteWorkerHealth } from "@/lib/quote-health";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  if (process.env.VERCEL_ENV !== "production" || process.env.NODE_ENV === "development") {
    return json({ error: "Scheduled delivery is unavailable in this environment." }, 404);
  }
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

  const startedAt = Date.now();
  try {
    const result = await processDueQuoteLeads(10, {}, { deadlineMs: startedAt + 40_000 });
    const receipts = await reconcileQuoteReceipts({ deadlineAt: startedAt + 53_000, limit: 10 });
    const degraded = result.deadLettered > 0 || result.finalizeConflicts > 0 ||
      result.errors > 0 || (result.health?.dead ?? 0) > 0 ||
      (result.health?.oldestPendingAgeSeconds ?? 0) > 15 * 60 ||
      receipts.failures > 0 || receipts.conflicts > 0;
    const healthy = await recordQuoteWorkerHealth({ workerSucceeded: !degraded });
    const log = healthy ? console.info : console.error;
    log(
      JSON.stringify({
        event: "quote_outbox_cron",
        outcome: healthy ? "success" : "degraded",
        ...result,
        receipts,
      }),
    );
    return json({ ok: healthy, degraded: !healthy, ...result, receipts }, healthy ? 200 : 503);
  } catch {
    if (Date.now() < startedAt + 56_000) {
      try { await recordQuoteWorkerHealth({ workerSucceeded: false }); } catch {
        // A database outage also makes the public health read fail closed.
      }
    }
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
