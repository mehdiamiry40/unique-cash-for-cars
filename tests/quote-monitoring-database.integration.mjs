import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";
import { postgresFixture } from "./helpers/postgres-fixture.mjs";

test("receipt reconciliation and quote health use real isolated PostgreSQL state", async (t) => {
  const fixture = await postgresFixture(["001_quote_outbox.sql", "002_quote_monitoring.sql"]);
  t.after(fixture.close);
  const { pool } = fixture;
  const replacements = { "@neondatabase/serverless": { neon: fixture.neon } };
  const load = (name) => loadTypeScriptModule(fileURLToPath(new URL(`../src/lib/${name}.ts`, import.meta.url)), replacements);
  const store = load("quote-reconciliation-store");
  const health = load("quote-health");
  const healthy = () => health.createQuoteHealthReader()();
  const receiptRow = async () => (await pool.query("SELECT * FROM quote_delivery_outbox ORDER BY outbox_id LIMIT 1")).rows[0];
  const clear = () => pool.query("TRUNCATE quote_leads, quote_worker_health CASCADE");
  const create = async ({ provider = "resend", status = "accepted", state = "succeeded", ageMinutes = 0 } = {}) => {
    const leadId = randomUUID();
    const receiptId = randomUUID();
    await pool.query(
      `INSERT INTO quote_leads (lead_id,payload_sha256,name,phone,suburb,vehicle,expected_price,vehicle_condition,received_at,purge_after)
       VALUES ($1,$2,'Test','0400 000 000','Exampleville','Test car','Unsure','Test',now()-($3*interval '1 minute'),now()+interval '12 months')`,
      [leadId, "0".repeat(64), ageMinutes],
    );
    await pool.query(
      `INSERT INTO quote_delivery_outbox (lead_id,provider,state,provider_receipt_id,provider_status,provider_status_at,finished_at,lease_token)
       VALUES ($1,$2,$3,$4,$5,now(),now()-($6*interval '1 minute'),CASE WHEN $3='processing' THEN $7::uuid ELSE NULL END)`,
      [leadId, provider, state, receiptId, status, ageMinutes, randomUUID()],
    );
    return { leadId, receiptId };
  };

  await t.test("competing receipt workers claim once without touching send attempts or customer records", async () => {
    const created = await create();
    const claims = await Promise.all(Array.from({ length: 8 }, () => store.claimQuoteReceipt(randomUUID())));
    const winners = claims.filter(Boolean);
    assert.equal(winners.length, 1);
    assert.deepEqual(Object.keys(winners[0]).sort(), ["outboxId", "receiptId", "status", "statusAt", "token"]);
    assert.equal(winners[0].receiptId, created.receiptId);
    assert.equal((await receiptRow()).attempts, 0);
    assert.equal((await receiptRow()).state, "succeeded");
    assert.equal(await store.claimQuoteReceipt(randomUUID()), null);
    await clear();
  });

  await t.test("receipt lease recovery rejects the expired worker and a concurrently changed status", async () => {
    await create();
    const first = await store.claimQuoteReceipt(randomUUID());
    await pool.query("UPDATE quote_delivery_outbox SET provider_reconcile_after=now()-interval '1 second'");
    const second = await store.claimQuoteReceipt(randomUUID());
    assert.notEqual(first.token, second.token);
    assert.equal(await store.finishQuoteReceiptCheck(first, { ok: true, status: "delivered" }, "delivered"), false);
    await pool.query("UPDATE quote_delivery_outbox SET provider_status='complained', provider_status_at=now()");
    assert.equal(await store.finishQuoteReceiptCheck(second, { ok: true, status: "delivered" }, "delivered"), false);
    assert.equal((await receiptRow()).provider_status, "complained");
    await clear();
  });

  await t.test("successful checks persist delivery, clear errors, and stop immediate duplicate polling", async () => {
    await create();
    await pool.query("UPDATE quote_delivery_outbox SET provider_reconcile_error='http_error'");
    const claim = await store.claimQuoteReceipt(randomUUID());
    assert.equal(await store.finishQuoteReceiptCheck(claim, { ok: true, status: "delivered" }, "delivered"), true);
    const row = await receiptRow();
    assert.equal(row.provider_status, "delivered");
    assert.equal(row.provider_reconcile_error, null);
    assert.equal(row.provider_reconcile_token, null);
    assert.ok(row.provider_checked_at instanceof Date);
    assert.ok(row.provider_reconcile_after.getTime() > Date.now() + 23 * 3600_000);
    assert.equal(await store.claimQuoteReceipt(randomUUID()), null);
    await clear();
  });

  await t.test("provider errors retain the prior status and become unhealthy until reconciled", async () => {
    await create();
    const claim = await store.claimQuoteReceipt(randomUUID());
    assert.equal(await store.finishQuoteReceiptCheck(claim, { ok: false, reason: "http_error", httpStatus: 403 }, "accepted"), true);
    assert.equal((await receiptRow()).provider_status, "accepted");
    assert.equal((await receiptRow()).provider_reconcile_error, "http_error");
    assert.equal(await health.recordQuoteWorkerHealth({ workerSucceeded: true }), false);
    assert.equal(await healthy(), false);
    await clear();
  });

  await t.test("unresolved receipts take priority and receipt polling respects 30-day provider retention", async () => {
    await create({ status: "delivered" });
    const urgent = await create({ status: "delayed" });
    assert.equal((await store.claimQuoteReceipt(randomUUID())).receiptId, urgent.receiptId);
    await clear();
    await create({ status: "delivered", ageMinutes: 31 * 24 * 60 });
    assert.equal(await store.claimQuoteReceipt(randomUUID()), null);
    await clear();
    await create({ status: "accepted", ageMinutes: 31 * 24 * 60 });
    assert.equal(await store.claimQuoteReceipt(randomUUID()), null);
    assert.equal(await health.recordQuoteWorkerHealth({ workerSucceeded: true }), false);
    await clear();
    await create({ provider: "webhook" });
    assert.equal(await store.claimQuoteReceipt(randomUUID()), null);
    await clear();
  });

  await t.test("fresh health reads catch failures after a healthy heartbeat and failed heartbeats persist", async () => {
    assert.equal(await healthy(), false, "No heartbeat must fail closed.");
    assert.equal(await health.recordQuoteWorkerHealth({ workerSucceeded: true }), true);
    assert.equal(await healthy(), true);
    for (const input of [
      { state: "dead", status: "failed" },
      { state: "pending", status: null, ageMinutes: 16 },
      { state: "processing", status: null, ageMinutes: 16 },
      { status: "bounced" }, { status: "complained" }, { status: "suppressed" },
      { status: "accepted", ageMinutes: 16 }, { status: "delayed", ageMinutes: 16 },
    ]) {
      await create(input);
      assert.equal(await healthy(), false, JSON.stringify(input));
      await pool.query("TRUNCATE quote_leads CASCADE");
      assert.equal(await healthy(), true);
    }
    assert.equal(await health.recordQuoteWorkerHealth({ workerSucceeded: false }), false);
    assert.equal(await healthy(), false);
    assert.equal(await health.recordQuoteWorkerHealth({ workerSucceeded: true }), true);
    await pool.query("UPDATE quote_worker_health SET checked_at=now()-interval '15 minutes'");
    assert.equal(await healthy(), false);
    await clear();
  });

  await t.test("short database statement deadlines and missing monitoring schema fail closed", async () => {
    const { boundedQuoteQuery } = load("quote-observability-db");
    await assert.rejects(boundedQuoteQuery("SELECT pg_sleep(3)", [], 200));
    await pool.query("DROP TABLE quote_worker_health");
    assert.equal(await healthy(), false);
    await assert.rejects(health.recordQuoteWorkerHealth({ workerSucceeded: true }));
  });
});
