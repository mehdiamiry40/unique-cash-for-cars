#!/usr/bin/env node
/**
 * URL parity check — the most important test in this repo.
 *
 * Asserts that every URL the WordPress site had either resolves to a route in
 * the new app or has an explicit 301 redirect. A single missed URL is a page
 * that 404s after launch and loses whatever ranking it had.
 *
 *   npm run check:urls
 *
 * Run it before every deploy. It's also wired into `npm run verify`.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP = join(ROOT, "src", "app");

/** Walks src/app and derives the URL each page file serves. */
async function collectRoutes(dir = APP, segments = []) {
  const routes = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Route groups (folder) and private folders (_folder) don't affect the URL.
      const isGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
      const isPrivate = entry.name.startsWith("_");
      if (isPrivate) continue;
      routes.push(
        ...(await collectRoutes(full, isGroup ? segments : [...segments, entry.name])),
      );
      continue;
    }

    if (/^page\.(tsx|ts|mdx|jsx|js)$/.test(entry.name)) {
      routes.push({
        url: "/" + segments.join("/"),
        file: relative(ROOT, full),
        dynamic: segments.some((s) => s.startsWith("[")),
      });
    }
  }

  return routes;
}

/** Pulls the retired-suburb redirect keys straight out of the content module. */
async function collectRedirects() {
  const source = await readFile(join(ROOT, "src", "content", "suburbs.ts"), "utf8");
  const block = source.match(
    /retiredSuburbRedirects[^=]*=\s*\{([\s\S]*?)\n\};/,
  );
  if (!block) throw new Error("Could not find retiredSuburbRedirects in suburbs.ts");

  return [...block[1].matchAll(/["']?([a-z0-9-]+)["']?\s*:\s*["']([^"']+)["']/g)].map(
    ([, slug, destination]) => ({
      from: `/cash-for-cars/${slug}`,
      to: destination,
    }),
  );
}

/** Slugs served by the [suburb] dynamic route. */
async function collectSuburbSlugs() {
  const source = await readFile(join(ROOT, "src", "content", "suburbs.ts"), "utf8");
  return [...source.matchAll(/^\s{4}slug:\s*["']([a-z0-9-]+)["']/gm)].map((m) => m[1]);
}

function matches(url, routes, suburbSlugs) {
  if (routes.some((r) => !r.dynamic && r.url === url)) return "static route";

  const suburbMatch = url.match(/^\/cash-for-cars\/([a-z0-9-]+)$/);
  if (suburbMatch && suburbSlugs.includes(suburbMatch[1])) return "dynamic route";

  return null;
}

async function main() {
  const [{ urls: legacy }, routes, redirects, suburbSlugs] = await Promise.all([
    readFile(join(ROOT, "scripts", "legacy-urls.json"), "utf8").then(JSON.parse),
    collectRoutes(),
    collectRedirects(),
    collectSuburbSlugs(),
  ]);

  const missing = [];
  const summary = [];

  for (const url of legacy) {
    const routeHit = matches(url, routes, suburbSlugs);
    if (routeHit) {
      summary.push([url, routeHit, ""]);
      continue;
    }

    const redirect = redirects.find((r) => r.from === url);
    if (redirect) {
      // A redirect that points at a dead end is as bad as a 404.
      const destOk = matches(redirect.to, routes, suburbSlugs);
      if (!destOk) {
        missing.push(`${url} → ${redirect.to} (destination does not resolve)`);
      } else {
        summary.push([url, "301", `→ ${redirect.to}`]);
      }
      continue;
    }

    missing.push(`${url} (no route, no redirect)`);
  }

  const width = Math.max(...summary.map(([u]) => u.length), 10);
  for (const [url, kind, extra] of summary) {
    console.log(`  ${url.padEnd(width)}  ${kind.padEnd(14)} ${extra}`);
  }

  console.log(
    `\n${legacy.length} legacy URLs · ${routes.filter((r) => !r.dynamic).length} static routes · ${suburbSlugs.length} suburb pages · ${redirects.length} redirects`,
  );

  if (missing.length) {
    console.error(`\n✗ ${missing.length} URL(s) would 404 after launch:\n`);
    for (const m of missing) console.error(`   ${m}`);
    process.exit(1);
  }

  console.log("\n✓ Every legacy URL resolves or redirects.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
