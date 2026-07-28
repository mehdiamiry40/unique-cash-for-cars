/**
 * Rendered-output tests.
 *
 * These run against a real `next start` server, so they assert what a crawler
 * actually receives — headers, canonicals, structured data, redirects — rather
 * than what the source implies. That distinction matters here: response headers
 * come from next.config.ts and never appear in the prerendered HTML, so nothing
 * short of a live server can check them.
 *
 * Lineage: this file replaces a suite of the same name that came from a
 * parallel WordPress-mirror migration and was removed in b101774. Every
 * assertion in that version targeted the mirror's Flatsome markup and
 * catch-all route handlers, so it could not run against these components. The
 * harness below — spawn a server on a pid-derived port, poll until ready — is
 * kept from it, as is the coverage list. The assertions are new.
 *
 * Complements, rather than repeats, the two static checks:
 *   scripts/check-urls.mjs        legacy URL parity, by walking src/app
 *   scripts/check-duplication.mjs location-page similarity, by reading content
 */

import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const execFileAsync = promisify(execFile);

const projectPath = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

// Offset by pid so a stray server from an earlier run cannot silently serve
// these tests, and so parallel runs on CI don't collide.
const port = 43000 + (process.pid % 1000);
const origin = `http://127.0.0.1:${port}`;

/** The canonical origin, which is what canonicals and schema @ids must use. */
const publicOrigin = "https://uniquecashforcars.com.au";

let server;
let serverOutput = "";

/*
 * Which schema types belong on which pages. Written out rather than derived so
 * the file states the intended structure — if a page silently stops emitting
 * its FAQ or breadcrumb graph, that is the bug this catches.
 */
const suburbRoutes = [
  "/cash-for-cars/southport",
  "/cash-for-cars/surfers-paradise",
  "/cash-for-cars/robina",
  "/cash-for-cars/burleigh-heads",
];
const serviceRoutes = [
  "/sell-my-car-gold-coast",
  "/car-removal-gold-coast",
  "/unwanted-car-buyer",
];
const postRoutes = [
  "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
  "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
  "/5-best-luxury-eco-friendly-cars-in-australia-2020",
];
/** Pages that render an FAQ block, and so must carry FAQPage. */
const faqRoutes = ["/", ...serviceRoutes, ...suburbRoutes];
/** Everything except the posts and the privacy policy shows a breadcrumb trail. */
const noBreadcrumbRoutes = new Set([...postRoutes, "/privacy-policy"]);

before(async () => {
  server = spawn(process.execPath, [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: projectPath,
    // NEXT_DIST_DIR must not leak in: it would point the server at the
    // preview build produced further down this file.
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_DIST_DIR: "",
      QUOTE_WEBHOOK_URL: "",
      RESEND_API_KEY: "",
      QUOTE_TO_EMAIL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (c) => (serverOutput += c));
  server.stderr.on("data", (c) => (serverOutput += c));

  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited during startup:\n${serverOutput}`);
    }
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`next start never became ready:\n${serverOutput}`);
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 3000);
  });
});

function get(pathname, options = {}) {
  return fetch(`${origin}${pathname}`, {
    redirect: options.redirect ?? "manual",
    headers: { accept: options.accept ?? "text/html" },
  });
}

async function html(pathname) {
  const response = await get(pathname, { redirect: "follow" });
  assert.equal(response.status, 200, `${pathname} returned ${response.status}`);
  return response.text();
}

function attr(source, tagPattern, name) {
  const tag = source.match(tagPattern)?.[0];
  return tag?.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

const canonicalOf = (source) =>
  attr(source, /<link\b[^>]*rel=["']canonical["'][^>]*>/i, "href");
const metaOf = (source, name) =>
  attr(source, new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*>`, "i"), "content");
const titleOf = (source) => source.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";

/** Every JSON-LD node on the page, flattened across script tags and @graphs. */
function schemaNodes(source) {
  const blocks = [
    ...source.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map(([, body]) => body);

  return blocks.flatMap((body, index) => {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (error) {
      assert.fail(`JSON-LD block ${index} is not valid JSON: ${error.message}`);
    }
    assert.equal(parsed["@context"], "https://schema.org", `block ${index} @context`);
    return parsed["@graph"] ?? [parsed];
  });
}

/** Sitemap URLs, as site-relative paths. The sitemap is the list of pages that
 *  are meant to be indexed, so it is the right source for "every page". */
async function sitemapPaths() {
  const xml = await html("/sitemap.xml");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.ok(urls.length >= 16, `sitemap listed only ${urls.length} URLs`);
  return urls.map((url) => {
    assert.ok(url.startsWith(publicOrigin), `sitemap URL not on canonical origin: ${url}`);
    const path = url.slice(publicOrigin.length);
    return path === "" ? "/" : path;
  });
}

test("every sitemap URL resolves, and its canonical points back at itself", async () => {
  for (const path of await sitemapPaths()) {
    const response = await get(path);
    assert.equal(response.status, 200, `${path} returned ${response.status}, not a direct 200`);

    // A sitemap that lists a redirecting URL wastes crawl budget and confuses
    // which version is canonical.
    const expected = path === "/" ? publicOrigin : `${publicOrigin}${path}`;
    assert.equal(canonicalOf(await response.text()), expected, `${path} canonical`);
  }
});

test("titles and descriptions fit what a search result shows, and none repeat", async () => {
  const titles = new Map();
  const descriptions = new Map();

  for (const path of await sitemapPaths()) {
    const source = await html(path);
    const title = titleOf(source);
    const description = metaOf(source, "description");

    // Advisory bands, not spec: Google truncates titles near 60 characters and
    // descriptions near 160. Generous on both ends so ordinary copy edits do
    // not fail the build.
    assert.ok(
      title.length >= 25 && title.length <= 65,
      `${path}: title is ${title.length} chars — ${title}`,
    );
    assert.ok(
      description.length >= 100 && description.length <= 165,
      `${path}: description is ${description.length} chars`,
    );

    // Duplicates are the specific failure this rebuild exists to avoid: the
    // WordPress suburb pages shared near-identical titles and descriptions.
    assert.ok(!titles.has(title), `${path} duplicates the title of ${titles.get(title)}`);
    assert.ok(
      !descriptions.has(description),
      `${path} duplicates the description of ${descriptions.get(description)}`,
    );
    titles.set(title, path);
    descriptions.set(description, path);

    assert.equal(
      (source.match(/<h1\b/gi) ?? []).length,
      1,
      `${path}: expected exactly one h1`,
    );
  }
});

test("structured data is valid, typed per page, and every @id reference resolves", async () => {
  for (const path of await sitemapPaths()) {
    const nodes = schemaNodes(await html(path));
    const types = nodes.map((node) => node["@type"]);

    // The site-wide graph from the root layout.
    assert.ok(types.includes("AutomotiveBusiness"), `${path}: no AutomotiveBusiness node`);
    assert.ok(types.includes("WebSite"), `${path}: no WebSite node`);

    const business = nodes.find((node) => node["@type"] === "AutomotiveBusiness");
    assert.equal(business["@id"], `${publicOrigin}/#organization`, `${path}: organization @id`);
    for (const field of ["name", "telephone", "address", "geo", "openingHoursSpecification"]) {
      assert.ok(business[field], `${path}: AutomotiveBusiness is missing ${field}`);
    }
    assert.deepEqual(
      business.areaServed.map((area) => area.name),
      ["Gold Coast", "Southport", "Surfers Paradise", "Robina", "Burleigh Heads"],
      `${path}: business must remain Gold Coast only`,
    );
    assert.equal(business.openingHoursSpecification.length, 1, `${path}: opening hours`);
    assert.deepEqual(
      business.openingHoursSpecification[0].dayOfWeek,
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      `${path}: business days`,
    );
    assert.equal(business.openingHoursSpecification[0].opens, "09:00", `${path}: opening time`);
    assert.equal(business.openingHoursSpecification[0].closes, "17:00", `${path}: closing time`);
    // Self-serving review markup earns no rich result on LocalBusiness types
    // and risks a manual action. See the note in src/lib/schema.ts.
    assert.equal(business.aggregateRating, undefined, `${path}: aggregateRating must not be emitted`);

    if (faqRoutes.includes(path)) {
      const faq = nodes.find((node) => node["@type"] === "FAQPage");
      assert.ok(faq, `${path}: renders FAQs but emits no FAQPage`);
      assert.ok(faq.mainEntity.length > 0, `${path}: FAQPage has no questions`);
      for (const question of faq.mainEntity) {
        assert.equal(question["@type"], "Question", `${path}: FAQ entity type`);
        assert.ok(question.acceptedAnswer?.text, `${path}: FAQ "${question.name}" has no answer`);
      }
    }

    if (!noBreadcrumbRoutes.has(path)) {
      const crumbs = nodes.find((node) => node["@type"] === "BreadcrumbList");
      assert.ok(crumbs, `${path}: no BreadcrumbList`);
      const positions = crumbs.itemListElement.map((item) => item.position);
      assert.deepEqual(
        positions,
        positions.map((_, index) => index + 1),
        `${path}: breadcrumb positions must start at 1 and increment`,
      );
      for (const item of crumbs.itemListElement) {
        assert.ok(
          item.item.startsWith(publicOrigin),
          `${path}: breadcrumb item is not an absolute canonical URL — ${item.item}`,
        );
      }
    }

    if (suburbRoutes.includes(path)) {
      assert.ok(types.includes("Service"), `${path}: location page emits no Service node`);
    }

    // Reference-only objects — {"@id": "..."} with nothing else — must point at
    // a node defined on the same page. A dangling provider or publisher
    // reference makes the whole graph unusable to a consumer.
    const defined = new Set(nodes.map((node) => node["@id"]).filter(Boolean));
    const referenced = [
      ...JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g),
    ].map(([, id]) => id);
    assert.ok(referenced.length > 0, `${path}: expected at least one @id reference`);
    for (const id of referenced) {
      assert.ok(defined.has(id), `${path}: @id reference ${id} resolves to nothing`);
    }
  }
});

test("retired location URLs redirect permanently to a page that exists", async () => {
  const retired = JSON.parse(
    readFileSync(join(projectPath, "scripts", "legacy-urls.json"), "utf8"),
  ).urls.filter(
    (url) => url.startsWith("/cash-for-cars/") && !suburbRoutes.includes(url),
  );
  assert.ok(retired.length >= 13, `expected the retired suburb URLs, found ${retired.length}`);

  for (const path of retired) {
    const response = await get(path);
    // 308 is Next's permanent redirect. Google treats 301 and 308 the same for
    // consolidating signals; a 302 would not pass them on.
    assert.ok(
      [301, 308].includes(response.status),
      `${path} returned ${response.status}, expected a permanent redirect`,
    );

    const destination = new URL(response.headers.get("location"), origin).pathname;
    const followed = await get(destination);
    assert.equal(followed.status, 200, `${path} redirects to ${destination}, which returned ${followed.status}`);
  }
});

test("the retired Brisbane article redirects to the Gold Coast blog", async () => {
  const response = await get("/top-5-reasons-to-sell-your-car-for-cash-in-brisbane");
  assert.ok([301, 308].includes(response.status));
  assert.equal(
    new URL(response.headers.get("location"), origin).pathname,
    "/blog",
  );
});

test("the audited security headers are present on HTML responses", async () => {
  const response = await get("/", { redirect: "follow" });
  const expected = {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "SAMEORIGIN",
  };
  for (const [header, value] of Object.entries(expected)) {
    assert.equal(response.headers.get(header), value, `${header} header`);
  }
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
  // poweredByHeader: false — don't name the framework for vulnerability scanners.
  assert.equal(response.headers.get("x-powered-by"), null, "x-powered-by must not be sent");
});

test("static image paths are served with a long immutable cache", async () => {
  for (const path of [
    "/img/logo.jpg",
    "/assets/hero-cash-for-cars.webp",
    "/wp-content/uploads/2020/01/cash-for-cars.jpg",
  ]) {
    const response = await get(path, { accept: "image/*" });
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
    assert.match(
      response.headers.get("cache-control") ?? "",
      /max-age=31536000/,
      `${path} cache-control`,
    );
  }
});

test("the preserved WordPress image URLs still resolve", async () => {
  // These paths are kept so old image URLs, Google Images results and any
  // external hotlinks survive the move off WordPress.
  for (const path of [
    "/wp-content/uploads/2022/09/old-car-gold-coast.jpg",
    "/wp-content/uploads/2020/11/toyota.png",
    "/wp-content/uploads/2023/09/damaged-car.jpg",
  ]) {
    const response = await get(path, { accept: "image/*" });
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
  }
});

test("no internal link points at a missing page", async () => {
  const paths = await sitemapPaths();
  const seen = new Map();

  for (const from of paths) {
    const source = await html(from);
    for (const [, href] of source.matchAll(/<a\b[^>]*\bhref=["'](\/[^"'#]*)/gi)) {
      // API routes answer POST only, so a GET is a 405 rather than a 404.
      if (href.startsWith("/api/")) continue;
      if (!seen.has(href)) seen.set(href, from);
    }
  }

  assert.ok(seen.size >= 15, `only found ${seen.size} internal links — selector likely broken`);

  for (const [href, from] of seen) {
    const response = await get(href);
    assert.ok(
      response.status < 400,
      `${href} (linked from ${from}) returned ${response.status}`,
    );
  }
});

test("every image the pages reference exists and is served", async () => {
  const sources = new Set();

  for (const path of await sitemapPaths()) {
    const source = await html(path);
    // next/image rewrites to /_next/image?url=<encoded>; take the underlying file.
    for (const [, encoded] of source.matchAll(/\/_next\/image\?url=([^"&\s]+)/g)) {
      const decoded = decodeURIComponent(encoded);
      if (decoded.startsWith("/")) sources.add(decoded);
    }
    for (const [, direct] of source.matchAll(
      /(?:src|href)=["'](\/(?:img|assets|wp-content)\/[^"']+)["']/g,
    )) {
      sources.add(direct);
    }
  }

  assert.ok(sources.size > 0, "found no referenced local images — selector likely broken");

  for (const source of sources) {
    assert.ok(
      existsSync(join(projectPath, "public", source)),
      `${source} is referenced but missing from public/`,
    );
    const response = await get(source, { accept: "image/*" });
    assert.equal(response.status, 200, `${source} returned ${response.status}`);
  }
});

test("this build is indexable", async () => {
  const robots = await html("/robots.txt");
  assert.match(robots, /Allow: \//, "robots.txt should allow crawling");
  assert.match(robots, /Sitemap: https:\/\/uniquecashforcars\.com\.au\/sitemap\.xml/);
  assert.doesNotMatch(robots, /^Disallow: \/$/m, "robots.txt must not block the whole site");

  const home = await html("/");
  assert.match(metaOf(home, "robots"), /index/);
  assert.doesNotMatch(metaOf(home, "robots"), /noindex/);
});

test("the quote endpoint validates contact details", async () => {
  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.10",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "123",
      email: "not-an-email",
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.match(result.error, /valid phone number/i);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("the quote endpoint never reports success without a delivery service", async () => {
  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.11",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      email: "jamie@example.com",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
      expectedPrice: "$5,000",
      fuel: "Petrol",
      condition: "Running",
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 503);
  assert.match(result.error, /0423 476 111/);
});

// Builds a second copy of the site as Vercel would build a preview deployment.
// The assertion is worth the extra build: a preview URL left indexable competes
// with the live site for its own keywords, and nobody notices for months.
test("a preview deployment is not indexable", { timeout: 600_000 }, async () => {
  const distDir = ".next-preview";

  // `next build` rewrites tsconfig.json to register type globs for whatever
  // dist directory it is building into, which would leave this test artifact
  // referenced in a tracked file. Put it back afterwards so a test run has no
  // effect on the working tree.
  const tsconfigPath = join(projectPath, "tsconfig.json");
  const tsconfigBefore = readFileSync(tsconfigPath, "utf8");

  try {
    await execFileAsync(process.execPath, [nextBin, "build"], {
      cwd: projectPath,
      env: { ...process.env, VERCEL_ENV: "preview", NEXT_DIST_DIR: distDir },
      maxBuffer: 32 * 1024 * 1024,
    });
  } finally {
    if (readFileSync(tsconfigPath, "utf8") !== tsconfigBefore) {
      writeFileSync(tsconfigPath, tsconfigBefore);
    }
  }

  const built = (file) => readFileSync(join(projectPath, distDir, "server", "app", file), "utf8");

  const robots = built("robots.txt.body");
  assert.match(robots, /Disallow: \//, "a preview build must disallow crawling");
  assert.doesNotMatch(robots, /Allow: \//, "a preview build must not allow crawling");
  assert.doesNotMatch(robots, /Sitemap:/, "a preview build must not advertise a sitemap");

  // robots.txt stops crawling; noindex removes anything already discovered.
  // Both matter, so both are checked.
  assert.match(metaOf(built("index.html"), "robots"), /noindex/);
});
