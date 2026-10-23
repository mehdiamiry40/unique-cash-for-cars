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

test("hashes are published into adapter routing before that adapter seals output", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = mkdtempSync(join(tmpdir(), "csp-adapter-"));
  const distDir = join(root, ".next");
  const previousAdapter = process.env.NEXT_ADAPTER_PATH;
  try {
    mkdirSync(join(distDir, "server/app"), { recursive: true });
    const home = [
      "<script>window.__NEXT = 1;</script>",
      "<script>window.__PAGE = 2;</script>",
      "<script type=\"application/ld+json\">{\"@type\":\"LocalBusiness\"}</script>",
    ].join("");
    writeFileSync(join(distDir, "server/app/index.html"), home);
    for (let index = 0; index < 9; index += 1) {
      writeFileSync(
        join(distDir, "server/app", `page-${index}.html`),
        `<script>window.__page = ${index};</script>`,
      );
    }
    const placeholderPolicy = `default-src 'self'; script-src 'self' ${csp.SCRIPT_HASH_PLACEHOLDER}; object-src 'none'`;
    writeFileSync(
      join(distDir, "routes-manifest.json"),
      JSON.stringify({
        headers: [
          {
            headers: [{ key: "Content-Security-Policy", value: placeholderPolicy }],
          },
        ],
      }),
    );

    const sealedPath = join(root, ".vercel/output/config.json");
    const delegatePath = join(root, "delegate.mjs");
    writeFileSync(
      delegatePath,
      `import { mkdirSync, writeFileSync } from "node:fs";
       import { dirname } from "node:path";
       const sealed = ${JSON.stringify(sealedPath)};
       export async function onBuildComplete(payload) {
         let policy = payload.routing.beforeMiddleware[0].headers["content-security-policy"];
         policy = policy.replace(/'sha256-[^']+'/, "");
         mkdirSync(dirname(sealed), { recursive: true });
         writeFileSync(sealed, JSON.stringify({ routes: [{ headers: { "content-security-policy": policy } }] }));
       }
       export default { onBuildComplete };`,
    );
    process.env.NEXT_ADAPTER_PATH = delegatePath;

    const routing = {
      beforeMiddleware: [
        { headers: { "content-security-policy": placeholderPolicy } },
      ],
    };
    const adapter = await import("../scripts/csp-adapter.mjs");
    await adapter.onBuildComplete({ projectDir: root, distDir, routing });

    const sealed = readFileSync(sealedPath, "utf8");
    assert.doesNotMatch(sealed, /sha256-AAAAAAAAAAAA/);
    assert.match(sealed, /'sha256-[A-Za-z0-9+/]{43}='/);
    for (const source of ["window.__NEXT = 1;", "window.__PAGE = 2;", '{"@type":"LocalBusiness"}']) {
      assert.ok(sealed.includes(csp.hashInlineScript(source)), source);
    }
    assert.doesNotMatch(
      readFileSync(join(distDir, "routes-manifest.json"), "utf8"),
      /sha256-AAAAAAAAAAAA/,
    );
  } finally {
    if (previousAdapter === undefined) delete process.env.NEXT_ADAPTER_PATH;
    else process.env.NEXT_ADAPTER_PATH = previousAdapter;
    rmSync(root, { recursive: true, force: true });
  }
});

test("a published policy that still has the placeholder fails the build", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { assertPublishedCsp } = await import("../scripts/publish-csp.mjs");
  const root = mkdtempSync(join(tmpdir(), "csp-assert-"));
  const distDir = join(root, ".next");
  try {
    mkdirSync(join(distDir, "server/app"), { recursive: true });
    writeFileSync(
      join(distDir, "server/app/index.html"),
      "<script>one</script><script>two</script><script>three</script>",
    );
    for (let index = 0; index < 9; index += 1) {
      writeFileSync(join(distDir, "server/app", `page-${index}.html`), `<script>p${index}</script>`);
    }
    writeFileSync(
      join(distDir, "routes-manifest.json"),
      JSON.stringify({
        headers: [
          {
            headers: [
              {
                key: "Content-Security-Policy",
                value: `script-src 'self' ${csp.SCRIPT_HASH_PLACEHOLDER}`,
              },
            ],
          },
        ],
      }),
    );
    await assert.rejects(
      async () => assertPublishedCsp({ projectRoot: root, distDir }),
      /placeholder/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
