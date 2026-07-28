#!/usr/bin/env node
/**
 * Doorway-page guard.
 *
 * The WordPress site had 19 location pages spun from one template — median 45%
 * of sentences identical between any two pages once the suburb name was swapped
 * out, worst pair 93%. That's what Google's spam policies call doorway pages,
 * and it suppressed the whole domain.
 *
 * This script fails the build if location content drifts back toward that.
 * It compares the prose in src/content/suburbs.ts pairwise, normalising away
 * place names so "Cash for Cars X" doesn't count as a difference.
 *
 *   npm run check:duplication
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Fail if any pair exceeds this share of shared sentences. */
const MAX_PAIR_OVERLAP = 0.25;
/** Fail if the average across all pairs exceeds this. */
const MAX_MEAN_OVERLAP = 0.15;

const source = await readFile(join(ROOT, "src", "content", "suburbs.ts"), "utf8");

/** Splits the file into one blob of prose per suburb entry. */
function extractPages() {
  const pages = [];
  const slugRe = /^\s{4}slug:\s*["']([a-z0-9-]+)["']/gm;
  const marks = [...source.matchAll(slugRe)];

  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : source.length;
    const block = source.slice(start, end);

    // Pull the human-readable strings out of the block, ignoring keys.
    const strings = [...block.matchAll(/["'`]([^"'`]{40,})["'`]/g)].map((m) => m[1]);

    pages.push({ slug: marks[i][1], text: strings.join(" ") });
  }

  return pages;
}

const pages = extractPages();

if (pages.length < 2) {
  console.log("Fewer than two location pages — nothing to compare.");
  process.exit(0);
}

// Every place name mentioned anywhere, so a shared sentence that differs only
// by suburb still counts as shared.
const placeNames = [
  ...new Set(
    pages.flatMap((p) => [
      p.slug.replace(/-/g, " "),
      ...p.slug.split("-"),
    ]),
  ),
].filter((w) => w.length > 3);

const placeRe = new RegExp(`\\b(${placeNames.join("|")})\\b`, "gi");

function sentences(text) {
  return new Set(
    text
      .replace(placeRe, "PLACE")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.replace(/\s+/g, " ").trim().toLowerCase())
      .filter((s) => s.length > 50),
  );
}

const sets = pages.map((p) => ({ slug: p.slug, set: sentences(p.text) }));

const pairs = [];
for (let i = 0; i < sets.length; i++) {
  for (let j = i + 1; j < sets.length; j++) {
    const a = sets[i];
    const b = sets[j];
    const smaller = Math.min(a.set.size, b.set.size) || 1;
    const shared = [...b.set].filter((s) => a.set.has(s));
    pairs.push({
      pair: `${a.slug} ↔ ${b.slug}`,
      overlap: shared.length / smaller,
      shared,
    });
  }
}

pairs.sort((x, y) => y.overlap - x.overlap);

const mean = pairs.reduce((acc, p) => acc + p.overlap, 0) / pairs.length;
const worst = pairs[0];

console.log(`${pages.length} location pages · ${pairs.length} pairs compared\n`);
for (const p of pairs.slice(0, 5)) {
  console.log(`  ${(p.overlap * 100).toFixed(0).padStart(3)}%  ${p.pair}`);
}
console.log(`\n  mean overlap ${(mean * 100).toFixed(1)}%  ·  worst ${(worst.overlap * 100).toFixed(0)}%`);
console.log(`  thresholds: mean < ${MAX_MEAN_OVERLAP * 100}%, any pair < ${MAX_PAIR_OVERLAP * 100}%`);

const failures = [];
if (mean > MAX_MEAN_OVERLAP) {
  failures.push(`mean overlap ${(mean * 100).toFixed(1)}% exceeds ${MAX_MEAN_OVERLAP * 100}%`);
}
for (const p of pairs.filter((p) => p.overlap > MAX_PAIR_OVERLAP)) {
  failures.push(`${p.pair} share ${(p.overlap * 100).toFixed(0)}% of sentences`);
}

if (failures.length) {
  console.error("\n✗ Location pages are drifting toward duplicate content:\n");
  for (const f of failures) console.error(`   ${f}`);
  if (worst.shared.length) {
    console.error(`\n   Example shared sentence:\n   "${worst.shared[0].slice(0, 140)}…"`);
  }
  console.error(
    "\n   Rewrite the shared passages, or move genuinely shared copy into a\n" +
      "   component (see HowItWorks.tsx) so it isn't duplicated as page text.",
  );
  process.exit(1);
}

console.log("\n✓ Location pages are substantially distinct.");
