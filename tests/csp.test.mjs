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

/*
 * The header every build publishes, before the hash pass swaps the placeholder
 * for real hashes. Written out in full on purpose: a change to the production
 * policy has to be made here as well, where a reviewer will see it.
 */
const PUBLISHED_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.googleadservices.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.gstatic.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "style-src-elem 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.google.com.au https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://www.gstatic.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://ad.doubleclick.net https://www.google.com https://www.google.com.au https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.gstatic.com",
  "frame-src https://www.googletagmanager.com https://td.doubleclick.net",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const DEV_PHASE = "phase-development-server";

function directives(policy) {
  return new Map(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources];
    }),
  );
}

test("the published policy is unchanged and its script-src allows neither inline nor eval", () => {
  assert.equal(csp.contentSecurityPolicy(), PUBLISHED_POLICY);

  const scriptSrc = directives(csp.contentSecurityPolicy()).get("script-src");
  assert.ok(!scriptSrc.includes("'unsafe-inline'"), "script-src must not allow inline scripts");
  assert.ok(!scriptSrc.includes("'unsafe-eval'"), "script-src must not allow eval");
  assert.doesNotMatch(PUBLISHED_POLICY, /\bwss?:/, "no websocket scheme source outside next dev");
});

test("only next dev with NODE_ENV=development gets the relaxed policy", () => {
  const phases = [
    DEV_PHASE,
    "phase-production-build",
    "phase-production-server",
    "phase-export",
    "phase-analyze",
    "phase-info",
    "phase-test",
    "",
    undefined,
  ];
  const nodeEnvs = ["development", "production", "test", "preview", "Development", "", undefined];

  let relaxed = 0;
  for (const phase of phases) {
    for (const nodeEnv of nodeEnvs) {
      const policy = csp.contentSecurityPolicyFor(phase, nodeEnv);
      if (phase === DEV_PHASE && nodeEnv === "development") {
        assert.equal(policy, csp.developmentContentSecurityPolicy());
        relaxed += 1;
        continue;
      }
      assert.equal(
        policy,
        PUBLISHED_POLICY,
        `phase ${phase} with NODE_ENV ${nodeEnv} must get the published policy`,
      );
    }
  }
  assert.equal(relaxed, 1);

  // `next build` keeps an inherited NODE_ENV=development, and
  // `next build --debug-prerender` sets it. Neither is the dev server.
  assert.equal(
    csp.contentSecurityPolicyFor("phase-production-build", "development"),
    PUBLISHED_POLICY,
  );
  // The other half: the dev phase alone does not relax anything either.
  assert.equal(csp.contentSecurityPolicyFor(DEV_PHASE, "production"), PUBLISHED_POLICY);
});

test("the development policy differs from the published one in three directives only", () => {
  const published = directives(PUBLISHED_POLICY);
  const development = directives(csp.developmentContentSecurityPolicy());

  assert.deepEqual([...development.keys()], [...published.keys()]);
  const changed = [...published.keys()].filter(
    (name) => development.get(name).join(" ") !== published.get(name).join(" "),
  );
  assert.deepEqual(changed, ["script-src", "style-src-elem", "connect-src"]);

  // A hash beside 'unsafe-inline' makes browsers ignore 'unsafe-inline', so the
  // placeholder has to go, not stay. Everything else in script-src is kept.
  assert.deepEqual(
    development.get("script-src"),
    published
      .get("script-src")
      .flatMap((source) =>
        source === csp.SCRIPT_HASH_PLACEHOLDER ? ["'unsafe-inline'", "'unsafe-eval'"] : [source],
      ),
  );
  assert.doesNotMatch(csp.developmentContentSecurityPolicy(), /'sha256-/);
  assert.deepEqual(development.get("style-src-elem"), ["'self'", "'unsafe-inline'"]);
  assert.deepEqual(development.get("connect-src"), [...published.get("connect-src"), "ws:"]);
});

test("next.config.ts chooses the header from the Next phase and NODE_ENV", () => {
  const source = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(source, /value: contentSecurityPolicyFor\(phase, process\.env\.NODE_ENV\)/);
  assert.match(source, /export default function config\(phase: string\)/);
  assert.equal(source.match(/key: "Content-Security-Policy"/g)?.length, 1);
  assert.doesNotMatch(source, /developmentContentSecurityPolicy/);
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

test("a build that carries the development policy fails the publish check", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { assertPublishedCsp } = await import("../scripts/publish-csp.mjs");
  const root = mkdtempSync(join(tmpdir(), "csp-dev-policy-"));
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
                value: csp.developmentContentSecurityPolicy(),
              },
            ],
          },
        ],
      }),
    );
    await assert.rejects(
      async () => assertPublishedCsp({ projectRoot: root, distDir }),
      /missing inline script hash/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
