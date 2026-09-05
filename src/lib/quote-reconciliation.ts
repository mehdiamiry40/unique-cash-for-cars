import { randomUUID } from "node:crypto";

import { quoteOperationWithTimeout } from "./quote-observability-db";
import {
  claimQuoteReceipt,
  finishQuoteReceiptCheck,
  type ClaimedQuoteReceipt,
} from "./quote-reconciliation-store";

export type QuoteProviderStatus =
  | "accepted" | "delayed" | "delivered" | "bounced"
  | "complained" | "suppressed" | "failed";

export type ReceiptCheckResult =
  | Readonly<{ ok: true; status: QuoteProviderStatus }>
  | Readonly<{
      ok: false;
      reason: "missing_configuration" | "invalid_receipt" | "http_error"
        | "invalid_response" | "receipt_mismatch" | "unknown_status"
        | "timeout" | "fetch_error";
      httpStatus?: number;
    }>;

const PROVIDER_TIMEOUT_MS = 3_000;
const MAX_RECONCILIATION_MS = 12_000;
// One claim, one provider request and one CAS finalization, plus scheduling margin.
const MIN_RECEIPT_BUDGET_MS = 6_500;
const FAILURE_STATUSES = new Set<QuoteProviderStatus>([
  "bounced", "complained", "suppressed", "failed",
]);

export function quoteProviderStatus(event: unknown): QuoteProviderStatus | null {
  if (typeof event !== "string") return null;
  switch (event) {
    case "accepted": case "sent": case "queued": case "scheduled":
      return "accepted";
    case "delayed": case "delivery_delayed": return "delayed";
    case "opened": case "clicked": case "delivered": return "delivered";
    case "bounced": case "complained": case "suppressed": case "failed":
      return event;
    case "canceled": return "failed";
    default: return null;
  }
}

export function nextQuoteProviderStatus(
  current: QuoteProviderStatus | null,
  observed: QuoteProviderStatus,
): QuoteProviderStatus {
  // A late complaint remains actionable even after an earlier delivery. Never
  // clear an actionable failure with a stale sent/delivered API snapshot.
  if (current === "complained" || observed === "complained") return "complained";
  if (current && FAILURE_STATUSES.has(current)) return current;
  if (FAILURE_STATUSES.has(observed)) return observed;
  if (current === "delivered") return current;
  if (current === "delayed" && observed === "accepted") return current;
  return observed;
}

export async function retrieveQuoteReceipt(
  receiptId: string,
  input: Readonly<{ apiKey?: string; timeoutMs?: number }> = {},
  fetchImplementation: typeof globalThis.fetch = globalThis.fetch,
): Promise<ReceiptCheckResult> {
  const apiKey = input.apiKey?.trim();
  if (!apiKey) return { ok: false, reason: "missing_configuration" };
  if (!/^[A-Za-z0-9_-]{1,255}$/.test(receiptId)) {
    return { ok: false, reason: "invalid_receipt" };
  }
  try {
    return await quoteOperationWithTimeout(
      Math.min(PROVIDER_TIMEOUT_MS, Math.max(1, input.timeoutMs ?? PROVIDER_TIMEOUT_MS)),
      async (signal): Promise<ReceiptCheckResult> => {
        const response = await fetchImplementation(
          `https://api.resend.com/emails/${encodeURIComponent(receiptId)}`,
          { method: "GET", headers: { Authorization: `Bearer ${apiKey}` },
            signal, cache: "no-store", redirect: "error" },
        );
        if (!response.ok) {
          return { ok: false, reason: "http_error", httpStatus: response.status };
        }
        let body: unknown;
        try { body = await response.json(); } catch {
          return { ok: false, reason: "invalid_response" };
        }
        if (!body || typeof body !== "object" || !("id" in body)) {
          return { ok: false, reason: "invalid_response" };
        }
        if (body.id !== receiptId) return { ok: false, reason: "receipt_mismatch" };
        const status = quoteProviderStatus("last_event" in body ? body.last_event : undefined);
        return status ? { ok: true, status } : { ok: false, reason: "unknown_status" };
      },
    );
  } catch (error) {
    const timeout = error && typeof error === "object" && "name" in error
      && (error.name === "TimeoutError" || error.name === "AbortError");
    return { ok: false, reason: timeout ? "timeout" : "fetch_error" };
  }
}

type ReconciliationDependencies = Readonly<{
  now: () => number;
  claim: (token: string) => Promise<ClaimedQuoteReceipt | null>;
  check: (receiptId: string) => Promise<ReceiptCheckResult>;
  finish: typeof finishQuoteReceiptCheck;
  report: (event: Record<string, string | number>) => void;
}>;

export async function reconcileQuoteReceipts(
  options: Readonly<{ deadlineAt?: number; limit?: number }> = {},
  overrides: Partial<ReconciliationDependencies> = {},
) {
  const dependencies: ReconciliationDependencies = {
    now: overrides.now ?? Date.now,
    claim: overrides.claim ?? claimQuoteReceipt,
    check: overrides.check ?? ((receiptId) => retrieveQuoteReceipt(receiptId, {
      apiKey: process.env.RESEND_API_KEY,
    })),
    finish: overrides.finish ?? finishQuoteReceiptCheck,
    report: overrides.report ?? ((event) => console.error(JSON.stringify(event))),
  };
  const startedAt = dependencies.now();
  const deadline = Math.min(
    options.deadlineAt ?? startedAt + MAX_RECONCILIATION_MS,
    startedAt + MAX_RECONCILIATION_MS,
  );
  const limit = Number.isFinite(options.limit)
    ? Math.max(0, Math.min(10, Math.floor(options.limit!))) : 10;
  const result = { checked: 0, updated: 0, failures: 0, conflicts: 0, exhausted: false };

  for (let index = 0; index < limit; index += 1) {
    if (deadline - dependencies.now() < MIN_RECEIPT_BUDGET_MS) {
      result.exhausted = true;
      break;
    }
    try {
      const receipt = await dependencies.claim(randomUUID());
      if (!receipt) break;
      const check = await dependencies.check(receipt.receiptId);
      result.checked += 1;
      const nextStatus = check.ok
        ? nextQuoteProviderStatus(receipt.status, check.status) : receipt.status;
      const finalized = await dependencies.finish(receipt, check, nextStatus);
      if (!finalized) result.conflicts += 1;
      else if (nextStatus !== receipt.status) result.updated += 1;
      if (!check.ok || (nextStatus && FAILURE_STATUSES.has(nextStatus))) {
        result.failures += 1;
        dependencies.report({ event: "quote_reconciliation", outcome: "failure",
          reason: check.ok ? nextStatus! : check.reason,
          ...(!check.ok && check.httpStatus ? { status: check.httpStatus } : {}),
        });
      }
      // Authentication/rate-limit failures are shared by subsequent requests.
      if (!check.ok && (check.reason === "missing_configuration"
        || check.reason === "http_error" && [401, 403, 429].includes(check.httpStatus ?? 0))) break;
    } catch {
      result.failures += 1;
      dependencies.report({ event: "quote_reconciliation", outcome: "failure",
        reason: "storage_error" });
      break;
    }
  }
  return result;
}
