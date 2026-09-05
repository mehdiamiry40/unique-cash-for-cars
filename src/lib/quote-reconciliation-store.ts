import { boundedQuoteQuery } from "./quote-observability-db";
import type { QuoteProviderStatus, ReceiptCheckResult } from "./quote-reconciliation";

export type ClaimedQuoteReceipt = Readonly<{
  outboxId: string;
  receiptId: string;
  status: QuoteProviderStatus | null;
  statusAt: string | null;
  token: string;
}>;

export async function claimQuoteReceipt(token: string): Promise<ClaimedQuoteReceipt | null> {
  const rows = await boundedQuoteQuery(
    `WITH picked AS (
       SELECT outbox_id
       FROM quote_delivery_outbox
       WHERE provider = 'resend' AND state = 'succeeded'
         AND provider_receipt_id IS NOT NULL
         AND finished_at > now() - interval '30 days'
         AND (provider_reconcile_after IS NULL OR provider_reconcile_after <= now())
         AND (
           provider_status IS NULL OR provider_status IN ('accepted', 'delayed', 'delivered')
         )
       ORDER BY CASE WHEN provider_status = 'delivered' THEN 1 ELSE 0 END,
                provider_reconcile_after NULLS FIRST, outbox_id
       FOR UPDATE SKIP LOCKED LIMIT 1
     )
     UPDATE quote_delivery_outbox AS o
     SET provider_reconcile_token = $1::uuid,
         provider_reconcile_after = now() + interval '2 minutes'
     FROM picked WHERE o.outbox_id = picked.outbox_id
     RETURNING o.outbox_id::text AS outbox_id, o.provider_receipt_id,
               o.provider_status, o.provider_status_at::text AS provider_status_at`,
    [token],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    outboxId: String(row.outbox_id),
    receiptId: String(row.provider_receipt_id),
    status: row.provider_status as QuoteProviderStatus | null,
    statusAt: row.provider_status_at ? String(row.provider_status_at) : null,
    token,
  };
}

export async function finishQuoteReceiptCheck(
  receipt: ClaimedQuoteReceipt,
  result: ReceiptCheckResult,
  status: QuoteProviderStatus | null,
) {
  const rows = await boundedQuoteQuery(
    `UPDATE quote_delivery_outbox
     SET provider_status = $6::text,
         provider_status_at = CASE WHEN provider_status IS DISTINCT FROM $6::text
           THEN now() ELSE provider_status_at END,
         provider_checked_at = now(),
         provider_reconcile_token = NULL,
         provider_reconcile_error = $7::text,
         provider_reconcile_after = now() + CASE
           WHEN $7::text IS NOT NULL THEN interval '5 minutes'
           WHEN $6::text = 'delivered' THEN interval '1 day'
           ELSE interval '5 minutes' END,
         updated_at = now()
     WHERE outbox_id = $1::bigint AND provider = 'resend'
       AND state = 'succeeded' AND provider_receipt_id = $2
       AND provider_reconcile_token = $3::uuid
       AND provider_status IS NOT DISTINCT FROM $4
       AND provider_status_at IS NOT DISTINCT FROM $5::timestamptz
     RETURNING outbox_id`,
    [receipt.outboxId, receipt.receiptId, receipt.token, receipt.status,
      receipt.statusAt, status, result.ok ? null : result.reason],
  );
  return rows.length === 1;
}
