-- Metadata only: no customer content or provider response bodies are copied.
ALTER TABLE quote_delivery_outbox
  ADD COLUMN IF NOT EXISTS provider_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS provider_reconcile_after timestamptz,
  ADD COLUMN IF NOT EXISTS provider_reconcile_token uuid,
  ADD COLUMN IF NOT EXISTS provider_reconcile_error text
    CHECK (provider_reconcile_error IS NULL OR char_length(provider_reconcile_error) <= 64);

-- migrate:split

CREATE INDEX IF NOT EXISTS quote_outbox_reconciliation_idx
  ON quote_delivery_outbox (provider_reconcile_after, outbox_id)
  WHERE provider = 'resend' AND state = 'succeeded'
    AND provider_receipt_id IS NOT NULL;

-- migrate:split

CREATE TABLE IF NOT EXISTS quote_worker_health (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton = true),
  checked_at timestamptz NOT NULL,
  healthy boolean NOT NULL
);
