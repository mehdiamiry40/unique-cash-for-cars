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

function endpoint({ result = { ok: true, provider: "resend", status: 200 }, env = {} } = {}) {
  const sent = [];
  const route = load("src/app/api/quote/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/content/site": { site: { phone: { display: "0423 476 111" } } },
    "@/lib/quote-validation": validation,
    "@/lib/quote-rate-limit": { createFixedWindowLimiter: () => ({ check: () => ({ limited: false }) }) },
    "@/lib/quote-delivery": {
      resolveQuoteDelivery: () => ({ ok: true, provider: "resend" }),
      deliverQuote: async (input) => { sent.push(input); return result; },
    },
    "@/lib/quote-email": { buildQuoteEmail: () => ({ subject: "s", text: "t" }) },
  }, { process: { env: { NODE_ENV: "production", VERCEL_ENV: "production", ...env } } });
  async function submit(body, mediaType = "application/json") {
    return route.POST(new Request("https://example.test/api/quote", {
      method: "POST", headers: { "content-type": mediaType, "idempotency-key": leadId },
      body: JSON.stringify(body),
    }));
  }
  return { submit, sent, route };
}

for (const [field, limit] of Object.entries(validation.quoteFieldLimits)) {
  test(`${field}: exact length is preserved, excess rejected before delivery`, async () => {
    const character = field === "phone" ? "4" : "é";
    const exact = { ...valid, [field]: character.repeat(limit) };
    const api = endpoint();
    assert.equal((await api.submit(exact)).status, 200);
    assert.equal(api.sent[0].lead[field], exact[field]);
    const excess = { ...exact, [field]: character.repeat(limit + 1) };
    const rejected = await api.submit(excess);
    assert.equal(rejected.status, 400);
    assert.match((await rejected.json()).fields[field], /characters or fewer/);
    assert.equal(api.sent.length, 1, "Invalid details must never be sent");
  });
}

test("normalization and optional defaults preserve the browser/API fingerprint contract", async () => {
  const api = endpoint();
  assert.equal((await api.submit({ ...valid, name: "  Jamie\n Example  ", condition: "  " })).status, 200);
  assert.equal(api.sent[0].lead.name, "Jamie Example");
  assert.equal(api.sent[0].lead.condition, "—");
  assert.equal(api.sent[0].lead.expectedPrice, "Not sure");
});

test("a delivery is sent once per submission with the submission ID as idempotency key", async () => {
  const api = endpoint();
  const response = await api.submit(valid);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, leadId });
  assert.equal(api.sent.length, 1);
  assert.equal(api.sent[0].idempotencyKey, `quote/${leadId}`);
});

test("a failed delivery returns 502 without a lead ID so no conversion is counted", async () => {
  for (const result of [
    { ok: false, provider: "resend", reason: "timeout" },
    { ok: false, provider: "resend", reason: "http_error", status: 500 },
    { ok: false, provider: "webhook", reason: "http_error", status: 409 },
  ]) {
    const response = await endpoint({ result }).submit(valid);
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.leadId, undefined);
    assert.match(body.error, /could not be sent/);
  }
});

test("a Resend idempotency conflict means an earlier attempt already sent the email", async () => {
  const response = await endpoint({
    result: { ok: false, provider: "resend", reason: "http_error", status: 409 },
  }).submit(valid);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, leadId });
});

test("native encodings remain rejected and GET never captures an enquiry", async () => {
  const api = endpoint();
  for (const type of ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]) {
    assert.equal((await api.submit(valid, type)).status, 415);
  }
  assert.equal(api.route.GET, undefined);
  assert.equal(api.sent.length, 0);
});

test("preview/development validate without sending a notification", async () => {
  for (const env of [{VERCEL_ENV:"preview"}, {NODE_ENV:"development"}, {VERCEL_ENV:undefined}, {VERCEL_ENV:""}]) {
    const api = endpoint({env});
    const response = await api.submit(valid);
    assert.deepEqual(await response.json(), {ok:true, code:"preview_quote", stored:false});
    assert.equal(api.sent.length, 0);
    assert.equal((await api.submit({...valid, condition:"x".repeat(501)})).status, 400);
  }
});
