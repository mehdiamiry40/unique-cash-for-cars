# Quote delivery runbook

The quote API acknowledges a valid enquiry only after `quote_leads` and its
single `quote_delivery_outbox` row commit together. `succeeded` means the
configured provider accepted the request; it does not prove inbox placement.
All non-production environments (including local `next start`) instead return an explicitly labelled simulation:
they validate input, save nothing, send nothing and count no conversion.

## Normal states

| State | Meaning | Operator action |
|---|---|---|
| `pending` | Waiting for the immediate worker or a scheduled retry | None unless age is increasing |
| `processing` | Leased to one worker for up to two minutes | None; an expired lease is reclaimable |
| `succeeded` | Provider returned a successful HTTP response | Confirm inbox delivery when investigating a complaint |
| `dead` | Permanent/ambiguous webhook failure or retry budget exhausted | Reconcile manually; never blindly replay |

The production cron invokes `/api/cron/quote-delivery` every five minutes. It
starts at most ten deliveries and stops claiming when the next claim, send,
finalization and maintenance budget cannot fit within its deadline. The route
allows 60 seconds; delivery work gets at most 40 seconds, leaving room for
receipt reconciliation, health recording and the response. Each provider call
has a ten-second timeout. Storage calls have a three-second client timeout,
a 2.5-second statement timeout and a two-second lock timeout. Rows are claimed
one at a time immediately before sending, so waiting rows retain their attempt
budget. A slow batch leaves the remaining rows pending for the next cron.

Resend transient failures reuse the original provider and `quote/<lead UUID>`
key. Unknown webhook outcomes, including crashed processing leases, require
manual reconciliation. Automatic replay of an already-attempted enquiry stops
23 hours after its original receipt time, conservatively inside Resend's
24-hour idempotency window. A configuration outage does not consume attempts;
a never-attempted enquiry can still make its first send. Enquiries are purged
after 12 months.

## Alerts to configure in Vercel

Create log alerts for these exact structured fields:

- `event = quote_outbox`, `outcome = dead_lettered`
- `event = quote_outbox`, `outcome = worker_error`
- `event = quote_outbox`, `outcome = immediate_worker_error`
- `event = quote_outbox`, `outcome = finalize_conflict`
- `event = quote_outbox_cron`, `outcome = degraded`
- `event = quote_outbox_cron`, `outcome = failure`
- `event = quote_persistence`, `outcome = failure`
- `event = quote_reconciliation`, `outcome = failure`

Expired final leases and unsafe replays emit an individual error-level
`dead_lettered` event with the affected reference and reason. A cron with new
terminal failures, worker errors, finalization conflicts, existing dead rows or
a backlog older than 15 minutes emits `degraded` and returns HTTP 503.
A completed degraded run is not a healthy queue. Summary health fields
include counts for pending, processing and dead rows and the oldest pending age.

Assign delivery incidents to the business owner who handles enquiries, with the
repository maintainer responsible for storage/provider failures. Configure a
missing heartbeat alert after 15 minutes (three expected cron ticks), and route
all rules above to that same owner. These are deployment requirements: source
logging alone does not create a notification. Verify the destination using an
isolated non-customer incident and record the acknowledgement. The repository's
Quote health workflow checks the public endpoint every ten minutes once
`QUOTE_HEALTH_MONITOR_ENABLED` is set to `true`. Failed runs surface in GitHub
Actions and use the repository owner's configured Actions notification settings;
confirm those notifications are enabled and received. This does not send an email
through the potentially failing quote provider.

Logs contain only a short reference, provider, attempt, allowlisted reason,
worker phase, aggregate health counts and HTTP status. They must never include the customer fields, credentials, webhook
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
   OR o.provider_status IN ('bounced', 'complained', 'suppressed', 'failed')
   OR o.provider_reconcile_error IS NOT NULL
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
requeue a dead row. Preserve the lead UUID, payload and pinned provider. An
expired-window record must be reconciled against provider evidence before
resetting its attempts; that reset authorizes a new first attempt and cannot
restore an expired provider deduplication guarantee. Record who reviewed the
provider evidence and when in the incident record:

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

The migration runner applies every numbered repository migration in one locked
transaction, skips completed migrations inside the same lock, and records each
one in the ledger. Migration `002_quote_monitoring` is additive and must be
applied before deploying the receipt/health code. Existing capture and delivery
code remains compatible with this migration for rollback.

## Receipt reconciliation and health

After delivery work, the cron spends at most twelve seconds checking Resend
receipt IDs through `GET /emails/:id`, with a three-second request deadline.
The existing production `RESEND_API_KEY` must permit email retrieval. A 401/403
sets an actionable reconciliation error; do not silently ignore it or widen a
key's permissions without checking its account and scope. Provider bodies and
customer fields are neither logged nor copied to the monitoring table.

Pending receipts are checked approximately every five minutes as capacity
allows. Delivered receipts are checked daily for late complaints, for up to
thirty days (Resend's retrieval-retention window). Leases and conditional writes
protect competing checks; delayed/sent snapshots do not undo delivered or failed
states. `delivered` means receipt by the recipient's mail server, not inbox
placement or a human read. Generic webhook delivery still requires the
receiver's own monitored acknowledgement; Resend polling does not apply to it.

`GET /api/health/quote` returns only `{ "healthy": true }` (200) or
`{ "healthy": false }` (503). It exposes no queue counts, references or customer
details. It checks a heartbeat newer than fifteen minutes and fresh queue/error
metadata. Missing schema, database errors, stale heartbeats, dead enquiries,
old undelivered work and unresolved provider errors fail closed. A small
in-process cache is limited to sixty seconds and never extends heartbeat expiry.
Non-production health returns unavailable without touching the database.

Enable the scheduled health workflow only after the production migration,
deployment and first healthy cron run. Its repository-variable gate keeps new
workflow commits from alerting against an older deployment without the endpoint.

If a provider failure has been manually resolved, record the operator and
provider evidence in the incident record before updating the specific row's
status/error. Never clear failures in bulk to make a health check green.

## Environment isolation and recovery

Production database and delivery credentials belong only to the production
environment. Preview/development validation uses simulation and must not receive
the production connection or recipient. Existing immutable deployments and
previously downloaded local environment files retain their old snapshots;
restrict access and retire those through the normal deployment/credential
lifecycle. Never commit downloaded environment files.

Before a recovery drill, record the Neon backup/PITR window, a named owner,
approved recovery-point and recovery-time targets. Restore into an isolated
branch with notifications disabled, verify row/ledger integrity, then reconcile
provider receipts before replaying any recovered outbox rows. The local
PostgreSQL concurrency tests validate application behavior; they do not prove
the hosted account's backup policy or disaster-recovery time.


## Regression verification

Run deterministic delivery behavior tests with:

```sh
node --test tests/quote-outbox-worker.test.mjs
```

CI also runs the actual store queries and transactions against an isolated
PostgreSQL service. To run the same suite locally, provide a disposable local
database named `quote_outbox_test`:

```sh
QUOTE_TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/quote_outbox_test npm run test:db
```

The suite refuses remote hosts, any other database name, connection overrides,
and a missing test URL. It never falls back to `DATABASE_URL`, and creates and
removes its own randomly named schema. It covers concurrent deduplication,
payload conflicts, rollback, competing claims, stale lease finalization,
uncertain replay, expiry, configuration pauses, retention and database lock
limits. Do not run this suite against a production database or customer records.
