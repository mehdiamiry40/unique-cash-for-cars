import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/lib/quote-email.ts", import.meta.url),
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

test("quote email is scannable and uses Brisbane-local details", () => {
  const email = buildQuoteEmail(lead);

  assert.equal(email.subject, "New quote: 2016 Example Sedan · Exampleville · $1,500");
  assert.match(email.html, /New quote enquiry/);
  assert.match(email.html, /href="tel:\+61400000000"/);
  assert.match(email.html, /href="sms:\+61400000000"/);
  assert.match(email.html, /Mon, 1 June 2026 at 1:47 pm AEST/);
  assert.match(email.html, /Customer&#39;s expected price[\s\S]*\$1,500/);
  assert.match(email.html, /Reference[\s\S]*00000000/);
  assert.match(email.text, /CUSTOMER\nName: Test Customer\nPhone: 0400 000 000/);
  assert.match(
    email.text,
    /VEHICLE\nVehicle: 2016 Example Sedan\nCustomer's expected price: \$1,500/,
  );
});

test("customer input is escaped before it reaches the HTML email", () => {
  const email = buildQuoteEmail({
    ...lead,
    name: 'Test <script>alert("x")</script> & Co',
    phone: '0400 000 000" onclick="evil()',
    condition: '<img src=x onerror="alert(1)">',
  });

  assert.doesNotMatch(email.html, /<script>|<img src=x/);
  assert.match(
    email.html,
    /Test &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; Co/,
  );
  assert.match(email.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  const telTarget = email.html.match(/href="(tel:[^"]+)"/)?.[1];
  assert.equal(telTarget, "tel:+61400000000");
});

test("local Australian mobile numbers become portable call and SMS links", () => {
  const email = buildQuoteEmail({
    ...lead,
    phone: "+61 400 000 000",
    expectedPrice: "$2,500",
  });

  assert.match(email.html, /href="tel:\+61400000000"/);
  assert.match(email.html, /href="sms:\+61400000000"/);
  assert.equal(
    email.subject,
    "New quote: 2016 Example Sedan · Exampleville · $2,500",
  );
  assert.doesNotMatch(email.text, /\$2,500\.00/);
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
