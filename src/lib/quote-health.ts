import { boundedQuoteQuery } from "./quote-observability-db";

const HEARTBEAT_MAX_AGE_MS = 15 * 60 * 1_000;
const CACHE_MS = 60_000;

// Only metadata is inspected. A saved failure stays unhealthy until an operator
// resolves it; successful future cron runs must not hide an unrecovered lead.
const queueHealthySql = `NOT EXISTS (
  SELECT 1 FROM quote_delivery_outbox AS o
  JOIN quote_leads AS l USING (lead_id)
  WHERE o.state = 'dead'
    OR (o.state IN ('pending', 'processing')
      AND l.received_at <= now() - interval '15 minutes')
    OR o.provider_status IN ('bounced', 'complained', 'suppressed', 'failed')
    OR o.provider_reconcile_error IS NOT NULL
    OR (o.provider = 'resend' AND o.state = 'succeeded'
      AND (o.provider_status IS NULL OR o.provider_status IN ('accepted', 'delayed'))
      AND o.finished_at <= now() - interval '15 minutes')
)`;

export async function recordQuoteWorkerHealth(
  input: Readonly<{ workerSucceeded: boolean }>,
  query = boundedQuoteQuery,
): Promise<boolean> {
  const rows = await query(
    `INSERT INTO quote_worker_health (singleton, checked_at, healthy)
     VALUES (true, now(), $1::boolean AND ${queueHealthySql})
     ON CONFLICT (singleton) DO UPDATE
     SET checked_at = EXCLUDED.checked_at, healthy = EXCLUDED.healthy
     RETURNING healthy`,
    [input.workerSucceeded],
  );
  return rows[0]?.healthy === true;
}

type HealthSnapshot = Readonly<{ healthy: boolean; checkedAt: number }>;

async function readQuoteHealth(): Promise<HealthSnapshot | null> {
  const rows = await boundedQuoteQuery(
    `SELECT h.healthy AND ${queueHealthySql} AS healthy,
            h.checked_at::text AS checked_at
     FROM quote_worker_health AS h WHERE singleton = true`,
  );
  const row = rows[0];
  if (!row) return null;
  return { healthy: row.healthy === true, checkedAt: new Date(String(row.checked_at)).getTime() };
}

export function createQuoteHealthReader(
  dependencies: Readonly<{
    now: () => number;
    read: () => Promise<HealthSnapshot | null>;
  }> = { now: Date.now, read: readQuoteHealth },
) {
  let cache: { healthy: boolean; expiresAt: number } | undefined;
  let pending: Promise<boolean> | undefined;

  return async function getHealth(): Promise<boolean> {
    const now = dependencies.now();
    if (cache && now < cache.expiresAt) return cache.healthy;
    if (pending) return pending;
    const task = (async () => {
      try {
        const snapshot = await dependencies.read();
        const checkedNow = dependencies.now();
        const validUntil = (snapshot?.checkedAt ?? 0) + HEARTBEAT_MAX_AGE_MS;
        const healthy = snapshot?.healthy === true
          && Number.isFinite(snapshot.checkedAt)
          && snapshot.checkedAt <= checkedNow
          && checkedNow < validUntil;
        cache = { healthy,
          expiresAt: healthy ? Math.min(checkedNow + CACHE_MS, validUntil) : checkedNow + CACHE_MS };
        return healthy;
      } catch {
        cache = { healthy: false, expiresAt: dependencies.now() + CACHE_MS };
        return false;
      }
    })();
    pending = task;
    try { return await task; } finally {
      if (pending === task) pending = undefined;
    }
  };
}

export const getQuoteHealth = createQuoteHealthReader();
