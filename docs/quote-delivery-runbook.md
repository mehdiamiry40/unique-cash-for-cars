# Quote delivery runbook

The quote API acknowledges a valid enquiry only after `quote_leads` and its
single `quote_delivery_outbox` row commit together. `succeeded` means the
configured provider accepted the request; it does not prove inbox placement.

## Normal states

| State | Meaning | Operator action |
|---|---|---|
| `pending` | Waiting for the immediate worker or a scheduled retry | None unless age is increasing |
| `processing` | Leased to one worker for up to two minutes | None; an expired lease is reclaimable |
| `succeeded` | Provider returned a successful HTTP response | Confirm inbox delivery when investigating a complaint |
| `dead` | Permanent/ambiguous webhook failure or retry budget exhausted | Reconcile manually; never blindly replay |

The production cron invokes `/api/cron/quote-delivery` every five minutes. It
processes at most ten rows, retries Resend transient failures with the same
provider idempotency key, and purges enquiries after 12 months.

## Alerts to configure in Vercel

Create log alerts for these exact structured fields:

- `event = quote_outbox`, `outcome = dead_lettered`
- `event = quote_outbox`, `outcome = worker_error`
- `event = quote_outbox_cron`, `outcome = failure`
- `event = quote_persistence`, `outcome = failure`

Logs contain only a short reference, provider, attempt, allowlisted reason and
HTTP status. They must never include the customer fields, credentials, webhook
URL or raw provider response.

## Triage queries

Run these from the Neon SQL editor. Start with metadata; read customer details
only when necessary to recover a specific enquiry.

```sql
SELECT
  o.outbox_id,
  left(l.lead_id::text, 8) AS reference,
  o.provider,
  o.state,
  o.attempts,
  o.last_http_status,
  o.last_error_code,
  o.provider_receipt_id,
  o.provider_status,
  o.run_after,
  l.received_at
FROM quote_delivery_outbox AS o
JOIN quote_leads AS l USING (lead_id)
WHERE o.state <> 'succeeded'
ORDER BY l.received_at;
```

```sql
SELECT name, phone, suburb, vehicle, expected_price, vehicle_condition
FROM quote_leads
WHERE lead_id = '<full lead UUID>'::uuid;
```

## Manual reconciliation

For a Resend row, search Resend by `provider_receipt_id` or the eight-character
reference before replaying it. For a webhook timeout, confirm with the receiver
using `X-Quote-Lead-Id` / `Idempotency-Key`; generic webhook receivers may not
deduplicate, so an automatic replay could create a duplicate.

Only after confirming that the provider did not accept the lead may an operator
requeue a dead row:

```sql
UPDATE quote_delivery_outbox
SET state = 'pending',
    attempts = 0,
    run_after = now(),
    lease_token = NULL,
    last_error_code = NULL,
    finished_at = NULL,
    updated_at = now()
WHERE outbox_id = <reviewed outbox id>
  AND state = 'dead';
```

Do not switch delivery providers while pending rows exist. Drain them first, or
retain the old provider configuration until the metadata query returns zero
pending/processing rows for it. Configuration outages pause rows without
consuming their retry budget.

## Schema and retention

Apply migrations once with `npm run db:migrate`; never migrate during a build or
request. Quote rows and their outbox metadata are deleted together after 12
months. Completed vehicle-sale records belong in the separate statutory record
system and must not be copied into this outbox.

