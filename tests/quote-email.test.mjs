import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/quote-email.ts", import.meta.url),
  "utf8",
);
const deliverySource = readFileSync(
  new URL("../src/lib/quote-delivery.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "quote-email.ts",
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
const { buildQuoteEmail } = await import(moduleUrl);

const lead = {
  leadId: "00000000-0000-4000-8000-000000000000",
  name: "Test Customer",
  phone: "0400 000 000",
  suburb: "Exampleville",
  vehicle: "2016 Example Sedan",
  expectedPrice: "1500",
  condition: "Runs",
  receivedAt: "2026-06-01T03:47:00.000Z",
};

test("quote email stays readable without HTML or link-heavy content", () => {
  const email = buildQuoteEmail(lead);

  assert.equal(
    email.subject,
    "New car quote enquiry — Test Customer (Exampleville)",
  );
  assert.equal(
    email.text,
    [
      "New quote enquiry",
      "",
      "Customer",
      "Name: Test Customer",
      "Phone: 0400 000 000",
      "Suburb: Exampleville",
      "",
      "Vehicle",
      "Vehicle: 2016 Example Sedan",
      "Customer's expected price: $1,500",
      "Condition: Runs",
      "",
      "Received: Mon, 1 June 2026 at 1:47 pm AEST",
      "Reference: 00000000",
    ].join("\n"),
  );
  assert.equal(email.html, undefined);
  assert.doesNotMatch(email.text, /https?:|tel:|sms:|<html/i);
  assert.doesNotMatch(email.subject, /\$/);
});

test("Resend receives text only at the transport boundary", () => {
  assert.match(deliverySource, /text: input\.email\.text/);
  assert.doesNotMatch(deliverySource, /html:\s*input\.email\.html/);
});

test("subject values are collapsed to one line and capped", () => {
  const email = buildQuoteEmail({
    ...lead,
    name: `Test\r\nCustomer ${"x".repeat(150)}`,
    suburb: "Example\nville",
  });

  assert.doesNotMatch(email.subject, /[\r\n]/);
  assert.ok(email.subject.length <= 120);
  assert.match(email.subject, /^New car quote enquiry — Test Customer/);
});

test("numeric prices are formatted without changing free-form answers", () => {
  const cases = [
    ["500", "$500"],
    ["$1,500", "$1,500"],
    ["2450.5", "$2,450.50"],
    ["Negotiable", "Negotiable"],
  ];

  for (const [input, expected] of cases) {
    const email = buildQuoteEmail({ ...lead, expectedPrice: input });
    const priceLine = email.text
      .split("\n")
      .find((line) => line.startsWith("Customer's expected price:"));
    assert.equal(priceLine, `Customer's expected price: ${expected}`);
  }
});
