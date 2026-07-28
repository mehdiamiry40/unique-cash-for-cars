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
const renderedOrigin = `http://localhost:${port}`;
let server;
let serverOutput = "";

const pages = JSON.parse(
  await readFile(new URL("../app/mirror-pages.json", import.meta.url), "utf8"),
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

async function render(pathname = "/") {
  return fetch(`${requestOrigin}${pathname}`, {
    headers: { accept: "text/html" },
  });
}

function expectedForOrigin(html) {
  return html
    .replaceAll("https://uniquecashforcars.com.au", renderedOrigin)
    .replaceAll("https://www.uniquecashforcars.com.au", renderedOrigin)
    .replaceAll("http://uniquecashforcars.com.au", renderedOrigin)
    .replaceAll("http://www.uniquecashforcars.com.au", renderedOrigin)
    .replaceAll("//uniquecashforcars.com.au", renderedOrigin)
    .replaceAll("//www.uniquecashforcars.com.au", renderedOrigin);
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
  assert.equal(html, expectedForOrigin(pages["/"]));
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
    assert.equal(await response.text(), expectedForOrigin(pages[route]), route);
  }
});

test("preserves the original www-to-apex 301 redirect", async () => {
  const response = await fetch(`${requestOrigin}/cash-for-cars/?source=test`, {
    redirect: "manual",
    headers: { "x-forwarded-host": "www.uniquecashforcars.com.au" },
  });

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "http://uniquecashforcars.com.au/cash-for-cars/?source=test",
  );
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

test("submits quote forms through the original Contact Form 7 delivery endpoint", async () => {
  const enhancement = await readFile(
    new URL("../public/mirror-enhancements.js", import.meta.url),
    "utf8",
  );

  assert.match(
    enhancement,
    /https:\/\/mail\.uniquecashforcars\.com\.au\/wp-json\/contact-form-7\/v1\/contact-forms\/5\/feedback/,
  );
  assert.match(enhancement, /new FormData\(form\)/);
  assert.match(enhancement, /wpcf7mailsent/);
  assert.match(enhancement, /wpcf7invalid/);
  assert.doesNotMatch(enhancement, /window\.location\.href\s*=\s*["']sms:/);
});
