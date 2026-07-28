import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const pages = JSON.parse(
  await readFile(new URL("../app/mirror-pages.json", import.meta.url), "utf8"),
);

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function render(pathname = "/") {
  const app = await worker();
  return app.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function expectedForLocalhost(html) {
  return html
    .replaceAll("https://uniquecashforcars.com.au", "http://localhost")
    .replaceAll("https://www.uniquecashforcars.com.au", "http://localhost")
    .replaceAll("http://uniquecashforcars.com.au", "http://localhost")
    .replaceAll("http://www.uniquecashforcars.com.au", "http://localhost")
    .replaceAll("//uniquecashforcars.com.au", "http://localhost")
    .replaceAll("//www.uniquecashforcars.com.au", "http://localhost");
}

test("mirrors the complete 32-page WordPress sitemap", () => {
  assert.equal(Object.keys(pages).length, 32);
  assert.ok(pages["/"]);
  assert.ok(pages["/cash-for-cars/southport/"]);
  assert.ok(pages["/sell-my-car-gold-coast/"]);
  assert.ok(pages["/contact-us/"]);
  assert.ok(pages["/blog/"]);
});

test("serves the mirrored homepage byte-for-byte after origin rewriting", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.equal(html, expectedForLocalhost(pages["/"]));
  assert.match(
    html,
    /<body class="home wp-singular .*wp-theme-flatsome .*wp-child-theme-flatsome-child/,
  );
  assert.match(html, /<h1[^>]*>Get Cash For Cars Gold Coast<\/h1>/i);
  assert.match(html, /\/wp-content\/themes\/flatsome\/assets\/css\/flatsome\.css/);
  assert.match(html, /\/mirror-enhancements\.js/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("serves representative inner pages exactly", async () => {
  const routes = [
    "/cash-for-cars/southport/",
    "/sell-my-car-gold-coast/",
    "/company-info-cash-for-cars-gold-coast-and-free-car-removal/",
    "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    assert.equal(await response.text(), expectedForLocalhost(pages[route]), route);
  }
});

test("includes the exact shared quote form fields on every mirrored form", () => {
  const allHtml = Object.values(pages).join("\n");
  const forms = allHtml.match(/<form\b[\s\S]*?<\/form>/gi) ?? [];
  const contactForms = forms.filter((form) => form.includes("wpcf7-form"));

  assert.equal(contactForms.length, 34);
  for (const form of contactForms) {
    for (const field of [
      "Name",
      "Phone",
      "Email",
      "address",
      "MakeModel",
      "Price",
      "car-fuel",
      "details",
    ]) {
      assert.match(form, new RegExp(`name=["']${field}["']`));
    }
  }
});

test("ships the original theme, scripts, fonts, and key media locally", async () => {
  const requiredAssets = [
    "public/wp-content/themes/flatsome/assets/css/flatsome.css",
    "public/wp-content/themes/flatsome/assets/js/flatsome.js",
    "public/wp-includes/js/jquery/jquery.min.js",
    "public/wp-content/cache/wpfc-minified/giacwoc/23nah.css",
    "public/wp-content/uploads/2022/01/Best-Cash-for-Cars-Gold-Coast.png",
    "public/wp-content/uploads/2020/12/logo.jpg",
    "public/wp-content/themes/flatsome/assets/css/icons/fl-icons.woff2",
    "public/mirror-enhancements.js",
    "public/robots.txt",
    "public/sitemap_index.xml",
  ];

  await Promise.all(
    requiredAssets.map((path) => access(new URL(path, projectRoot))),
  );
});
