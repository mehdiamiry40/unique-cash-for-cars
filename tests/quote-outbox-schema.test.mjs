import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync(
  new URL("../db/migrations/001_quote_outbox.sql", import.meta.url),
  "utf8",
);
const route = readFileSync(
  new URL("../src/app/api/quote/route.ts", import.meta.url),
  "utf8",
);
const form = readFileSync(
  new URL("../src/components/QuoteForm.tsx", import.meta.url),
  "utf8",
);
const cron = readFileSync(
  new URL("../src/app/api/cron/quote-delivery/route.ts", import.meta.url),
  "utf8",
);

test("lead and outbox schema enforce durable one-event acceptance", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS quote_leads/i);
  assert.match(migration, /lead_id uuid PRIMARY KEY/i);
  assert.match(migration, /payload_sha256 char\(64\) NOT NULL/i);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS quote_delivery_outbox/i);
  assert.match(migration, /lead_id uuid NOT NULL UNIQUE/i);
  assert.match(migration, /ON DELETE CASCADE/i);
  assert.match(migration, /state IN \('pending', 'processing', 'succeeded', 'dead'\)/i);
  assert.match(migration, /\(state = 'processing'\) = \(lease_token IS NOT NULL\)/i);
});

test("browser, API and provider boundaries all carry idempotency", () => {
  assert.match(form, /"Idempotency-Key": identity\.key/);
  assert.match(form, /sessionStorage\.setItem/);
  assert.match(route, /request\.headers\.get\("idempotency-key"\)/);
  assert.match(route, /await persistQuote\(lead, delivery\.provider\)/);
  assert.match(route, /processQuoteLeadNow\(leadId\)/);
  assert.match(route, /key\.reason === "missing" \? 428 : 400/);
  assert.doesNotMatch(route, /if \(!supplied\)[^\n]*crypto\.randomUUID/);
  assert.match(route, /processingOutcome === "dead_lettered"/);
  assert.match(route, /persisted\.quote\.state === "dead"/);
});

test("cron authentication fails closed before processing", () => {
  const secretCheck = cron.indexOf("process.env.CRON_SECRET");
  const authCheck = cron.indexOf('request.headers.get("authorization")');
  const processing = cron.indexOf("await processDueQuoteLeads");
  assert.ok(secretCheck >= 0);
  assert.ok(authCheck > secretCheck);
  assert.ok(processing > authCheck);
  assert.match(cron, /return json\(\{ error: "Unauthorized\." \}, 401\)/);
});
