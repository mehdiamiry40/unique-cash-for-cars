CREATE TABLE IF NOT EXISTS app_migrations (
  migration_id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- migrate:split

CREATE TABLE IF NOT EXISTS quote_leads (
  lead_id uuid PRIMARY KEY,
  payload_sha256 char(64) NOT NULL
    CHECK (payload_sha256 ~ '^[0-9a-f]{64}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 1 AND 40),
  suburb text NOT NULL CHECK (char_length(suburb) BETWEEN 1 AND 120),
  vehicle text NOT NULL CHECK (char_length(vehicle) BETWEEN 1 AND 160),
  expected_price text NOT NULL CHECK (char_length(expected_price) BETWEEN 1 AND 60),
  vehicle_condition text NOT NULL CHECK (char_length(vehicle_condition) BETWEEN 1 AND 500),
  received_at timestamptz NOT NULL,
  purge_after timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (purge_after >= received_at)
);

-- migrate:split

CREATE TABLE IF NOT EXISTS quote_delivery_outbox (
  outbox_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id uuid NOT NULL UNIQUE
    REFERENCES quote_leads(lead_id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('resend', 'webhook')),
  state text NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'processing', 'succeeded', 'dead')),
  attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 8),
  run_after timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  last_http_status smallint CHECK (last_http_status BETWEEN 100 AND 599),
  last_error_code text CHECK (last_error_code IS NULL OR char_length(last_error_code) <= 64),
  provider_receipt_id text CHECK (
    provider_receipt_id IS NULL OR char_length(provider_receipt_id) <= 255
  ),
  provider_status text CHECK (
    provider_status IS NULL OR provider_status IN (
      'accepted', 'delivered', 'delayed', 'bounced', 'complained',
      'suppressed', 'failed'
    )
  ),
  provider_status_at timestamptz,
  last_provider_event_id text,
  finished_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((state = 'processing') = (lease_token IS NOT NULL))
);

-- migrate:split

CREATE INDEX IF NOT EXISTS quote_outbox_ready_idx
  ON quote_delivery_outbox (run_after, outbox_id)
  WHERE state IN ('pending', 'processing');

-- migrate:split

CREATE UNIQUE INDEX IF NOT EXISTS quote_outbox_receipt_idx
  ON quote_delivery_outbox (provider, provider_receipt_id)
  WHERE provider_receipt_id IS NOT NULL;

