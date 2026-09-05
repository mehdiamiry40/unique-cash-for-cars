import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file, imports = {}, globals = {}) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, Request, Response, TextDecoder, Uint8Array,
    console: { error() {} }, ...globals,
    require(name) { assert.ok(name in imports, `Unexpected dependency: ${name}`); return imports[name]; },
  }, { filename: file });
  return exports;
}

const validation = load("src/lib/quote-validation.ts");
const valid = { name: "Jamie Example", phone: "0400 000 000", suburb: "Southport",
  vehicle: "2016 Toyota Corolla", expectedPrice: "", condition: "Running" };
const leadId = "a1b2c3d4-0000-4000-8000-000000000000";

function endpoint({ state = "succeeded", outcome = "accepted", env = {} } = {}) {
  const persisted = [];
  const route = load("src/app/api/quote/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/content/site": { site: { phone: { display: "0423 476 111" } } },
    "@/lib/quote-validation": validation,
    "@/lib/quote-rate-limit": { createFixedWindowLimiter: () => ({ check: () => ({ limited: false }) }) },
    "@/lib/quote-delivery": { resolveQuoteDelivery: () => ({ ok: true, provider: "resend" }) },
    "@/lib/quote-lead-store": {
      QuoteStorageConfigurationError: class extends Error {},
      persistQuote: async (lead) => { persisted.push(lead); return { ok: true, quote: { state } }; },
    },
    "@/lib/quote-outbox": { processQuoteLeadNow: async () => outcome },
  }, { process: { env: { NODE_ENV: "production", VERCEL_ENV: "production", ...env } } });
  async function submit(body, mediaType = "application/json") {
    return route.POST(new Request("https://example.test/api/quote", {
      method: "POST", headers: { "content-type": mediaType, "idempotency-key": leadId },
      body: JSON.stringify(body),
    }));
  }
  return { submit, persisted, route };
}

for (const [field, limit] of Object.entries(validation.quoteFieldLimits)) {
  test(`${field}: exact length is preserved, excess rejected before persistence`, async () => {
    const character = field === "phone" ? "4" : "é";
    const exact = { ...valid, [field]: character.repeat(limit) };
    const api = endpoint();
    assert.equal((await api.submit(exact)).status, 200);
    assert.equal(api.persisted[0][field], exact[field]);
    const excess = { ...exact, [field]: character.repeat(limit + 1) };
    const rejected = await api.submit(excess);
    assert.equal(rejected.status, 400);
    assert.match((await rejected.json()).fields[field], /characters or fewer/);
    assert.equal(api.persisted.length, 1, "Invalid details must never be saved");
  });
}

test("normalization and optional defaults preserve the browser/API fingerprint contract", async () => {
  const api = endpoint();
  assert.equal((await api.submit({ ...valid, name: "  Jamie\n Example  ", condition: "  " })).status, 200);
  assert.equal(api.persisted[0].name, "Jamie Example");
  assert.equal(api.persisted[0].condition, "—");
  assert.equal(api.persisted[0].expectedPrice, "Not sure");
});

test("both permanent failure paths return the same safe saved-enquiry contract", async () => {
  for (const options of [{ state: "dead" }, { state: "pending", outcome: "dead_lettered" }]) {
    const api = endpoint(options);
    const response = await api.submit(valid);
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.code, "quote_saved_delivery_failed");
    assert.equal(body.stored, true);
    assert.equal(body.leadId, leadId);
    assert.equal(validation.savedQuoteReference(body), "A1B2C3D4");
  }
  for (const body of [null, {}, {code:"quote_saved_delivery_failed", stored:true,leadId:"<script>"}, {code:"quote_saved_delivery_failed",stored:false,leadId}]) {
    assert.equal(validation.savedQuoteReference(body), null);
  }
});

test("native encodings remain rejected and GET never captures an enquiry", async () => {
  const api = endpoint();
  for (const type of ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]) {
    assert.equal((await api.submit(valid, type)).status, 415);
  }
  assert.equal(api.route.GET, undefined);
  assert.equal(api.persisted.length, 0);
});

test("preview/development validate without accessing storage or sending a notification", async () => {
  for (const env of [{VERCEL_ENV:"preview"}, {NODE_ENV:"development"}, {VERCEL_ENV:undefined}, {VERCEL_ENV:""}]) {
    const api = endpoint({env});
    const response = await api.submit(valid);
    assert.deepEqual(await response.json(), {ok:true, code:"preview_quote", stored:false});
    assert.equal(api.persisted.length, 0);
    assert.equal((await api.submit({...valid, condition:"x".repeat(501)})).status, 400);
  }
});
