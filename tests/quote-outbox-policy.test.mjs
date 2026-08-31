import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/quote-outbox-policy.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "quote-outbox-policy.ts",
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.deepEqual(
  errors.map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
  ),
  [],
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`;
const { quoteRetryDecision } = await import(moduleUrl);

test("transient delivery failures use bounded full-jitter backoff", () => {
  assert.deepEqual(
    quoteRetryDecision(
      { ok: false, provider: "resend", reason: "timeout" },
      1,
      8,
      () => 0.5,
    ),
    { retry: true, delaySeconds: 30, consumeAttempt: true },
  );

  assert.deepEqual(
    quoteRetryDecision(
      { ok: false, provider: "resend", reason: "fetch_error" },
      7,
      8,
      () => 1,
    ),
    { retry: true, delaySeconds: 3600, consumeAttempt: true },
  );
});

test("retry-after is honoured without exceeding the one-hour cap", () => {
  assert.deepEqual(
    quoteRetryDecision(
      {
        ok: false,
        provider: "resend",
        reason: "http_error",
        status: 429,
        retryAfterSeconds: 300,
      },
      1,
      8,
      () => 0,
    ),
    { retry: true, delaySeconds: 300, consumeAttempt: true },
  );
});

test("permanent provider errors and exhausted attempts dead-letter", () => {
  assert.deepEqual(
    quoteRetryDecision(
      {
        ok: false,
        provider: "resend",
        reason: "http_error",
        status: 422,
      },
      1,
      8,
    ),
    { retry: false, delaySeconds: 0, consumeAttempt: true },
  );

  assert.deepEqual(
    quoteRetryDecision(
      { ok: false, provider: "resend", reason: "timeout" },
      8,
      8,
    ),
    { retry: false, delaySeconds: 0, consumeAttempt: true },
  );
});

test("temporary configuration outages remain retryable", () => {
  assert.deepEqual(
    quoteRetryDecision(
      {
        ok: false,
        provider: "configuration",
        reason: "missing_configuration",
      },
      2,
      8,
      () => 0.5,
    ),
    { retry: true, delaySeconds: 300, consumeAttempt: false },
  );
});

test("ambiguous generic-webhook failures require manual reconciliation", () => {
  for (const failure of [
    { ok: false, provider: "webhook", reason: "timeout" },
    { ok: false, provider: "webhook", reason: "fetch_error" },
    {
      ok: false,
      provider: "webhook",
      reason: "http_error",
      status: 503,
    },
  ]) {
    assert.deepEqual(quoteRetryDecision(failure, 1, 8), {
      retry: false,
      delaySeconds: 0,
      consumeAttempt: true,
    });
  }

  assert.equal(
    quoteRetryDecision(
      {
        ok: false,
        provider: "webhook",
        reason: "http_error",
        status: 429,
      },
      1,
      8,
      () => 0.5,
    ).retry,
    true,
  );
});
