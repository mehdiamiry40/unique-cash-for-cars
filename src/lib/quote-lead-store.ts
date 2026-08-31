import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

import type {
  QuoteDeliveryFailureReason,
  QuoteDeliveryProvider,
} from "./quote-delivery";
import type { QuoteEmailLead } from "./quote-email";

export const MAX_QUOTE_DELIVERY_ATTEMPTS = 8;
export const QUOTE_DELIVERY_LEASE_SECONDS = 120;

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
  return neon(connectionString);
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
  const safeLimit = Math.max(1, Math.min(25, Math.floor(limit)));
  const rows = await sql.query(
    `
      WITH picked AS (
        SELECT outbox_id
        FROM quote_delivery_outbox
        WHERE state IN ('pending', 'processing')
          AND run_after <= now()
          AND attempts < $2
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

export async function deadLetterExpiredFinalLeases() {
  const sql = database();
  const rows = await sql`
    UPDATE quote_delivery_outbox
    SET state = 'dead',
        lease_token = NULL,
        last_error_code = 'lease_expired_at_attempt_cap',
        provider_status = 'failed',
        provider_status_at = now(),
        finished_at = now(),
        updated_at = now()
    WHERE state = 'processing'
      AND run_after <= now()
      AND attempts >= ${MAX_QUOTE_DELIVERY_ATTEMPTS}
    RETURNING outbox_id
  `;
  return rows.length;
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
