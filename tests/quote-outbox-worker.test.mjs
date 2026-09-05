import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";

const forbiddenStorage = () => { throw new Error("Tests must use the isolated storage adapter."); };
const storeAdapter = {
  MAX_QUOTE_DELIVERY_ATTEMPTS: 8,
  QUOTE_DATABASE_TIMEOUT_MS: 3_000,
  claimDueQuotes: forbiddenStorage,
  claimQuoteByLeadId: forbiddenStorage,
  deadLetterExpiredFinalLeases: forbiddenStorage,
  markQuoteAccepted: forbiddenStorage,
  markQuoteFailure: forbiddenStorage,
  purgeExpiredQuoteLeads: forbiddenStorage,
  quoteOutboxHealth: forbiddenStorage,
};
const { processDueQuoteLeads, processQuoteLeadNow } = loadTypeScriptModule(
  fileURLToPath(new URL("../src/lib/quote-outbox.ts", import.meta.url)),
  { "./quote-lead-store": storeAdapter },
);

function fixture({ total = 10, databaseMs = 0, providerMs = 0, result } = {}) {
  let time = 0;
  const events = [];
  const requests = [];
  const marks = [];
  const quotes = Array.from({ length: total }, (_, index) => ({
    outboxId: String(index + 1),
    provider: "resend",
    attempts: 0,
    leaseToken: "",
    state: "pending",
    lead: {
      leadId: `0000000${index}-0000-4000-8000-000000000000`,
      name: "Fixture Customer",
      phone: "0400 000 000",
      suburb: "Exampleville",
      vehicle: "2016 Example Sedan",
      expectedPrice: "Not sure",
      condition: "Runs",
      receivedAt: "2026-09-01T00:00:00.000Z",
    },
  }));
  const health = () => ({
    pending: quotes.filter((quote) => quote.state === "pending").length,
    processing: quotes.filter((quote) => quote.state === "processing").length,
    dead: quotes.filter((quote) => quote.state === "dead").length,
    oldestPendingAgeSeconds: 0,
  });
  const overrides = {
    now: () => new Date(time),
    random: () => 0.5,
    report: (level, event) => events.push({ level, ...event }),
    deadLetterExpiredFinalLeases: async () => { time += databaseMs; return []; },
    claimDueQuotes: async (limit, leaseToken) => {
      assert.equal(limit, 1, "Never reserve unstarted work or consume its attempt budget");
      time += databaseMs;
      const quote = quotes.find((item) => item.state === "pending" && item.attempts === 0);
      if (!quote) return [];
      quote.state = "processing";
      quote.attempts += 1;
      quote.leaseToken = leaseToken;
      return [quote];
    },
    claimQuoteByLeadId: async (leadId, leaseToken) => {
      const [quote] = await overrides.claimDueQuotes(1, leaseToken);
      assert.equal(quote?.lead.leadId, leadId);
      return quote ?? null;
    },
    deliverQuote: async (input) => {
      requests.push({ ...input, startedAt: time });
      assert.equal(input.timeoutMs, 10_000);
      time += providerMs;
      return result ?? { ok: true, provider: "resend", status: 200, providerReceiptId: "receipt" };
    },
    markQuoteAccepted: async (quote, input) => {
      time += databaseMs;
      marks.push({ quote, input });
      quote.state = "succeeded";
      return true;
    },
    markQuoteFailure: async (quote, input) => {
      time += databaseMs;
      marks.push({ quote, input });
      quote.state = input.retry ? "pending" : "dead";
      if (!input.consumeAttempt) quote.attempts -= 1;
      return true;
    },
    purgeExpiredQuoteLeads: async () => { time += databaseMs; return 0; },
    quoteOutboxHealth: async () => { time += databaseMs; return health(); },
  };
  return { overrides, quotes, requests, events, marks, now: () => time };
}

test("ten slow provider calls stop within the deadline and leave untouched rows unclaimed", async () => {
  const f = fixture({ providerMs: 10_000 });
  const result = await processDueQuoteLeads(10, f.overrides);
  assert.equal(result.claimed, 3);
  assert.equal(result.accepted, 3);
  assert.equal(result.deadlineReached, true);
  assert.deepEqual(f.requests.map((request) => request.startedAt), [0, 10_000, 20_000]);
  assert.ok(result.durationMs <= 45_000);
  assert.ok(f.quotes.slice(3).every((quote) => quote.attempts === 0 && quote.state === "pending"));
  assert.equal(new Set(f.quotes.slice(0, 3).map((quote) => quote.leaseToken)).size, 3);
});

test("claim, provider, finalize and maintenance budgets fit together at their timeout ceilings", async () => {
  const f = fixture({ databaseMs: 3_000, providerMs: 10_000 });
  const result = await processDueQuoteLeads(10, f.overrides);
  assert.equal(result.claimed, 2);
  assert.equal(result.durationMs, 41_000);
  assert.ok(result.durationMs < 45_000);
  assert.equal(f.quotes[2].attempts, 0);
});

test("caller deadline reserves room for the cron's additional reconciliation and health work", async () => {
  const f = fixture({ databaseMs: 3_000, providerMs: 10_000 });
  const result = await processDueQuoteLeads(10, f.overrides, { deadlineMs: 40_000 });
  assert.equal(result.claimed, 1);
  assert.equal(result.durationMs, 25_000);
  const expired = fixture();
  const empty = await processDueQuoteLeads(10, expired.overrides, { deadlineMs: -1 });
  assert.equal(empty.claimed, 0);
  assert.equal(empty.health, null);
});

test("terminal lease failures emit matching error events even with no new work", async () => {
  const f = fixture({ total: 0 });
  f.overrides.deadLetterExpiredFinalLeases = async () => [
    { leadId: "a1b2c3d4-0000-4000-8000-000000000000", provider: "resend", attempts: 8, reason: "lease_expired_at_attempt_cap" },
    { leadId: "e1f2a3b4-0000-4000-8000-000000000000", provider: "webhook", attempts: 1, reason: "lease_expired_delivery_unknown" },
  ];
  const result = await processDueQuoteLeads(10, f.overrides);
  assert.equal(result.deadLettered, 2);
  assert.deepEqual(f.events.map(({ level, outcome, reference }) => ({ level, outcome, reference })), [
    { level: "error", outcome: "dead_lettered", reference: "A1B2C3D4" },
    { level: "error", outcome: "dead_lettered", reference: "E1F2A3B4" },
  ]);
});

test("provider acceptance followed by persistence failure preserves the uncertain lease", async () => {
  const f = fixture({ total: 1 });
  f.overrides.markQuoteAccepted = async () => { throw new Error("database unavailable"); };
  const result = await processDueQuoteLeads(10, f.overrides);
  assert.equal(result.errors, 1);
  assert.equal(result.accepted, 0);
  assert.equal(f.quotes[0].state, "processing");
  assert.equal(f.quotes[0].attempts, 1);
  assert.equal(f.requests.length, 1);
  assert.ok(f.events.some((event) => event.outcome === "worker_error" && event.level === "error"));
});

test("stale finalization is an actionable conflict, never acceptance", async () => {
  const f = fixture({ total: 1 });
  f.overrides.markQuoteAccepted = async () => false;
  const result = await processDueQuoteLeads(1, f.overrides);
  assert.equal(result.finalizeConflicts, 1);
  assert.equal(result.accepted, 0);
  assert.equal(f.events[0].outcome, "finalize_conflict");
  assert.equal(f.events[0].level, "error");
});

test("transient Resend failures preserve the provider identity, key and payload for retry", async () => {
  const f = fixture({ total: 1, result: { ok: false, provider: "resend", reason: "timeout" } });
  process.env.QUOTE_WEBHOOK_URL = "https://unused.example.test/quote";
  try {
    const result = await processDueQuoteLeads(1, f.overrides);
    assert.equal(result.retryScheduled, 1);
    assert.equal(f.requests[0].idempotencyKey, `quote/${f.quotes[0].lead.leadId}`);
    assert.deepEqual(f.requests[0].lead, f.quotes[0].lead);
    assert.equal(f.requests[0].settings.webhookUrl, undefined);
    assert.equal(f.marks[0].input.retry, true);
    assert.equal(f.marks[0].input.consumeAttempt, true);
    assert.equal(f.marks[0].input.retryAt.getTime(), 30_000);
  } finally {
    delete process.env.QUOTE_WEBHOOK_URL;
  }
});

test("ambiguous webhook failures dead-letter and configuration outages do not consume attempts", async () => {
  const webhook = fixture({ total: 1, result: { ok: false, provider: "webhook", reason: "timeout" } });
  webhook.quotes[0].provider = "webhook";
  const failure = await processDueQuoteLeads(1, webhook.overrides);
  assert.equal(failure.deadLettered, 1);
  assert.equal(webhook.quotes[0].state, "dead");
  const configuration = fixture({ total: 1, result: { ok: false, provider: "configuration", reason: "missing_configuration" } });
  const paused = await processDueQuoteLeads(1, configuration.overrides);
  assert.equal(paused.retryScheduled, 1);
  assert.equal(configuration.quotes[0].attempts, 0);
  assert.equal(configuration.marks[0].input.retryAt.getTime(), 300_000);
});

test("immediate worker persistence failures have an explicit alert outcome", async () => {
  const f = fixture({ total: 1 });
  f.overrides.markQuoteAccepted = async () => { throw new Error("private storage detail"); };
  await assert.rejects(processQuoteLeadNow(f.quotes[0].lead.leadId, f.overrides), /Immediate quote worker failed/);
  assert.equal(f.events.at(-1).outcome, "immediate_worker_error");
  assert.doesNotMatch(JSON.stringify(f.events), /private storage detail|Fixture Customer|0400/);
});

test("claim and maintenance failures are counted and have safe phase-specific telemetry", async () => {
  const f = fixture({ total: 0 });
  f.overrides.claimDueQuotes = async () => { throw new Error("connection string secret"); };
  f.overrides.purgeExpiredQuoteLeads = async () => { throw new Error("query private"); };
  const result = await processDueQuoteLeads(10, f.overrides);
  assert.equal(result.errors, 2);
  assert.deepEqual(f.events.map((event) => event.phase), ["claim", "purge"]);
  assert.doesNotMatch(JSON.stringify(f.events), /connection string secret|query private/);
});
