import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/quote-delivery.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "quote-delivery.ts",
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.deepEqual(
  errors.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")),
  [],
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`;
const { deliverQuote, resolveQuoteDelivery } = await import(moduleUrl);

const lead = {
  leadId: "A1B2C3D4-0000-4000-8000-000000000000",
  name: "Test Customer",
  phone: "0400 000 000",
  suburb: "Exampleville",
  vehicle: "2016 Example Sedan",
  expectedPrice: "Not sure",
  condition: "Runs",
  receivedAt: "2026-06-01T03:47:00.000Z",
};
const email = {
  subject: "New car quote enquiry",
  text: "Plain-text quote details",
};
const idempotencyKey = `quote/${lead.leadId}`;

function dependencies(fetchImplementation, events) {
  let now = 1_000;
  return {
    fetch: fetchImplementation,
    now: () => {
      now += 5;
      return now;
    },
    report: (event) => events.push(event),
    timeoutSignal: (milliseconds) => {
      assert.equal(milliseconds, 10_000);
      return new AbortController().signal;
    },
  };
}

test("webhook delivery sends the exact lead and safe success telemetry", async () => {
  const events = [];
  let request;
  const result = await deliverQuote(
    {
      settings: { webhookUrl: "https://hooks.example.test/quote" },
      lead,
      email,
      idempotencyKey,
    },
    dependencies(async (url, init) => {
      request = { url, init };
      return new Response(null, { status: 204 });
    }, events),
  );

  assert.deepEqual(result, { ok: true, provider: "webhook", status: 204 });
  assert.equal(request.url, "https://hooks.example.test/quote");
  assert.equal(request.init.method, "POST");
  assert.deepEqual(request.init.headers, {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
    "X-Quote-Lead-Id": lead.leadId,
  });
  assert.deepEqual(JSON.parse(request.init.body), lead);
  assert.deepEqual(events, [
    {
      event: "quote_delivery",
      provider: "webhook",
      outcome: "success",
      durationMs: 5,
      reference: "A1B2C3D4",
    },
  ]);
});

test("Resend delivery is text-only and does not reintroduce an HTML MIME part", async () => {
  const events = [];
  let request;
  const result = await deliverQuote(
    {
      settings: {
        resendApiKey: "re_test_key",
        toEmail: "quotes@example.test",
        fromEmail: "Quotes <sender@example.test>",
      },
      lead,
      email,
      idempotencyKey,
    },
    dependencies(async (url, init) => {
      request = { url, init };
      return new Response('{"id":"email_123"}', { status: 200 });
    }, events),
  );

  assert.deepEqual(result, {
    ok: true,
    provider: "resend",
    status: 200,
    providerReceiptId: "email_123",
  });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.init.headers.Authorization, "Bearer re_test_key");
  assert.equal(request.init.headers["Idempotency-Key"], idempotencyKey);
  const body = JSON.parse(request.init.body);
  assert.deepEqual(body, {
    from: "Quotes <sender@example.test>",
    to: ["quotes@example.test"],
    subject: email.subject,
    text: email.text,
  });
  assert.equal(body.html, undefined);
  assert.equal(events[0].outcome, "success");
});

test("provider HTTP failures return only a safe status and allowlisted telemetry", async () => {
  for (const settings of [
    { webhookUrl: "https://hooks.example.test/quote" },
    { resendApiKey: "re_test_key", toEmail: "quotes@example.test" },
  ]) {
    const events = [];
    const result = await deliverQuote(
      { settings, lead, email, idempotencyKey },
      dependencies(async () => new Response(null, { status: 503 }), events),
    );

    assert.equal(result.ok, false);
    assert.equal(result.reason, "http_error");
    assert.equal(result.status, 503);
    assert.equal(events[0].reason, "http_error");
    assert.equal(events[0].status, 503);
  }
});

test("timeouts and generic fetch failures are classified without raw messages", async () => {
  for (const [errorName, expectedReason] of [
    ["TimeoutError", "timeout"],
    ["Error", "fetch_error"],
  ]) {
    const events = [];
    const error = new Error("secret provider detail");
    error.name = errorName;
    const result = await deliverQuote(
      {
        settings: { webhookUrl: "https://hooks.example.test/quote" },
        lead,
        email,
        idempotencyKey,
      },
      dependencies(async () => {
        throw error;
      }, events),
    );

    assert.equal(result.ok, false);
    assert.equal(result.reason, expectedReason);
    assert.equal(events[0].reason, expectedReason);
    assert.doesNotMatch(JSON.stringify(events), /secret provider detail/);
  }
});

test("invalid delivery configuration fails closed without making a request", async () => {
  const cases = [
    [{}, "missing_configuration"],
    [{ resendApiKey: "re_test_key" }, "incomplete_resend_configuration"],
    [{ toEmail: "quotes@example.test" }, "incomplete_resend_configuration"],
    [
      {
        webhookUrl: "https://hooks.example.test/quote",
        resendApiKey: "re_test_key",
        toEmail: "quotes@example.test",
      },
      "ambiguous_configuration",
    ],
  ];

  for (const [settings, expectedReason] of cases) {
    const events = [];
    let calls = 0;
    const result = await deliverQuote(
      { settings, lead, email, idempotencyKey },
      dependencies(async () => {
        calls += 1;
        return new Response(null, { status: 200 });
      }, events),
    );

    assert.equal(calls, 0);
    assert.deepEqual(resolveQuoteDelivery(settings), {
      ok: false,
      provider: "configuration",
      reason: expectedReason,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, expectedReason);
    assert.equal(events[0].provider, "configuration");
    assert.equal(events[0].reason, expectedReason);
  }
});

test("structured telemetry never contains lead PII or delivery credentials", async () => {
  const events = [];
  await deliverQuote(
    {
      settings: {
        resendApiKey: "re_private_key",
        toEmail: "private-inbox@example.test",
      },
      lead,
      email,
      idempotencyKey,
    },
    dependencies(async () => new Response(null, { status: 200 }), events),
  );

  const serialized = JSON.stringify(events);
  for (const privateValue of [
    lead.name,
    lead.phone,
    lead.suburb,
    lead.vehicle,
    lead.expectedPrice,
    lead.condition,
    "re_private_key",
    "private-inbox@example.test",
  ]) {
    assert.ok(!serialized.includes(privateValue), `telemetry leaked ${privateValue}`);
  }
});

test("invalid provider idempotency keys fail before any outbound request", async () => {
  const events = [];
  let calls = 0;
  const result = await deliverQuote(
    {
      settings: { webhookUrl: "https://hooks.example.test/quote" },
      lead,
      email,
      idempotencyKey: "unsafe key with spaces",
    },
    dependencies(async () => {
      calls += 1;
      return new Response(null, { status: 200 });
    }, events),
  );

  assert.equal(calls, 0);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_idempotency_key");
  assert.equal(events[0].reason, "invalid_idempotency_key");
});

test("retry-after is allowlisted and bounded on provider failures", async () => {
  const events = [];
  const result = await deliverQuote(
    {
      settings: { webhookUrl: "https://hooks.example.test/quote" },
      lead,
      email,
      idempotencyKey,
    },
    dependencies(
      async () =>
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "999999" },
        }),
      events,
    ),
  );

  assert.equal(result.ok, false);
  assert.equal(result.reason, "http_error");
  assert.equal(result.retryAfterSeconds, 3600);
});
