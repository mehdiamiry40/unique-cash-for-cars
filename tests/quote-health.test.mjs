import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";

const { createQuoteHealthReader, recordQuoteWorkerHealth } = loadTypeScriptModule(
  fileURLToPath(new URL("../src/lib/quote-health.ts", import.meta.url)),
);

test("healthy status is cached at most one minute and never beyond heartbeat expiry", async () => {
  let time = 1_000_000;
  let reads = 0;
  let checkedAt = time - 890_000;
  const health = createQuoteHealthReader({ now: () => time, read: async () => {
    reads += 1;
    return { healthy: true, checkedAt };
  } });
  assert.equal(await health(), true);
  time += 9000;
  assert.equal(await health(), true);
  assert.equal(reads, 1);
  time += 1000;
  assert.equal(await health(), false, "A cached healthy value must expire with its heartbeat.");
  assert.equal(reads, 2);
  time += 60_000;
  checkedAt = time;
  assert.equal(await health(), true);
  time += 59_999;
  assert.equal(await health(), true);
  assert.equal(reads, 3);
  time += 1;
  assert.equal(await health(), true);
  assert.equal(reads, 4);
});

test("missing, stale, unhealthy, invalid, future and unavailable snapshots fail closed", async () => {
  for (const snapshot of [null, { healthy: false, checkedAt: 999999 },
    { healthy: true, checkedAt: 0 }, { healthy: true, checkedAt: NaN },
    { healthy: true, checkedAt: 1_000_001 }]) {
    const health = createQuoteHealthReader({ now: () => 1_000_000, read: async () => snapshot });
    assert.equal(await health(), false);
  }
  let time = 1_000_000;
  let reads = 0;
  const health = createQuoteHealthReader({ now: () => time, read: () => {
    reads += 1;
    if (reads === 1) throw new Error("private database URL");
    return Promise.resolve({ healthy: true, checkedAt: time });
  } });
  assert.equal(await health(), false);
  time += 60_000;
  assert.equal(await health(), true, "The fail-closed cache retries even after a synchronous reader error.");
});

test("concurrent health requests share one bounded database read", async () => {
  let resolve;
  let reads = 0;
  const health = createQuoteHealthReader({ now: () => 1000, read: () => {
    reads += 1;
    return new Promise((done) => { resolve = done; });
  } });
  const first = health();
  const second = health();
  assert.equal(reads, 1);
  resolve({ healthy: true, checkedAt: 1000 });
  assert.deepEqual(await Promise.all([first, second]), [true, true]);
});

test("heartbeat preserves a failed worker run even when no queue failures remain", async () => {
  const queries = [];
  const healthy = await recordQuoteWorkerHealth({ workerSucceeded: false }, async (statement, params) => {
    queries.push({ statement, params });
    return [{ healthy: false }];
  });
  assert.equal(healthy, false);
  assert.deepEqual(queries[0].params, [false]);
});

test("public health response contains only a boolean, with no browser/CDN cache", async () => {
  const previous = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  try {
  for (const healthy of [true, false]) {
    const { GET } = loadTypeScriptModule(fileURLToPath(new URL("../src/app/api/health/quote/route.ts", import.meta.url)), {
      "@/lib/quote-health": { getQuoteHealth: async () => healthy },
    });
    const response = await GET();
    assert.equal(response.status, healthy ? 200 : 503);
    assert.deepEqual(await response.json(), { healthy });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex");
  }
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});

test("preview and local production-mode health never read the production database", async () => {
  const previous = process.env.VERCEL_ENV;
  try {
    for (const environment of ["preview", "", undefined]) {
    if (environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = environment;
    const { GET } = loadTypeScriptModule(fileURLToPath(new URL("../src/app/api/health/quote/route.ts", import.meta.url)), {
      "@/lib/quote-health": { getQuoteHealth: () => { throw new Error("Preview touched production monitoring."); } },
    });
    const response = await GET();
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { healthy: false });
    }
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});
