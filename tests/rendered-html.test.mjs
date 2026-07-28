import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = new URL("../", import.meta.url);
const projectPath = fileURLToPath(projectRoot);
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const port = 43000 + (process.pid % 1000);
const requestOrigin = `http://127.0.0.1:${port}`;
const publicOrigin = "https://uniquecashforcars.com.au";
let server;
let serverOutput = "";

const pages = JSON.parse(
  await readFile(new URL("../app/mirror-pages.json", import.meta.url), "utf8"),
);
const localRoutes = [
  "/cash-for-cars/ashmore/",
  "/cash-for-cars/carrara/",
  "/cash-for-cars/helensvale/",
  "/cash-for-cars/mermaid-waters/",
  "/cash-for-cars/mudgeeraba/",
  "/cash-for-cars/nerang/",
  "/cash-for-cars/pacific-pines/",
  "/cash-for-cars/palm-beach/",
  "/cash-for-cars/robina/",
  "/cash-for-cars/southport/",
  "/cash-for-cars/surfers-paradise/",
  "/cash-for-cars/upper-coomera/",
  "/cash-for-cars/varsity-lakes/",
  "/cash-for-cars/burleigh-heads/",
  "/cash-for-cars/labrador/",
];
const retiredRouteRedirects = new Map([
  ["/cash-for-cars/cash-for-cars-adelaide/", "/cash-for-cars/"],
  ["/cash-for-cars/ipswich/", "/cash-for-cars/"],
  ["/cash-for-cars/logan/", "/cash-for-cars/"],
  ["/cash-for-cars/toowoomba/", "/cash-for-cars/"],
  ["/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/", "/blog/"],
]);
const activeRoutes = Object.keys(pages).filter(
  (route) => !retiredRouteRedirects.has(route),
);

before(async () => {
  server = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectPath,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });

  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js server exited during startup:\n${serverOutput}`);
    }
    try {
      const response = await fetch(requestOrigin);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next.js server did not become ready:\n${serverOutput}`);
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 3000);
  });
});

function render(pathname = "/", options = {}) {
  return fetch(`${requestOrigin}${pathname}`, {
    redirect: options.redirect,
    headers: {
      accept: "text/html",
      "x-forwarded-host": options.hostname ?? "uniquecashforcars.com.au",
      "x-forwarded-proto": "https",
    },
  });
}

function stripHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#0*39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html, name) {
  const tag = html.match(
    new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*>`, "i"),
  )?.[0];
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? "";
}

function fiveWordShingles(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/);
  const shingles = new Set();
  for (let index = 0; index <= words.length - 5; index += 1) {
    shingles.add(words.slice(index, index + 5).join(" "));
  }
  return shingles;
}

function jaccard(left, right) {
  let intersection = 0;
  for (const value of left) {
    if (right.has(value)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

test("keeps the 27 Gold Coast routes available and permanently redirects retired pages", async () => {
  assert.equal(Object.keys(pages).length, 32);
  assert.equal(activeRoutes.length, 27);
  for (const route of activeRoutes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
  }
  for (const [route, destination] of retiredRouteRedirects) {
    const response = await render(route, { redirect: "manual" });
    assert.equal(response.status, 301, route);
    assert.equal(
      response.headers.get("location"),
      `${publicOrigin}${destination}`,
      route,
    );
  }
});

test("publishes clean metadata and valid structured data on every page", async () => {
  for (const route of activeRoutes) {
    const response = await render(route);
    const html = await response.text();
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const description = metaContent(html, "description");
    const canonical =
      html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0]
        ?.match(/\bhref=["']([^"']+)/i)?.[1] ?? "";
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    const schemas = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];

    assert.ok(title.length > 20 && title.length <= 60, `${route}: ${title}`);
    assert.ok(
      description.length >= 110 && description.length <= 160,
      `${route}: description length ${description.length}`,
    );
    assert.equal(canonical, `${publicOrigin}${route}`, route);
    assert.equal(h1Count, 1, `${route}: expected one H1`);
    assert.equal(schemas.length, 1, `${route}: expected one schema graph`);
    const schema = JSON.parse(schemas[0][1]);
    assert.equal(schema["@context"], "https://schema.org", route);
    assert.doesNotMatch(schemas[0][1], /SearchAction/, route);
    assert.match(schemas[0][1], /LocalBusiness/, route);
    assert.match(schemas[0][1], /https:\\?\/\\?\/uniquecashforcars\.com\.au/, route);
    assert.match(schemas[0][1], /openingHoursSpecification/, route);
    assert.match(schemas[0][1], /Gold Coast/, route);
    assert.doesNotMatch(
      schemas[0][1],
      /"name":"(?:Adelaide|Brisbane|Ipswich|Logan|Toowoomba|Sunshine Coast)"/,
      route,
    );
  }
});

test("keeps preview hosts out of search without blocking the future domain", async () => {
  const preview = await render("/", { hostname: "unique-cash-for-cars.vercel.app" });
  const previewHtml = await preview.text();
  assert.equal(preview.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(metaContent(previewHtml, "robots"), "noindex, nofollow");

  const publicResponse = await render("/");
  const publicHtml = await publicResponse.text();
  assert.equal(publicResponse.headers.get("x-robots-tag"), null);
  assert.match(metaContent(publicHtml, "robots"), /^index, follow/);

});

test("removes eager trackers and uses consent-based analytics and video", async () => {
  const response = await render("/");
  const html = await response.text();
  const externalScripts = [
    ...html.matchAll(/<script\b[^>]*src=["']([^"']+)/gi),
  ].map((match) => match[1]);

  assert.ok(externalScripts.every((src) => !src.includes("googletagmanager.com")));
  assert.ok(externalScripts.every((src) => !src.includes("statcounter.com")));
  assert.doesNotMatch(html, /<iframe\b[^>]*youtube\.com/i);
  assert.match(html, /class="video-lite"/);
  assert.match(html, /id="privacy-consent"/);
  assert.match(html, /site-enhancements\.css/);
  assert.match(html, /mirror-enhancements\.js/);
});

test("loads restored WordPress images without the removed lazy-load runtime", async () => {
  for (const route of activeRoutes) {
    const html = await (await render(route)).text();
    assert.doesNotMatch(html, /<img\b[^>]*\bdata-src(?:set)?=/i, route);
    assert.doesNotMatch(
      html,
      /<img\b[^>]*\bclass=["'][^"']*\blazy-load\b/i,
      route,
    );

    for (const image of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)/gi)) {
      assert.doesNotMatch(
        image[1],
        /^data:image\/svg\+xml/i,
        `${route}: placeholder image remained`,
      );
    }
  }
});

test("makes the Gold Coast suburb pages materially distinct", async () => {
  const pageTexts = [];
  for (const route of localRoutes) {
    const html = await (await render(route)).text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
    const text = stripHtml(main);
    assert.ok(text.split(/\s+/).length >= 300, `${route}: content is too short`);
    assert.match(html, /Local vehicle buying and removal/);
    assert.match(html, /FAQPage/);
    pageTexts.push({ route, shingles: fiveWordShingles(text) });
  }

  let highest = { score: 0, pair: "" };
  for (let left = 0; left < pageTexts.length; left += 1) {
    for (let right = left + 1; right < pageTexts.length; right += 1) {
      const score = jaccard(
        pageTexts[left].shingles,
        pageTexts[right].shingles,
      );
      if (score > highest.score) {
        highest = {
          score,
          pair: `${pageTexts[left].route} vs ${pageTexts[right].route}`,
        };
      }
    }
  }
  assert.ok(
    highest.score < 0.55,
    `Local pages remain too similar (${highest.score.toFixed(3)}): ${highest.pair}`,
  );
});

test("keeps the original design while publishing Gold Coast-only details and hours", async () => {
  for (const route of activeRoutes) {
    const html = await (await render(route)).text();
    const visibleText = stripHtml(html);
    assert.match(
      visibleText,
      /Monday.{0,20}Friday.{0,35}9:00 am.{0,15}5:00 pm/i,
      route,
    );
    assert.doesNotMatch(
      visibleText,
      /\b(?:Adelaide|Brisbane|Ipswich|Logan|Toowoomba|Sunshine Coast)\b/i,
      route,
    );
  }

  const home = await (await render("/")).text();
  assert.match(home, /id="section_710941960"/);
  assert.match(home, /id="content" role="main" class="content-area"/);
  assert.doesNotMatch(home, /marketing-page|trust-strip|area-card/);

  const serviceAreas = await (await render("/cash-for-cars/")).text();
  assert.match(serviceAreas, /id="section_1057586010"/);
  assert.doesNotMatch(serviceAreas, /service-areas-page|area-card/);

  const contact = await (await render("/contact-us/")).text();
  assert.match(contact, /id="section_137570897"/);
  assert.doesNotMatch(contact, /contact-page|contact-grid/);

  const stylesheet = await readFile(
    new URL("../public/site-enhancements.css", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(stylesheet, /Gold Coast-focused marketing experience/);
});

test("repairs legacy WordPress archive links and search URLs", async () => {
  for (const path of [
    "/author/uniquecashforcars/",
    "/category/cash-for-cars/",
    "/tag/luxury-cars-australia/",
  ]) {
    const response = await render(path, { redirect: "manual" });
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), `${publicOrigin}/blog/`, path);
  }

  const search = await render("/?s=damaged+car", { redirect: "manual" });
  assert.equal(search.status, 301);
  assert.equal(search.headers.get("location"), `${publicOrigin}/blog/`);
});

test("contains no broken user-facing internal links", async () => {
  const links = new Set();
  for (const route of activeRoutes) {
    const html = await (await render(route)).text();
    for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
      try {
        const url = new URL(match[1], publicOrigin);
        if (
          url.origin === publicOrigin &&
          !url.search &&
          !url.pathname.startsWith("/wp-content/") &&
          !url.pathname.startsWith("/wp-includes/")
        ) {
          links.add(url.pathname);
        }
      } catch {}
    }
  }

  for (const retiredRoute of retiredRouteRedirects.keys()) {
    assert.ok(!links.has(retiredRoute), `active page links to ${retiredRoute}`);
  }

  for (const pathname of links) {
    const response = await render(pathname, { redirect: "manual" });
    assert.ok(response.status < 400, `${pathname}: HTTP ${response.status}`);
  }
});

test("serves host-correct robots and XML sitemaps", async () => {
  const previewRobots = await (
    await render("/robots.txt", {
      hostname: "unique-cash-for-cars.vercel.app",
    })
  ).text();
  assert.equal(previewRobots, "User-agent: *\nDisallow: /\n");

  const publicRobots = await (await render("/robots.txt")).text();
  assert.match(publicRobots, /Allow: \//);
  assert.match(
    publicRobots,
    /Sitemap: https:\/\/uniquecashforcars\.com\.au\/sitemap_index\.xml/,
  );
  assert.doesNotMatch(publicRobots, /\/https:|wp-admin|search_term_string/);

  const pageSitemap = await (await render("/page-sitemap.xml")).text();
  const postSitemap = await (await render("/post-sitemap.xml")).text();
  assert.equal((pageSitemap.match(/<url>/g) ?? []).length, 23);
  assert.equal((postSitemap.match(/<url>/g) ?? []).length, 4);
  assert.doesNotMatch(
    pageSitemap + postSitemap,
    /cash-for-cars-adelaide|\/ipswich\/|\/logan\/|\/toowoomba\/|cash-in-brisbane/,
  );
  assert.doesNotMatch(pageSitemap + postSitemap, /\.vercel\.app/);
});

test("adds the audited security headers", async () => {
  const response = await render("/");
  assert.match(response.headers.get("content-security-policy") ?? "", /default-src/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
});

test("keeps the shared quote workflow and local assets", async () => {
  const allHtml = Object.values(pages).join("\n");
  const forms = allHtml.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  const contactForms = forms.filter((form) => form.includes("wpcf7-form"));
  assert.equal(contactForms.length, 34);

  const enhancement = await readFile(
    new URL("../public/mirror-enhancements.js", import.meta.url),
    "utf8",
  );
  assert.match(
    enhancement,
    /https:\/\/mail\.uniquecashforcars\.com\.au\/wp-json\/contact-form-7\/v1\/contact-forms\/5\/feedback/,
  );
  assert.match(enhancement, /quote_form_submitted/);
  assert.match(enhancement, /GTM-KKH55J9/);

  const requiredAssets = [
    "public/wp-content/themes/flatsome/assets/css/flatsome.css",
    "public/wp-content/themes/flatsome/assets/js/flatsome.js",
    "public/wp-includes/js/jquery/jquery.min.js",
    "public/wp-content/uploads/2022/01/Best-Cash-for-Cars-Gold-Coast.png",
    "public/wp-content/uploads/2020/12/logo.jpg",
    "public/assets/hero-cash-for-cars.webp",
    "public/assets/hero-cash-for-cars-mobile.webp",
    "public/assets/unique-cash-logo.webp",
    "public/assets/video-poster.webp",
    "public/mirror-enhancements.js",
    "public/site-enhancements.css",
  ];
  await Promise.all(
    requiredAssets.map((path) => access(new URL(path, projectRoot))),
  );
});
