import { createHash } from "node:crypto";
import {
  neon,
  type NeonQueryFunctionInTransaction,
  type NeonQueryInTransaction,
} from "@neondatabase/serverless";

import type {
  QuoteDeliveryFailureReason,
  QuoteDeliveryProvider,
} from "./quote-delivery";
import type { QuoteEmailLead } from "./quote-email";

export const MAX_QUOTE_DELIVERY_ATTEMPTS = 8;
export const QUOTE_DELIVERY_LEASE_SECONDS = 120;
export const QUOTE_DATABASE_TIMEOUT_MS = 3_000;
// Conservative margin within Resend's 24-hour provider idempotency window.
export const QUOTE_SAFE_REPLAY_HOURS = 23;

export type QuoteOutboxState =
  | "pending"
  | "processing"
  | "succeeded"
  | "dead";

export type PersistedQuote = Readonly<{
  leadId: string;
  provider: QuoteDeliveryProvider;
  state: QuoteOutboxState;
}>;

export type ClaimedQuote = Readonly<{
  outboxId: string;
  provider: QuoteDeliveryProvider;
  attempts: number;
  leaseToken: string;
  lead: QuoteEmailLead;
}>;

export class QuoteStorageConfigurationError extends Error {
  constructor() {
    super("Quote storage is not configured.");
    this.name = "QuoteStorageConfigurationError";
  }
}

function database() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new QuoteStorageConfigurationError();
  const sql = neon(connectionString, {
    fetchOptions: { signal: AbortSignal.timeout(QUOTE_DATABASE_TIMEOUT_MS) },
  });
  // Bound both client waiting and database work, including lock waits. Settings
  // are transaction-local, so they cannot leak through a pooled connection.
  const limits = "SELECT set_config('statement_timeout', '2500', true), set_config('lock_timeout', '2000', true)";
  return {
    async query(query: string, values: unknown[] = []) {
      const results = await sql.transaction((tx) => [
        tx.query(limits),
        tx.query(query, values),
      ]);
      return results[1];
    },
    async transaction(
      queries: (tx: NeonQueryFunctionInTransaction<false, false>) => NeonQueryInTransaction[],
    ) {
      const results = await sql.transaction((tx) => [tx.query(limits), ...queries(tx)]);
      return results.slice(1);
    },
  };
}

export function quotePayloadHash(lead: QuoteEmailLead) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        lead.name,
        lead.phone,
        lead.suburb,
        lead.vehicle,
        lead.expectedPrice,
        lead.condition,
      ]),
    )
    .digest("hex");
}

function asString(value: unknown) {
  return typeof value === "string" ? value : String(value ?? "");
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function asIsoString(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(asString(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error("Quote storage returned an invalid timestamp.");
  }
  return date.toISOString();
}

function claimedQuote(row: Record<string, unknown>): ClaimedQuote {
  return {
    outboxId: asString(row.outbox_id),
    provider: asString(row.provider) as QuoteDeliveryProvider,
    attempts: asNumber(row.attempts),
    leaseToken: asString(row.lease_token),
    lead: {
      leadId: asString(row.lead_id),
      name: asString(row.name),
      phone: asString(row.phone),
      suburb: asString(row.suburb),
      vehicle: asString(row.vehicle),
      expectedPrice: asString(row.expected_price),
      condition: asString(row.vehicle_condition),
      receivedAt: asIsoString(row.received_at),
    },
  };
}

export async function persistQuote(
  lead: QuoteEmailLead,
  provider: QuoteDeliveryProvider,
): Promise<
  | Readonly<{ ok: true; quote: PersistedQuote }>
  | Readonly<{ ok: false; reason: "idempotency_conflict" }>
> {
  const sql = database();
  const payloadHash = quotePayloadHash(lead);
  const transactionResults = await sql.transaction((tx) => [
    tx.query(
      `
        INSERT INTO quote_leads (
          lead_id, payload_sha256, name, phone, suburb, vehicle,
          expected_price, vehicle_condition, received_at, purge_after
        )
        VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8,
          $9::timestamptz, $9::timestamptz + interval '12 months'
        )
        ON CONFLICT (lead_id) DO NOTHING
      `,
      [
        lead.leadId,
        payloadHash,
        lead.name,
        lead.phone,
        lead.suburb,
        lead.vehicle,
        lead.expectedPrice,
        lead.condition,
        lead.receivedAt,
      ],
    ),
    tx.query(
      `
        INSERT INTO quote_delivery_outbox (lead_id, provider)
        SELECT lead_id, $3
        FROM quote_leads
        WHERE lead_id = $1::uuid AND payload_sha256 = $2
        ON CONFLICT (lead_id) DO NOTHING
      `,
      [lead.leadId, payloadHash, provider],
    ),
    tx.query(
      `
        SELECT
          l.lead_id::text AS lead_id,
          l.payload_sha256 = $2 AS same_payload,
          o.provider,
          o.state
        FROM quote_leads AS l
        LEFT JOIN quote_delivery_outbox AS o USING (lead_id)
        WHERE l.lead_id = $1::uuid
      `,
      [lead.leadId, payloadHash],
    ),
  ]);

  const row = (transactionResults[2] as Record<string, unknown>[])[0];
  if (!row) throw new Error("Quote persistence did not return the stored lead.");
  if (row.same_payload !== true) {
    return { ok: false, reason: "idempotency_conflict" };
  }
  if (!row.provider || !row.state) {
    throw new Error("Quote persistence did not create an outbox event.");
  }

  return {
    ok: true,
    quote: {
      leadId: asString(row.lead_id),
      provider: asString(row.provider) as QuoteDeliveryProvider,
      state: asString(row.state) as QuoteOutboxState,
    },
  };
}

const claimedColumns = `
  c.outbox_id::text AS outbox_id,
  c.provider,
  c.attempts,
  c.lease_token::text AS lease_token,
  l.lead_id::text AS lead_id,
  l.name,
  l.phone,
  l.suburb,
  l.vehicle,
  l.expected_price,
  l.vehicle_condition,
  l.received_at::text AS received_at
`;

export async function claimQuoteByLeadId(
  leadId: string,
  leaseToken: string,
): Promise<ClaimedQuote | null> {
  const sql = database();
  const rows = await sql.query(
    `
      WITH picked AS (
        SELECT outbox_id
        FROM quote_delivery_outbox
        WHERE lead_id = $1::uuid
          AND state IN ('pending', 'processing')
          AND run_after <= now()
          AND attempts < $3
          AND (state = 'pending' OR provider = 'resend')
          AND (attempts = 0 OR EXISTS (
            SELECT 1 FROM quote_leads AS l
            WHERE l.lead_id = quote_delivery_outbox.lead_id
              AND l.received_at > now() - ($5 * interval '1 hour')
          ))
        FOR UPDATE SKIP LOCKED
      ),
      claimed AS (
        UPDATE quote_delivery_outbox AS o
        SET state = 'processing',
            attempts = o.attempts + 1,
            run_after = now() + ($4 * interval '1 second'),
            lease_token = $2::uuid,
            updated_at = now()
        FROM picked
        WHERE o.outbox_id = picked.outbox_id
        RETURNING o.*
      )
      SELECT ${claimedColumns}
      FROM claimed AS c
      JOIN quote_leads AS l USING (lead_id)
    `,
    [
      leadId,
      leaseToken,
      MAX_QUOTE_DELIVERY_ATTEMPTS,
      QUOTE_DELIVERY_LEASE_SECONDS,
      QUOTE_SAFE_REPLAY_HOURS,
    ],
  );

  const row = (rows as Record<string, unknown>[])[0];
  return row ? claimedQuote(row) : null;
}

export async function claimDueQuotes(
  limit: number,
  leaseToken: string,
): Promise<ClaimedQuote[]> {
  const sql = database();
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(25, Math.floor(limit))) : 1;
  const rows = await sql.query(
    `
      WITH picked AS (
        SELECT outbox_id
        FROM quote_delivery_outbox
        WHERE state IN ('pending', 'processing')
          AND run_after <= now()
          AND attempts < $2
          AND (state = 'pending' OR provider = 'resend')
          AND (attempts = 0 OR EXISTS (
            SELECT 1 FROM quote_leads AS l
            WHERE l.lead_id = quote_delivery_outbox.lead_id
              AND l.received_at > now() - ($5 * interval '1 hour')
          ))
        ORDER BY run_after, outbox_id
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      ),
      claimed AS (
        UPDATE quote_delivery_outbox AS o
        SET state = 'processing',
            attempts = o.attempts + 1,
            run_after = now() + ($4 * interval '1 second'),
            lease_token = $3::uuid,
            updated_at = now()
        FROM picked
        WHERE o.outbox_id = picked.outbox_id
        RETURNING o.*
      )
      SELECT ${claimedColumns}
      FROM claimed AS c
      JOIN quote_leads AS l USING (lead_id)
      ORDER BY c.outbox_id
    `,
    [
      safeLimit,
      MAX_QUOTE_DELIVERY_ATTEMPTS,
      leaseToken,
      QUOTE_DELIVERY_LEASE_SECONDS,
      QUOTE_SAFE_REPLAY_HOURS,
    ],
  );

  return (rows as Record<string, unknown>[]).map(claimedQuote);
}

export async function markQuoteAccepted(
  quote: ClaimedQuote,
  input: Readonly<{
    httpStatus: number;
    providerReceiptId?: string;
  }>,
) {
  const sql = database();
  const rows = await sql.query(
    `
      UPDATE quote_delivery_outbox
      SET state = 'succeeded',
          lease_token = NULL,
          last_http_status = $3,
          last_error_code = NULL,
          provider_receipt_id = $4,
          provider_status = 'accepted',
          provider_status_at = now(),
          finished_at = now(),
          updated_at = now()
      WHERE outbox_id = $1::bigint
        AND state = 'processing'
        AND lease_token = $2::uuid
      RETURNING outbox_id
    `,
    [
      quote.outboxId,
      quote.leaseToken,
      input.httpStatus,
      input.providerReceiptId?.slice(0, 255) ?? null,
    ],
  );
  return rows.length === 1;
}

export async function markQuoteFailure(
  quote: ClaimedQuote,
  input: Readonly<{
    retry: boolean;
    retryAt: Date;
    reason: QuoteDeliveryFailureReason;
    httpStatus?: number;
    consumeAttempt: boolean;
  }>,
) {
  const sql = database();
  const rows = await sql.query(
    `
      UPDATE quote_delivery_outbox
      SET state = CASE WHEN $3 THEN 'pending' ELSE 'dead' END,
          run_after = CASE WHEN $3 THEN $4::timestamptz ELSE run_after END,
          lease_token = NULL,
          attempts = CASE WHEN $7 THEN attempts ELSE GREATEST(0, attempts - 1) END,
          last_http_status = $5,
          last_error_code = $6,
          provider_status = CASE WHEN $3 THEN provider_status ELSE 'failed' END,
          provider_status_at = CASE WHEN $3 THEN provider_status_at ELSE now() END,
          finished_at = CASE WHEN $3 THEN NULL ELSE now() END,
          updated_at = now()
      WHERE outbox_id = $1::bigint
        AND state = 'processing'
        AND lease_token = $2::uuid
      RETURNING outbox_id
    `,
    [
      quote.outboxId,
      quote.leaseToken,
      input.retry,
      input.retryAt.toISOString(),
      input.httpStatus ?? null,
      input.reason.slice(0, 64),
      input.consumeAttempt,
    ],
  );
  return rows.length === 1;
}

export type ExpiredQuoteFailure = Readonly<{
  leadId: string;
  provider: QuoteDeliveryProvider;
  attempts: number;
  reason: string;
}>;

export async function deadLetterExpiredFinalLeases(): Promise<ExpiredQuoteFailure[]> {
  const sql = database();
  const rows = await sql.query(
    `
      WITH expired AS (
        SELECT o.outbox_id,
          CASE
            WHEN o.state = 'processing' AND o.provider = 'webhook'
              THEN 'lease_expired_delivery_unknown'
            WHEN o.attempts >= $1 THEN 'lease_expired_at_attempt_cap'
            ELSE 'idempotency_window_expired'
          END AS reason
        FROM quote_delivery_outbox AS o
        JOIN quote_leads AS l USING (lead_id)
        WHERE o.state IN ('pending', 'processing')
          AND o.run_after <= now()
          AND o.attempts > 0
          AND (
            (o.state = 'processing' AND (o.attempts >= $1 OR o.provider = 'webhook'))
            OR l.received_at <= now() - ($2 * interval '1 hour')
          )
        ORDER BY o.run_after, o.outbox_id
        FOR UPDATE OF o SKIP LOCKED
        LIMIT 100
      )
      UPDATE quote_delivery_outbox AS o
      SET state = 'dead',
          lease_token = NULL,
          last_error_code = expired.reason,
          provider_status = 'failed',
          provider_status_at = now(),
          finished_at = now(),
          updated_at = now()
      FROM expired
      WHERE o.outbox_id = expired.outbox_id
      RETURNING o.lead_id::text, o.provider, o.attempts, o.last_error_code
    `,
    [MAX_QUOTE_DELIVERY_ATTEMPTS, QUOTE_SAFE_REPLAY_HOURS],
  );
  return (rows as Record<string, unknown>[]).map((row) => ({
    leadId: asString(row.lead_id),
    provider: asString(row.provider) as QuoteDeliveryProvider,
    attempts: asNumber(row.attempts),
    reason: asString(row.last_error_code),
  }));
}

export async function quoteOutboxHealth() {
  const rows = await database().query(`
    SELECT
      count(*) FILTER (WHERE o.state = 'pending')::int AS pending,
      count(*) FILTER (WHERE o.state = 'processing')::int AS processing,
      count(*) FILTER (WHERE o.state = 'dead')::int AS dead,
      COALESCE(EXTRACT(EPOCH FROM now() - min(l.received_at)
        FILTER (WHERE o.state IN ('pending', 'processing'))), 0)::int AS oldest_pending_age_seconds
    FROM quote_delivery_outbox AS o
    JOIN quote_leads AS l USING (lead_id)
  `);
  const row = rows[0];
  return {
    pending: asNumber(row.pending),
    processing: asNumber(row.processing),
    dead: asNumber(row.dead),
    oldestPendingAgeSeconds: Math.max(0, asNumber(row.oldest_pending_age_seconds)),
  };
}

export async function purgeExpiredQuoteLeads(limit = 100) {
  const sql = database();
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const rows = await sql.query(
    `
      WITH expired AS (
        SELECT lead_id
        FROM quote_leads
        WHERE purge_after <= now()
        ORDER BY purge_after
        LIMIT $1
      )
      DELETE FROM quote_leads AS l
      USING expired
      WHERE l.lead_id = expired.lead_id
      RETURNING l.lead_id
    `,
    [safeLimit],
  );
  return rows.length;
}
