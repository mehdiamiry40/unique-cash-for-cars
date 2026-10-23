import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";

const csp = loadTypeScriptModule(fileURLToPath(new URL("../src/lib/csp.ts", import.meta.url)));
const measurement = loadTypeScriptModule(
  fileURLToPath(new URL("../src/lib/google-measurement.ts", import.meta.url)),
);
const { site } = loadTypeScriptModule(fileURLToPath(new URL("../src/content/site.ts", import.meta.url)));

test("the Google measurement snippet matches the text next/script inserts today", () => {
  const resolved = measurement.resolveGoogleMeasurement({});
  assert.equal(resolved.validAdsId, "AW-750701638");
  assert.equal(resolved.validAnalyticsId, "G-VZT8S8WXDH");
  assert.ok(
    resolved.inlineScript.includes(JSON.stringify(site.phone.display)),
    "measurement snippet must use the phone number published in site.ts",
  );
  assert.equal(
    resolved.inlineScript,
    [
      "",
      "          window.dataLayer = window.dataLayer || [];",
      "          function gtag(){dataLayer.push(arguments);}",
      "          window.gtag = window.gtag || gtag;",
      "          gtag('js', new Date());",
      '          gtag(\'config\', "AW-750701638");',
      '          gtag(\'config\', "G-VZT8S8WXDH");',
      '          gtag(\'config\', "AW-750701638/sF8gCNG54ZgBEMaY--UC", {',
      '                  \'phone_conversion_number\': "0423 476 111"',
      "                });",
      "        ",
    ].join("\n"),
  );
});

test("the static CSP names required directives and refuses eval and open wildcards", () => {
  const policy = csp.contentSecurityPolicy();
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "script-src-attr 'none'",
    "style-src-elem 'self'",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
  ]) {
    assert.ok(policy.includes(directive), directive);
  }
  assert.equal(policy.includes(csp.SCRIPT_HASH_PLACEHOLDER), true);
  assert.doesNotMatch(policy, /unsafe-eval/);
  assert.doesNotMatch(policy, /script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(policy, /\s\*\s|https: |http: /);
  assert.doesNotMatch(policy, /https:\/\/\*\.google\.com/);
});

test("inline script extraction hashes the tag body and skips external scripts", () => {
  const html = '<script src="/app.js"></script><script>var ready = true;</script>';
  assert.deepEqual(csp.extractInlineScriptSources(html), ["var ready = true;"]);
  assert.match(csp.hashInlineScript("var ready = true;"), /^'sha256-[A-Za-z0-9+/]{43}='$/);
});

test("the quote form still posts only to this origin", () => {
  const source = readFileSync(new URL("../src/components/QuoteForm.tsx", import.meta.url), "utf8");
  assert.match(source, /action="\/api\/quote"/);
  assert.match(source, /fetch\("\/api\/quote"/);
});
