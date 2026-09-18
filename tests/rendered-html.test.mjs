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
 * Complements the static legacy-URL parity check in scripts/check-urls.mjs.
 */

import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { request } from "node:http";
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
const pillarRoutes = ["/", "/car-removal-gold-coast"];
const serviceRoutes = ["/car-removal-gold-coast"];
const retiredCommercialRoutes = new Map([
  ["/cash-for-cars", "/"],
  ["/sell-my-car-gold-coast", "/"],
  ["/unwanted-car-buyer", "/"],
  ["/car-wreckers-gold-coast", "/car-removal-gold-coast"],
  ["/car-disposals", "/car-removal-gold-coast"],
  ["/services/car-disposals", "/car-removal-gold-coast"],
  ["/car-recyclers", "/car-removal-gold-coast"],
  ["/company-info-cash-for-cars-gold-coast-and-free-car-removal", "/about"],
]);
const postRoutes = [
  "/deceased-estate-car-sale-queensland",
  "/selling-car-with-lpg-queensland",
  "/sell-car-without-roadworthy-qld",
  "/cancel-car-registration-queensland-after-sale",
  "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
  "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
  "/5-best-luxury-eco-friendly-cars-in-australia-2020",
  "/how-much-is-my-scrap-car-worth-gold-coast",
  "/statutory-vs-repairable-write-off-queensland",
  "/selling-a-car-with-finance-owing-queensland",
  "/transferring-car-registration-in-queensland",
];
/** Pages that render an FAQ block, and so must carry FAQPage. */
const faqRoutes = [
  "/",
  ...serviceRoutes,
  "/sell-car-without-roadworthy-qld",
  "/deceased-estate-car-sale-queensland",
  "/selling-car-with-lpg-queensland",
];
/**
 * Everything except the privacy policy shows a breadcrumb trail.
 *
 * The posts used to be exempt here, which quietly encoded a bug: the post
 * layout renders a visible Home / Blog breadcrumb and emitted no markup behind
 * it. They now carry BreadcrumbList and BlogPosting, so they are held to the
 * same rule as every other page.
 */
const noBreadcrumbRoutes = new Set(["/privacy-policy"]);

before(async () => {
  server = spawn(process.execPath, [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: projectPath,
    // NEXT_DIST_DIR must not leak in: it would point the server at the
    // preview build produced further down this file.
    env: {
      ...process.env,
      NODE_ENV: "production",
      VERCEL_ENV: "",
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
    headers: {
      accept: options.accept ?? "text/html",
      ...options.headers,
    },
  });
}

function getWithHost(pathname, host) {
  const url = new URL(pathname, origin);
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      { method: "GET", headers: { accept: "text/html", host } },
      (response) => {
        response.resume();
        resolve(response);
      },
    );
    req.on("error", reject);
    req.end();
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
const plainText = (source) =>
  source
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const h1Of = (source) => plainText(source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");

function linksIn(source) {
  return [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(([, attributes, body]) => ({
    href: attributes.match(/\bhref=["']([^"']*)["']/i)?.[1] ?? "",
    text: plainText(body),
  }));
}

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
  assert.ok(urls.length >= 11, `sitemap listed only ${urls.length} URLs`);
  return urls.map((url) => {
    assert.ok(url.startsWith(publicOrigin), `sitemap URL not on canonical origin: ${url}`);
    const path = url.slice(publicOrigin.length);
    return path === "" ? "/" : path;
  });
}

test("every sitemap URL resolves, and its canonical points back at itself", async () => {
  const xml = await html("/sitemap.xml");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

  for (const loc of locs) {
    assert.ok(loc.startsWith(publicOrigin), `sitemap URL not on canonical origin: ${loc}`);
    // Homepage loc is site.url with no trailing slash — path is "".
    const path = loc.slice(publicOrigin.length) || "/";
    const response = await get(path);
    assert.equal(response.status, 200, `${path} returned ${response.status}, not a direct 200`);

    // A sitemap that lists a redirecting URL wastes crawl budget and confuses
    // which version is canonical. The <loc> string itself must match the
    // canonical tag — not a slash-normalized cousin of it.
    assert.equal(canonicalOf(await response.text()), loc, `${path} canonical must equal sitemap loc`);
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

test("each target keyword has exactly one title-and-H1 owner", async () => {
  const owners = new Map([
    ["cash for cars gold coast", []],
    ["car removal gold coast", []],
  ]);

  for (const path of await sitemapPaths()) {
    const source = await html(path);
    const primaryCopy = `${path.replace(/-/g, " ")} ${plainText(titleOf(source))} ${h1Of(
      source,
    )}`.toLowerCase();
    for (const [keyword, paths] of owners) {
      if (primaryCopy.includes(keyword)) paths.push(path);
    }
  }

  assert.deepEqual(owners.get("cash for cars gold coast"), ["/"]);
  assert.deepEqual(owners.get("car removal gold coast"), ["/car-removal-gold-coast"]);
});

test("contact page displays the confirmed seven-day opening hours", async () => {
  const text = plainText(await html("/contact-us"));
  assert.match(text, /Mon–Sun 08:00 – 17:00/);
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
    for (const field of ["name", "telephone", "areaServed", "openingHoursSpecification"]) {
      assert.ok(business[field], `${path}: AutomotiveBusiness is missing ${field}`);
    }
    assert.equal(business.address, undefined, `${path}: public address must not be emitted`);
    assert.equal(business.geo, undefined, `${path}: public coordinates must not be emitted`);
    assert.deepEqual(
      business.areaServed.map((area) => area.name),
      [
        "Gold Coast",
        "Southport",
        "Surfers Paradise",
        "Robina",
        "Burleigh Heads",
        "Labrador",
        "Nerang",
        "Helensvale",
        "Mermaid Waters",
      ],
      // The first entry is the city and the remainder are Gold Coast suburbs.
      // This prevents out-of-area locations from creeping back into entity data.
      `${path}: business must remain Gold Coast only`,
    );
    assert.equal(business.areaServed[0]["@type"], "City", `${path}: Gold Coast area type`);
    assert.ok(
      business.areaServed.slice(1).every((area) => area["@type"] === "Place"),
      `${path}: suburbs must be typed as Place, not City`,
    );
    assert.deepEqual(
      business.hasOfferCatalog.itemListElement.map((offer) => ({
        id: offer.itemOffered["@id"],
        name: offer.itemOffered.name,
        url: offer.itemOffered.url,
      })),
      [
        {
          id: `${publicOrigin}#service`,
          name: "Cash For Cars Gold Coast",
          url: publicOrigin,
        },
        {
          id: `${publicOrigin}/car-removal-gold-coast#service`,
          name: "Car Removal Gold Coast",
          url: `${publicOrigin}/car-removal-gold-coast`,
        },
      ],
      `${path}: offer catalog must expose only the two pillar services`,
    );
    assert.equal(business.openingHoursSpecification.length, 1, `${path}: opening hours`);
    assert.deepEqual(
      business.openingHoursSpecification[0].dayOfWeek,
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      `${path}: business days`,
    );
    assert.equal(business.openingHoursSpecification[0].opens, "08:00", `${path}: opening time`);
    assert.equal(business.openingHoursSpecification[0].closes, "17:00", `${path}: closing time`);
    // This business pays vehicle sellers. Consumer-facing payment and price
    // fields would misleadingly imply that sellers pay the business.
    assert.equal(business.priceRange, undefined, `${path}: priceRange must not be emitted`);
    assert.equal(business.paymentAccepted, undefined, `${path}: paymentAccepted must not be emitted`);
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
      assert.equal(
        crumbs.itemListElement[0].item,
        publicOrigin,
        `${path}: Home breadcrumb must match the root canonical exactly`,
      );
    }

    if (pillarRoutes.includes(path)) {
      const service = nodes.find((node) => node["@type"] === "Service");
      assert.ok(service, `${path}: pillar page emits no Service node`);
      const expectedUrl = path === "/" ? publicOrigin : `${publicOrigin}${path}`;
      assert.equal(service["@id"], `${expectedUrl}#service`, `${path}: Service @id`);
      assert.equal(service.url, expectedUrl, `${path}: Service URL`);
      assert.equal(
        service.serviceType,
        path === "/" ? "Cash For Cars Gold Coast" : "Car Removal Gold Coast",
        `${path}: Service type`,
      );
    }

    if (postRoutes.includes(path)) {
      const article = nodes.find((node) => node["@type"] === "BlogPosting");
      assert.ok(article, `${path}: blog post emits no BlogPosting node`);
      for (const field of [
        "headline",
        "image",
        "datePublished",
        "dateModified",
        "author",
        "publisher",
      ]) {
        assert.ok(article[field], `${path}: BlogPosting is missing ${field}`);
      }
      assert.equal(
        article.mainEntityOfPage,
        `${publicOrigin}${path}`,
        `${path}: BlogPosting mainEntityOfPage must be the page's own canonical`,
      );
      assert.match(
        await html(path),
        /<meta\b[^>]*property="og:type"[^>]*content="article"|<meta\b[^>]*content="article"[^>]*property="og:type"/i,
        `${path}: article page must emit article Open Graph type`,
      );
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

test("retired commercial and location URLs redirect directly to their pillar", async () => {
  const legacyLocationUrls = JSON.parse(
    readFileSync(join(projectPath, "scripts", "legacy-urls.json"), "utf8"),
  ).urls.filter((url) => url.startsWith("/cash-for-cars/"));

  /*
   * The floor guards the selector. Every location is intentionally consolidated
   * into the homepage under the strict two-query architecture.
   */
  assert.ok(
    legacyLocationUrls.length >= 15,
    `found only ${legacyLocationUrls.length} legacy location URLs — filter likely broken`,
  );

  const expectedRedirects = new Map([
    ...legacyLocationUrls.map((path) => [path, "/"]),
    ...retiredCommercialRoutes,
  ]);

  for (const [path, expectedDestination] of expectedRedirects) {
    // WordPress emitted trailing slashes. Next performs its built-in slash
    // normalisation before custom redirects, so that legacy form may take two
    // permanent hops; the canonical slashless form must remain one hop.
    for (const variant of [path, `${path}/`]) {
      let response = await get(variant);

      // 308 is Next's permanent redirect. Google treats 301 and 308 the same for
      // consolidating signals; a 302 would not pass them on.
      assert.ok(
        [301, 308].includes(response.status),
        `${variant} returned ${response.status}, expected a permanent redirect`,
      );

      let destination = new URL(response.headers.get("location"), origin).pathname;

      if (variant === path) {
        assert.equal(destination, expectedDestination, `${variant}: wrong consolidation target`);
      } else if (destination !== expectedDestination) {
        assert.equal(destination, path, `${variant}: unexpected slash-normalisation target`);
        response = await get(destination);
        assert.ok(
          [301, 308].includes(response.status),
          `${variant} second hop returned ${response.status}, expected a permanent redirect`,
        );
        destination = new URL(response.headers.get("location"), origin).pathname;
        assert.equal(destination, expectedDestination, `${variant}: wrong final consolidation target`);
      }

      // The final target itself must be a direct page, not another redirect.
      const followed = await get(destination);
      assert.equal(
        followed.status,
        200,
        `${variant} redirects to ${destination}, which returned ${followed.status}`,
      );
    }
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

test("www URLs redirect permanently to the canonical non-www domain", async () => {
  const response = await getWithHost(
    "/car-removal-gold-coast",
    "www.uniquecashforcars.com.au",
  );
  assert.ok([301, 308].includes(response.statusCode));
  assert.equal(
    response.headers.location,
    "https://uniquecashforcars.com.au/car-removal-gold-coast",
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
  assert.match(
    response.headers.get("strict-transport-security") ?? "",
    /max-age=63072000/,
    "HSTS must not depend on the host supplying it",
  );
  // No script-src here on purpose — see the note in next.config.ts. These four
  // directives need no nonce, so they must actually be present.
  const csp = response.headers.get("content-security-policy") ?? "";
  for (const directive of [
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ]) {
    assert.ok(csp.includes(directive), `CSP is missing ${directive} — got: ${csp}`);
  }
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

test("the homepage trust proof links its business claims to public registers", async () => {
  const home = await html("/");
  const proof = home.match(/<section\b[^>]*id="business-proof"[^>]*>[\s\S]*?<\/section>/i)?.[0];
  assert.ok(proof, "homepage does not render the business-proof section");
  const proofText = plainText(proof);

  assert.match(proofText, /Proof you can check/);
  assert.match(proofText, /Know who is buying your car/);
  assert.match(proofText, /A Plus Car Removal Pty Ltd/);
  assert.match(proofText, /ABN 39 627 952 916/);
  assert.match(proofText, /Licence 4253110/);

  const links = linksIn(proof);
  assert.ok(
    links.some((link) => link.href === "https://abr.business.gov.au/ABN/View?id=39627952916"),
    "homepage does not link its ABN to ABN Lookup",
  );
  assert.ok(
    links.some(
      (link) =>
        link.href.startsWith("https://ftlr.fairtrading.qld.gov.au/home/search?") &&
        link.href.includes("LicenceNumber=4253110"),
    ),
    "homepage does not link its licence to the QLD register",
  );
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

  assert.ok(seen.size >= 10, `only found ${seen.size} internal links — selector likely broken`);

  for (const [href, from] of seen) {
    const response = await get(href);
    assert.equal(
      response.status,
      200,
      `${href} (linked from ${from}) returned ${response.status}, not a direct 200`,
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

test("MDX prose styles the elements the posts actually use", async () => {
  // Tailwind's preflight resets every heading to `font-size: inherit`, so a
  // prose-site rule set that omits h1 renders each post's title at body-text
  // size. It did exactly that. Same story for blockquote, whose margin
  // preflight zeroes — which made the archived-post callout read as prose.
  const home = await html("/");
  const href = home.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1];
  assert.ok(href, "could not find the stylesheet link");

  const response = await get(href, { accept: "text/css" });
  assert.equal(response.status, 200, `${href} returned ${response.status}`);
  const css = await response.text();

  for (const selector of [".prose-site h1", ".prose-site blockquote"]) {
    assert.ok(css.includes(selector), `stylesheet has no ${selector} rule`);
  }

  // And the posts must still be the thing that needs them.
  const post = await html(postRoutes[0]);
  assert.match(post, /<article class="[^"]*prose-site/, "post is not wrapped in prose-site");
  assert.match(post, /<h1[^>]*>/, "post has no h1");
});

test("MDX web links do not unexpectedly force a new tab", async () => {
  let externalLinkCount = 0;

  for (const path of postRoutes) {
    const source = await html(path);
    for (const [anchor] of source.matchAll(/<a\b[^>]*href="https?:\/\/[^>]*>/gi)) {
      externalLinkCount += 1;
      assert.doesNotMatch(anchor, /\btarget="_blank"/i, `${path}: ${anchor}`);
    }
  }

  assert.ok(externalLinkCount > 0, "no external MDX links found — assertion is not exercising anything");
});

test("guides show authorship and the same dates declared in BlogPosting schema", async () => {
  const dateFormatter = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    timeZone: "Australia/Brisbane",
    year: "numeric",
  });

  for (const path of postRoutes) {
    const source = await html(path);
    assert.match(source, /<p class="post-details">/, `${path}: no visible guide details`);
    assert.match(
      source,
      /<a[^>]*href="\/about"[^>]*rel="author"|<a[^>]*rel="author"[^>]*href="\/about"/,
      `${path}: no visible author link`,
    );

    const article = schemaNodes(source).find((node) => node["@type"] === "BlogPosting");
    assert.ok(article, `${path}: no BlogPosting schema`);
    const visibleDates = [...source.matchAll(/<time[^>]*datetime="([^"]+)"/gi)].map(
      ([, value]) => value,
    );
    assert.ok(
      visibleDates.includes(article.datePublished),
      `${path}: published date is only present in schema`,
    );
    assert.ok(
      visibleDates.includes(article.dateModified),
      `${path}: modified date is only present in schema`,
    );
    for (const date of new Set([article.datePublished, article.dateModified])) {
      const expected = dateFormatter.format(new Date(`${date}T00:00:00+10:00`));
      assert.match(
        source,
        new RegExp(`<time[^>]*datetime="${date}"[^>]*>${expected}<\\/time>`, "i"),
        `${path}: ${date} renders as a different calendar day`,
      );
    }
  }
});

test("the roadworthy guide's visible FAQs match its FAQPage schema", async () => {
  const source = await html("/sell-car-without-roadworthy-qld");
  const text = plainText(source);
  const faq = schemaNodes(source).find((node) => node["@type"] === "FAQPage");

  assert.ok(faq, "roadworthy guide emits no FAQPage schema");
  assert.equal(faq.mainEntity.length, 6, "roadworthy guide FAQ count");
  for (const question of faq.mainEntity) {
    assert.ok(text.includes(question.name), `FAQ question is schema-only: ${question.name}`);
    assert.ok(
      text.includes(question.acceptedAnswer.text),
      `FAQ answer is schema-only: ${question.name}`,
    );
  }
});

test("the social image is served as the type its extension claims", async () => {
  // This file was JPEG bytes behind a .png extension. Social crawlers fetch it
  // straight from public/, and this site sends nosniff — the combination that
  // makes a strict client refuse to render the image.
  const source = await html("/");
  const image = source.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(image, "no og:image on the homepage");

  const path = image.replace(publicOrigin, "");
  const response = await get(path, { accept: "image/*" });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);

  const declared = response.headers.get("content-type") ?? "";
  const expected = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  const extension = path.slice(path.lastIndexOf("."));
  assert.equal(declared.split(";")[0], expected[extension], `${path} extension vs Content-Type`);

  // And the bytes have to agree with both.
  const magic = new Uint8Array(await response.arrayBuffer()).subarray(0, 4);
  const isJpeg = magic[0] === 0xff && magic[1] === 0xd8;
  const isPng = magic[0] === 0x89 && magic[1] === 0x50;
  assert.equal(
    isJpeg ? "image/jpeg" : isPng ? "image/png" : "unknown",
    expected[extension],
    `${path} is not actually ${expected[extension]}`,
  );
});

test("the current page is marked for assistive tech, not just coloured", async () => {
  // The active nav item used to be signalled with brand colour alone, which is
  // WCAG 1.4.1 — colour as the only means of conveying information.
  //
  const blog = await html("/blog");
  assert.match(
    blog,
    /<a[^>]*href="\/blog"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/blog"/,
    "the Blog nav link must be marked as the current page",
  );

  const service = await html("/car-removal-gold-coast");
  assert.match(
    service,
    /<a[^>]*href="\/car-removal-gold-coast"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/car-removal-gold-coast"/,
    "the Car Removal nav link must be marked as the current page",
  );
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

test("404 and privacy pages stay out of the index without conflicting robots tags", async () => {
  const missingResponse = await get("/this-page-does-not-exist");
  assert.equal(missingResponse.status, 404);
  const missing = await missingResponse.text();
  assert.equal(titleOf(missing), "Page Not Found | Unique Cash For Cars");

  for (const [path, source] of [
    ["/this-page-does-not-exist", missing],
    ["/privacy-policy", await html("/privacy-policy")],
  ]) {
    const robotTags = [...source.matchAll(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi)].map(
      ([tag]) => attr(tag, /<meta\b[^>]*>/i, "content"),
    );
    assert.ok(robotTags.length > 0, `${path}: no robots metadata`);
    for (const content of robotTags) {
      assert.match(content, /noindex/i, `${path}: conflicting robots tag — ${content}`);
      assert.doesNotMatch(
        content,
        /(?:^|,\s*)index(?:,|$)/i,
        `${path}: index directive conflicts with noindex — ${content}`,
      );
    }
  }

  assert.ok(!(await sitemapPaths()).includes("/privacy-policy"));
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
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.match(result.fields.phone, /valid phone number/i);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("the quote endpoint requires location and vehicle details, not an expected price", async () => {
  const cases = [
    [
      "192.0.2.14",
      { name: "Jamie Example", phone: "0400 000 000", vehicle: "2016 Toyota Corolla" },
      "suburb",
    ],
    [
      "192.0.2.15",
      { name: "Jamie Example", phone: "0400 000 000", suburb: "Southport" },
      "vehicle",
    ],
  ];

  for (const [ip, body, expectedField] of cases) {
    const response = await fetch(`${origin}/api/quote`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    assert.equal(response.status, 400);
    assert.equal(result.code, "invalid_quote_fields");
    assert.ok(result.fields[expectedField]);
  }

  const withoutPrice = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.16",
      "idempotency-key": "16000000-0000-4000-8000-000000000016",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
    }),
  });
  assert.equal(withoutPrice.status, 200, "optional price must pass field validation");
  assert.equal((await withoutPrice.json()).code, "preview_quote");
});

test("the quote endpoint rejects non-object JSON with a controlled 400", async () => {
  for (const [index, body] of [null, [], "quote", 42, true].entries()) {
    const response = await fetch(`${origin}/api/quote`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `192.0.2.${30 + index}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    assert.equal(response.status, 400);
    assert.match(result.error, /could not be read/i);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("the quote endpoint rejects non-string field representations", async () => {
  const base = {
    name: "Jamie Example",
    phone: "0400 000 000",
    suburb: "Southport",
    vehicle: "2016 Toyota Corolla",
  };
  const bodies = [
    { ...base, expectedPrice: {} },
    { ...base, condition: [] },
    { ...base, contactRef: {} },
  ];

  for (const [index, body] of bodies.entries()) {
    const response = await fetch(`${origin}/api/quote`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `192.0.2.${60 + index}`,
      },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }
});

test("the quote endpoint enforces media type and body size", async () => {
  const wrongType = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: { "content-type": "text/plain", "x-forwarded-for": "192.0.2.40" },
    body: "{}",
  });
  assert.equal(wrongType.status, 415);

  const caseInsensitiveJson = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "Application/JSON; charset=UTF-8",
      "x-forwarded-for": "192.0.2.42",
      "idempotency-key": "42000000-0000-4000-8000-000000000042",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
    }),
  });
  assert.equal(caseInsensitiveJson.status, 200);
  assert.equal((await caseInsensitiveJson.json()).code, "preview_quote");

  const tooLarge = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.41",
    },
    body: JSON.stringify({ condition: "x".repeat(33_000) }),
  });
  assert.equal(tooLarge.status, 413);
});

test("the local quote brake is bounded and returns Retry-After", async () => {
  const ip = "192.0.2.50";
  const rejectedOrigin = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
      origin: "https://untrusted.example",
    },
    body: "{}",
  });
  assert.equal(rejectedOrigin.status, 403, "cross-origin rejection must happen before quota");

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(`${origin}/api/quote`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ contactRef: "bot" }),
    });
    assert.equal(response.status, 200, `attempt ${attempt} should fit the local burst`);
  }

  for (let attempt = 6; attempt <= 10; attempt += 1) {
    const response = await fetch(`${origin}/api/quote`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ contactRef: "bot" }),
    });
    assert.equal(response.status, 429, `attempt ${attempt} should be limited`);
    assert.match(response.headers.get("retry-after") ?? "", /^\d+$/);
  }
});

test("local production-mode builds validate without claiming a real capture", async () => {
  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.11",
      "idempotency-key": "11000000-0000-4000-8000-000000000011",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
      expectedPrice: "$3,000",
      condition: "Running",
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(result, {ok: true, code: "preview_quote", stored: false});
});

test("valid quote submissions require a stable idempotency key", async () => {
  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.17",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 428);
  assert.match(result.error, /refresh this page/i);
});

test("a honeypot hit answers 200 without a leadId", async () => {
  // Silent 200 keeps bots from learning; omitting leadId is what stops the
  // client from counting a Google Ads conversion for discarded spam.
  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.12",
    },
    body: JSON.stringify({
      name: "Bot",
      phone: "0400 000 000",
      contactRef: "http://spam.example",
    }),
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.leadId, undefined);
});

test("the privacy policy describes the Google measurement tags that production loads", async () => {
  // The policy previously claimed "no third-party analytics or advertising"
  // while the root layout loaded googletagmanager.com. Keep the two in sync.
  const source = await html("/privacy-policy");
  assert.match(source, /Google Ads/i);
  assert.match(source, /Google Analytics 4/i);
  assert.doesNotMatch(
    source,
    /loads no third-party analytics/i,
    "privacy policy must not deny the measurement tags the layout loads",
  );
  assert.match(source, /do not send the values entered in the quote form to Google/i);
  assert.doesNotMatch(source, /truncated IP address/i);

  const home = await html("/");
  const form = home.match(/<form\b[^>]*id="quote"[^>]*>[\s\S]*?<\/form>/i)?.[0] ?? "";
  assert.match(form, /href="\/privacy-policy"/);
  assert.doesNotMatch(form, /we never share your number/i);
});

test("conversion tracking separates durably captured leads from funnel intent", () => {
  const tracking = readFileSync(
    join(projectPath, "src", "components", "GoogleAdsTracking.tsx"),
    "utf8",
  );
  const quoteForm = readFileSync(
    join(projectPath, "src", "components", "QuoteForm.tsx"),
    "utf8",
  );

  assert.match(tracking, /G-VZT8S8WXDH/, "GA4 stream is not configured");
  assert.match(tracking, /sendAnalyticsEvent\("generate_lead"/, "no GA4 lead event");
  assert.match(tracking, /sendAnalyticsEvent\("click_to_call"/, "no GA4 call-click event");
  assert.match(
    tracking,
    /sendAnalyticsEvent\("quote_cta_click"/,
    "no GA4 quote-CTA event",
  );
  assert.match(
    tracking,
    /sendAnalyticsEvent\("quote_form_start"/,
    "no GA4 quote-form-start event",
  );
  assert.match(
    tracking,
    /sendAnalyticsEvent\("quote_form_error"/,
    "no GA4 quote-form-error event",
  );
  assert.match(
    tracking,
    /\[data-cta\^="quote-"\]/,
    "quote CTA tracking is not delegated from stable data attributes",
  );
  for (const category of [
    "validation_name",
    "validation_phone",
    "validation_suburb",
    "validation_vehicle",
    "rate_limited",
    "request_rejected",
    "delivery_unavailable",
    "network_error",
  ]) {
    assert.match(
      tracking,
      new RegExp(`\\|?\\s*"${category}"`),
      `quote-form error category is not allowlisted: ${category}`,
    );
  }
  assert.match(
    tracking,
    /sendConversion\(quoteConversionLabel/,
    "durably captured quote enquiries do not fire the native Google Ads conversion",
  );
  // Server-issued ID gating is exercised through the real React form in
  // quote-form.test.mjs, including malformed IDs and honeypot responses.
  assert.match(
    quoteForm,
    /trackQuoteFormStart\(\)/,
    "the quote form does not record its first interaction",
  );
  assert.match(
    quoteForm,
    /trackQuoteFormError\(validationCategories\[firstInvalidField\]\)/,
    "the quote form does not classify validation failures",
  );
  assert.match(
    quoteForm,
    /trackQuoteFormError\(responseErrorCategory\(res\.status\)\)/,
    "the quote form does not classify delivery failures",
  );
  assert.match(
    quoteForm,
    /if \(hasStartedRef\.current\) return;/,
    "the quote form can emit duplicate start events",
  );
  assert.doesNotMatch(
    quoteForm,
    /trackQuoteFormError\((?:result\.error|caught\.message|data|name|phone|suburb|vehicle|expectedPrice)\)/,
    "quote-form error tracking must not receive form values or error messages",
  );
  assert.doesNotMatch(
    tracking,
    /sendConversion\(phoneConversionLabel/,
    "phone taps must not duplicate connected-call conversions in Google Ads",
  );
});

test("rendered quote CTAs expose stable analytics locations", async () => {
  for (const path of ["/", "/contact-us", "/car-removal-gold-coast"]) {
    const source = await html(path);
    const form = source.match(/<form\b[^>]*id="quote"[^>]*>[\s\S]*?<\/form>/i)?.[0];
    assert.ok(form, `${path} does not render its quote form`);
    assert.match(form, /data-cta="quote-submit"/, `${path} has no tracked submit CTA`);
  }

  const home = await html("/");
  assert.match(home, /href="#quote"[^>]*data-cta="quote-home-intro"/);

  const guide = await html("/blog");
  const mobileQuote = guide.match(
    /<a\b[^>]*data-cta="quote-mobile-bar"[^>]*>/i,
  )?.[0];
  assert.ok(mobileQuote, "the mobile quote CTA has no stable analytics location");
  assert.match(mobileQuote, /href="\/#quote"/);
});

test("mobile conversion chrome reserves safe space and the skip link has a focus target", async () => {
  const home = await html("/");
  assert.match(home, /<main[^>]*id="main"[^>]*tabindex="-1"/i);
  assert.match(home, /safe-area-inset-bottom/g);
  assert.match(home, /<form[^>]*id="quote"[^>]*novalidate=""/i);

  const quoteForm = readFileSync(
    join(projectPath, "src", "components", "QuoteForm.tsx"),
    "utf8",
  );
  for (const field of ["name", "phone", "suburb", "vehicle"]) {
    assert.match(quoteForm, new RegExp(`aria-invalid=\\{Boolean\\(fieldErrors\\.${field}\\)\\}`));
    assert.match(quoteForm, new RegExp(`${field}-error`));
  }
  assert.match(quoteForm, /firstInvalidFieldRef/);
  assert.match(quoteForm, /\.focus\(\)/);
});

test("archived posts stay reachable but leave the sitemap", async () => {
  const archived = "/5-best-luxury-eco-friendly-cars-in-australia-2020";
  const paths = await sitemapPaths();
  assert.ok(!paths.includes(archived), "archived posts must not be in the sitemap");

  const response = await fetch(`${origin}${archived}`, { redirect: "manual" });
  assert.equal(response.status, 200, "archived posts must still resolve for inbound links");

  const source = await response.text();
  const robots =
    source.match(/name="robots"\s+content="([^"]+)"/i)?.[1] ??
    source.match(/content="([^"]+)"\s+name="robots"/i)?.[1] ??
    "";
  assert.match(
    robots,
    /noindex/i,
    "archived posts must be noindex so exclusion from the sitemap is not undermined",
  );

  const blog = await html("/blog");
  assert.doesNotMatch(
    blog,
    /href="\/5-best-luxury-eco-friendly-cars-in-australia-2020"/,
    "the guide hub must not keep promoting an archived article",
  );
});

test("every indexable page links to both keyword pillars with descriptive anchors", async () => {
  for (const path of await sitemapPaths()) {
    const links = linksIn(await html(path));
    assert.ok(
      links.some((link) => link.href === "/" && link.text === "Cash For Cars Gold Coast"),
      `${path}: no descriptive link to the cash-for-cars pillar`,
    );
    assert.ok(
      links.some(
        (link) =>
          link.href === "/car-removal-gold-coast" && link.text === "Car Removal Gold Coast",
      ),
      `${path}: no descriptive link to the car-removal pillar`,
    );
  }
});

test("indexable pages do not link internally to consolidated URLs", async () => {
  const retired = new Set([
    ...retiredCommercialRoutes.keys(),
    ...JSON.parse(readFileSync(join(projectPath, "scripts", "legacy-urls.json"), "utf8"))
      .urls.filter((url) => url.startsWith("/cash-for-cars/")),
  ]);

  for (const path of await sitemapPaths()) {
    for (const link of linksIn(await html(path))) {
      assert.ok(!retired.has(link.href), `${path}: internal link still targets ${link.href}`);
    }
  }
});

test("the quote form prioritises contact, location and vehicle details", async () => {
  const home = await html("/");
  assert.doesNotMatch(home, /name="email"|id="q-email"/);
  assert.doesNotMatch(home, /type="email"/);
  for (const name of ["name", "phone", "suburb", "vehicle"]) {
    const input = home.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0];
    assert.ok(input, `quote form must include ${name}`);
    assert.match(input, /\srequired=""/, `${name} must be required`);
  }
  const expectedPriceInput = home.match(/<input[^>]*name="expectedPrice"[^>]*>/)?.[0];
  assert.ok(expectedPriceInput, "quote form must include an expected-price input");
  assert.match(expectedPriceInput, /inputMode="numeric"/);
  assert.doesNotMatch(expectedPriceInput, /\srequired=""/);
  assert.doesNotMatch(home, /name="make"|name="model"|name="year"/);
  assert.doesNotMatch(home, /name="fuel"|Fuel type/);

  const response = await fetch(`${origin}/api/quote`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "192.0.2.13",
      "idempotency-key": "13000000-0000-4000-8000-000000000013",
    },
    body: JSON.stringify({
      name: "Jamie Example",
      phone: "0400 000 000",
      suburb: "Southport",
      vehicle: "2016 Toyota Corolla",
      condition: "Running",
    }),
  });
  const result = await response.json();

  // Local next start remains a simulation even with NODE_ENV=production.
  assert.equal(response.status, 200);
  assert.deepEqual(result, {ok: true, code: "preview_quote", stored: false});
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

  // Production measurement tags must not ship on preview URLs — they would
  // pollute the live Google Ads and Analytics properties with QA traffic.
  assert.doesNotMatch(
    built("index.html"),
    /googletagmanager\.com/,
    "a preview build must not load Google measurement tags",
  );
});
