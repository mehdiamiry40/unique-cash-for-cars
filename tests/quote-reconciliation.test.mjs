import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";

const { quoteProviderStatus, nextQuoteProviderStatus, retrieveQuoteReceipt, reconcileQuoteReceipts } =
  loadTypeScriptModule(fileURLToPath(new URL("../src/lib/quote-reconciliation.ts", import.meta.url)), {
    "./quote-reconciliation-store": {
      claimQuoteReceipt: () => { throw new Error("No production storage in unit tests."); },
      finishQuoteReceiptCheck: () => { throw new Error("No production storage in unit tests."); },
    },
  });

test("Resend events preserve acceptance versus delivery and actionable failures", () => {
  for (const event of ["accepted", "sent", "scheduled", "queued"]) {
    assert.equal(quoteProviderStatus(event), "accepted");
  }
  for (const event of ["delivered", "opened", "clicked"]) {
    assert.equal(quoteProviderStatus(event), "delivered");
  }
  assert.equal(quoteProviderStatus("delivery_delayed"), "delayed");
  assert.equal(quoteProviderStatus("canceled"), "failed");
  for (const event of ["bounced", "complained", "suppressed", "failed"]) {
    assert.equal(quoteProviderStatus(event), event);
  }
  for (const event of [null, {}, "unexpected", "delivery_delivered"]) {
    assert.equal(quoteProviderStatus(event), null);
  }
});

test("stale snapshots cannot downgrade delivery or clear a provider failure", () => {
  assert.equal(nextQuoteProviderStatus(null, "accepted"), "accepted");
  assert.equal(nextQuoteProviderStatus("accepted", "delayed"), "delayed");
  assert.equal(nextQuoteProviderStatus("delayed", "accepted"), "delayed");
  assert.equal(nextQuoteProviderStatus("delayed", "delivered"), "delivered");
  assert.equal(nextQuoteProviderStatus("delivered", "accepted"), "delivered");
  assert.equal(nextQuoteProviderStatus("delivered", "delayed"), "delivered");
  assert.equal(nextQuoteProviderStatus("delivered", "complained"), "complained");
  for (const failed of ["bounced", "complained", "suppressed", "failed"]) {
    for (const observed of ["accepted", "delayed", "delivered"]) {
      assert.equal(nextQuoteProviderStatus(failed, observed), failed);
    }
  }
});

test("receipt retrieval is GET-only and retains only its verified status", async () => {
  let request;
  const result = await retrieveQuoteReceipt("email_test-123", { apiKey: " re_test_key " }, async (url, init) => {
    request = { url, init };
    return Response.json({ id: "email_test-123", last_event: "delivered", to: ["private@example.test"], text: "Private customer content" });
  });
  assert.deepEqual(result, { ok: true, status: "delivered" });
  assert.equal(request.url, "https://api.resend.com/emails/email_test-123");
  assert.equal(request.init.method, "GET");
  assert.equal(request.init.body, undefined);
  assert.equal(request.init.headers.Authorization, "Bearer re_test_key");
  assert.equal(request.init.redirect, "error");
  assert.equal(request.init.cache, "no-store");
  assert.ok(request.init.signal instanceof AbortSignal);
  assert.doesNotMatch(JSON.stringify(result), /private|re_test|customer/);
});

test("missing credentials and invalid receipt paths fail before fetching", async () => {
  let called = false;
  const fetch = async () => { called = true; throw new Error("Unexpected request."); };
  assert.deepEqual(await retrieveQuoteReceipt("email_1", {}, fetch), { ok: false, reason: "missing_configuration" });
  for (const receipt of ["", "../other", "abc?query", "x".repeat(256)]) {
    assert.deepEqual(await retrieveQuoteReceipt(receipt, { apiKey: "re_test" }, fetch), { ok: false, reason: "invalid_receipt" });
  }
  assert.equal(called, false);
});

test("receipt errors are allowlisted and mismatched provider IDs never update a quote", async () => {
  const cases = [
    [() => new Response("private error body", { status: 403 }), { ok: false, reason: "http_error", httpStatus: 403 }],
    [() => Response.json({ id: "different", last_event: "delivered" }), { ok: false, reason: "receipt_mismatch" }],
    [() => Response.json({ id: "email_1", last_event: "unknown" }), { ok: false, reason: "unknown_status" }],
    [() => Response.json({ last_event: "delivered" }), { ok: false, reason: "invalid_response" }],
    [() => new Response("not json"), { ok: false, reason: "invalid_response" }],
    [() => { throw new Error("credential or customer detail"); }, { ok: false, reason: "fetch_error" }],
  ];
  for (const [fetch, expected] of cases) {
    assert.deepEqual(await retrieveQuoteReceipt("email_1", { apiKey: "re_test" }, fetch), expected);
  }
});

test("timeouts bound both a hung provider and a stalled JSON response body", async () => {
  for (const fetch of [
    () => new Promise(() => {}),
    async () => ({ ok: true, json: () => new Promise(() => {}) }),
  ]) {
    const result = await retrieveQuoteReceipt("email_1", { apiKey: "re_test", timeoutMs: 5 }, fetch);
    assert.deepEqual(result, { ok: false, reason: "timeout" });
  }
});

function workerFixture({ latency = 0, check = { ok: true, status: "delivered" }, finalize = true } = {}) {
  let time = 0;
  let claims = 0;
  const finished = [];
  const events = [];
  return {
    claims: () => claims,
    time: () => time,
    finished, events,
    dependencies: {
      now: () => time,
      claim: async (token) => {
        time += latency;
        claims += 1;
        return { outboxId: String(claims), receiptId: `email_${claims}`, status: "accepted", statusAt: null, token };
      },
      check: async () => { time += latency * 2; return check; },
      finish: async (receipt, result, status) => { time += latency; finished.push({ receipt, result, status }); return finalize; },
      report: (event) => events.push(event),
    },
  };
}

test("a slow receipt batch respects its reserved deadline without claiming untouched work", async () => {
  const fixture = workerFixture({ latency: 1500 });
  const result = await reconcileQuoteReceipts({}, fixture.dependencies);
  assert.deepEqual(result, { checked: 1, updated: 1, failures: 0, conflicts: 0, exhausted: true });
  assert.equal(fixture.claims(), 1);
  assert.equal(fixture.time(), 6000);
  const noBudget = workerFixture();
  assert.equal((await reconcileQuoteReceipts({ deadlineAt: 5000 }, noBudget.dependencies)).exhausted, true);
  assert.equal(noBudget.claims(), 0);
});

test("the receipt count has a hard cap even with a larger caller request", async () => {
  const fixture = workerFixture();
  const result = await reconcileQuoteReceipts({ limit: 10000 }, fixture.dependencies);
  assert.equal(result.checked, 10);
  assert.equal(fixture.claims(), 10);
  const none = workerFixture();
  assert.equal((await reconcileQuoteReceipts({ limit: 0 }, none.dependencies)).checked, 0);
  assert.equal(none.claims(), 0);
});

test("auth/rate limit failure stops duplicate requests and stores an actionable safe error", async () => {
  for (const httpStatus of [401, 403, 429]) {
    const fixture = workerFixture({ check: { ok: false, reason: "http_error", httpStatus } });
    const result = await reconcileQuoteReceipts({}, fixture.dependencies);
    assert.equal(fixture.claims(), 1);
    assert.equal(result.failures, 1);
    assert.equal(fixture.finished[0].status, "accepted");
    assert.deepEqual(fixture.events, [{ event: "quote_reconciliation", outcome: "failure", reason: "http_error", status: httpStatus }]);
  }
});

test("provider failure alerts and CAS conflicts are surfaced without recording a false update", async () => {
  const fixture = workerFixture({ check: { ok: true, status: "bounced" }, finalize: false });
  const result = await reconcileQuoteReceipts({ limit: 1 }, fixture.dependencies);
  assert.equal(result.conflicts, 1);
  assert.equal(result.updated, 0);
  assert.equal(result.failures, 1);
  assert.deepEqual(fixture.events, [{ event: "quote_reconciliation", outcome: "failure", reason: "bounced" }]);
  const databaseError = workerFixture();
  databaseError.dependencies.claim = async () => { throw new Error("private database URL"); };
  assert.equal((await reconcileQuoteReceipts({}, databaseError.dependencies)).failures, 1);
  assert.doesNotMatch(JSON.stringify(databaseError.events), /private|database URL/);
});
