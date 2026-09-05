import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";
import { postgresFixture } from "./helpers/postgres-fixture.mjs";

function lead(overrides = {}) {
  return {
    leadId: randomUUID(),
    name: "Database Fixture",
    phone: "0400 000 000",
    suburb: "Exampleville",
    vehicle: "2016 Example Sedan",
    expectedPrice: "Not sure",
    condition: "Runs",
    receivedAt: new Date().toISOString(),
    ...overrides,
  };
}

test("actual quote store transactions and lease recovery in isolated PostgreSQL", async (t) => {
  const fixture = await postgresFixture();
  t.after(fixture.close);
  const { pool } = fixture;
  const store = loadTypeScriptModule(
    fileURLToPath(new URL("../src/lib/quote-lead-store.ts", import.meta.url)),
    { "@neondatabase/serverless": { neon: fixture.neon } },
  );
  const rowFor = async (leadId) => (await pool.query("SELECT * FROM quote_delivery_outbox WHERE lead_id = $1", [leadId])).rows[0];
  const expire = async (leadId) => pool.query("UPDATE quote_delivery_outbox SET run_after = now() - interval '1 second' WHERE lead_id = $1", [leadId]);
  const clear = async () => pool.query("TRUNCATE quote_leads CASCADE");

  await t.test("concurrent duplicate submissions commit one lead and one provider-pinned event", async () => {
    const payload = lead();
    const results = await Promise.all(Array.from({ length: 20 }, () => store.persistQuote(payload, "resend")));
    assert.ok(results.every((result) => result.ok && result.quote.leadId === payload.leadId));
    const replay = await store.persistQuote({ ...payload, receivedAt: new Date().toISOString() }, "webhook");
    assert.equal(replay.quote.provider, "resend");
    const counts = (await pool.query("SELECT (SELECT count(*) FROM quote_leads)::int AS leads, (SELECT count(*) FROM quote_delivery_outbox)::int AS outbox")).rows[0];
    assert.deepEqual(counts, { leads: 1, outbox: 1 });
    assert.equal((await rowFor(payload.leadId)).attempts, 0);
    const changed = await store.persistQuote({ ...payload, phone: "0400 000 001" }, "resend");
    assert.deepEqual(changed, { ok: false, reason: "idempotency_conflict" });
    assert.equal((await pool.query("SELECT phone FROM quote_leads")).rows[0].phone, payload.phone);
    await clear();
  });

  await t.test("a failed outbox insert rolls back lead persistence atomically", async () => {
    const payload = lead();
    await assert.rejects(store.persistQuote(payload, "unsupported-provider"), (error) => error.code === "23514");
    assert.equal((await pool.query("SELECT count(*)::int AS count FROM quote_leads")).rows[0].count, 0);
  });

  await t.test("competing immediate and scheduled workers claim an event exactly once", async () => {
    const payload = lead();
    await store.persistQuote(payload, "resend");
    const tokens = Array.from({ length: 10 }, () => randomUUID());
    const claims = await Promise.all(tokens.map((token, index) => index % 2
      ? store.claimQuoteByLeadId(payload.leadId, token).then((quote) => quote ? [quote] : [])
      : store.claimDueQuotes(1, token)));
    const winners = claims.flat();
    assert.equal(winners.length, 1);
    assert.equal(winners[0].attempts, 1);
    assert.equal((await rowFor(payload.leadId)).attempts, 1);
    await clear();
  });

  await t.test("an expired Resend lease reclaims safely and rejects stale worker finalization", async () => {
    const payload = lead();
    await store.persistQuote(payload, "resend");
    const first = await store.claimQuoteByLeadId(payload.leadId, randomUUID());
    await expire(payload.leadId);
    const [second] = await store.claimDueQuotes(1, randomUUID());
    assert.equal(second.attempts, 2);
    assert.notEqual(first.leaseToken, second.leaseToken);
    assert.equal(await store.markQuoteAccepted(first, { httpStatus: 200, providerReceiptId: "stale" }), false);
    assert.equal(await store.markQuoteFailure(first, { retry: false, retryAt: new Date(), reason: "timeout", consumeAttempt: true }), false);
    assert.equal(await store.markQuoteAccepted(second, { httpStatus: 200, providerReceiptId: "accepted-receipt" }), true);
    const row = await rowFor(payload.leadId);
    assert.equal(row.provider_receipt_id, "accepted-receipt");
    assert.equal(row.provider_status, "accepted");
    assert.equal(row.state, "succeeded");
    assert.equal(row.lease_token, null);
    assert.equal(await store.claimQuoteByLeadId(payload.leadId, randomUUID()), null);
    await clear();
  });

  await t.test("crashed webhook sends require reconciliation and cannot be replayed by either claim path", async () => {
    const payload = lead();
    await store.persistQuote(payload, "webhook");
    await store.claimQuoteByLeadId(payload.leadId, randomUUID());
    await expire(payload.leadId);
    assert.equal(await store.claimQuoteByLeadId(payload.leadId, randomUUID()), null);
    assert.deepEqual(await store.claimDueQuotes(1, randomUUID()), []);
    const dead = await store.deadLetterExpiredFinalLeases();
    assert.equal(dead[0].reason, "lease_expired_delivery_unknown");
    assert.equal(dead[0].leadId, payload.leadId);
    assert.equal((await rowFor(payload.leadId)).state, "dead");
    await clear();
  });

  await t.test("replay beyond the conservative Resend window stops even below the attempt cap", async () => {
    for (const state of ["processing", "pending"]) {
      const payload = lead();
      await store.persistQuote(payload, "resend");
      const claimed = await store.claimQuoteByLeadId(payload.leadId, randomUUID());
      if (state === "pending") await store.markQuoteFailure(claimed, { retry: true, retryAt: new Date(0), reason: "timeout", consumeAttempt: true });
      await pool.query("UPDATE quote_leads SET received_at = now() - interval '24 hours' WHERE lead_id = $1", [payload.leadId]);
      await expire(payload.leadId);
      assert.equal(await store.claimQuoteByLeadId(payload.leadId, randomUUID()), null);
      assert.deepEqual(await store.claimDueQuotes(1, randomUUID()), []);
      const dead = await store.deadLetterExpiredFinalLeases();
      assert.equal(dead[0].reason, "idempotency_window_expired");
      assert.equal((await rowFor(payload.leadId)).attempts, 1);
      await clear();
    }
  });

  await t.test("exhausted final leases generate actionable terminal metadata once", async () => {
    const payload = lead();
    await store.persistQuote(payload, "resend");
    await store.claimQuoteByLeadId(payload.leadId, randomUUID());
    await pool.query("UPDATE quote_delivery_outbox SET attempts = 8, run_after = now() - interval '1 second' WHERE lead_id = $1", [payload.leadId]);
    const [dead] = await store.deadLetterExpiredFinalLeases();
    assert.deepEqual(dead, { leadId: payload.leadId, provider: "resend", attempts: 8, reason: "lease_expired_at_attempt_cap" });
    assert.deepEqual(await store.deadLetterExpiredFinalLeases(), []);
    assert.deepEqual(await store.quoteOutboxHealth(), { pending: 0, processing: 0, dead: 1, oldestPendingAgeSeconds: 0 });
    await clear();
  });

  await t.test("configuration pauses preserve attempts and transient retries respect run_after", async () => {
    const payload = lead({ receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() });
    await store.persistQuote(payload, "resend");
    const first = await store.claimQuoteByLeadId(payload.leadId, randomUUID());
    assert.ok(first, "A never-attempted old enquiry can make its first send");
    await store.markQuoteFailure(first, { retry: true, retryAt: new Date(Date.now() + 300_000), reason: "missing_configuration", consumeAttempt: false });
    assert.equal((await rowFor(payload.leadId)).attempts, 0);
    assert.equal(await store.claimQuoteByLeadId(payload.leadId, randomUUID()), null);
    await expire(payload.leadId);
    assert.deepEqual(await store.deadLetterExpiredFinalLeases(), []);
    const second = await store.claimQuoteByLeadId(payload.leadId, randomUUID());
    assert.equal(second.attempts, 1);
    await store.markQuoteFailure(second, { retry: true, retryAt: new Date(Date.now() + 60_000), reason: "timeout", consumeAttempt: true });
    assert.deepEqual(await store.claimDueQuotes(1, randomUUID()), []);
    await clear();
  });

  await t.test("health reports aggregate backlog age and retention cascades without customer telemetry", async () => {
    const pending = lead({ receivedAt: new Date(Date.now() - 20 * 60_000).toISOString() });
    const expired = lead({ receivedAt: "2020-01-01T00:00:00.000Z" });
    await store.persistQuote(pending, "resend");
    await store.persistQuote(expired, "webhook");
    assert.equal(await store.purgeExpiredQuoteLeads(), 1);
    const health = await store.quoteOutboxHealth();
    assert.equal(health.pending, 1);
    assert.ok(health.oldestPendingAgeSeconds >= 1200 && health.oldestPendingAgeSeconds < 1210);
    assert.equal(await rowFor(expired.leadId), undefined);
    assert.doesNotMatch(JSON.stringify(health), /Fixture|0400|Exampleville/);
    await clear();
  });

  await t.test("database lock waits are bounded and a timed-out transaction leaves no partial event", async () => {
    const payload = lead();
    await store.persistQuote(payload, "resend");
    const blocker = await pool.connect();
    try {
      await blocker.query("BEGIN");
      await blocker.query("LOCK TABLE quote_leads IN ACCESS EXCLUSIVE MODE");
      const startedAt = Date.now();
      // The real INSERT must wait for the competing transaction's table lock.
      await assert.rejects(store.persistQuote(payload, "resend"), (error) => ["55P03", "57014"].includes(error.code));
      assert.ok(Date.now() - startedAt < 4_000);
    } finally {
      await blocker.query("ROLLBACK");
      blocker.release();
    }
    assert.equal((await rowFor(payload.leadId)).attempts, 0);
    assert.ok(fixture.queries.some((query) => query.includes("set_config('statement_timeout', '2500', true)")));
    await clear();
  });
});
