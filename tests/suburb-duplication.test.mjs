/**
 * Suburb pages must not turn back into one template with the place name
 * swapped.
 *
 * scripts/check-duplication.mjs compares the copy in src/content/suburbs.ts
 * pairwise. This file runs that comparison on the real content, and then on
 * deliberately copied content to prove the guard still bites: a check that can
 * no longer fail is the same as no check.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  LIMITS,
  compareSuburbPages,
  suburbPagesFrom,
} from "../scripts/check-duplication.mjs";

const source = readFileSync(
  fileURLToPath(new URL("../src/content/suburbs.ts", import.meta.url)),
  "utf8",
);
const pages = suburbPagesFrom(source);

test("the eight suburb pages are read from suburbs.ts with their own copy", () => {
  assert.deepEqual(
    pages.map((page) => page.slug),
    [
      "southport",
      "surfers-paradise",
      "robina",
      "burleigh-heads",
      "labrador",
      "nerang",
      "helensvale",
      "mermaid-waters",
    ],
  );
  for (const page of pages) {
    // The parser must be reading prose, not slugs or code between strings.
    assert.doesNotMatch(page.text, /\bslug:|\bfaqs:|\bquestion:/, `${page.slug}: parsed code as copy`);
    assert.match(page.text, new RegExp(page.name), `${page.slug}: copy never names the suburb`);
  }
});

test("no two suburb pages share their sentences or phrasing", () => {
  const result = compareSuburbPages(pages);
  assert.deepEqual(result.failures, []);
  assert.equal(result.pairs.length, 28, "eight pages make 28 pairs");
});

test("the guard fails when one suburb's copy is reused for another", () => {
  const [first, second, ...rest] = pages;
  // What a doorway page is: the same text with the place name changed.
  const copied = {
    ...second,
    text: first.text.replaceAll(first.name, second.name),
  };
  const result = compareSuburbPages([first, copied, ...rest]);

  assert.ok(
    result.failures.some((failure) => failure.includes(`${first.slug} ↔ ${second.slug}`)),
    `a copied page was not reported: ${JSON.stringify(result.failures)}`,
  );
});

test("the guard fails when a sentence is copied and lightly reworded", () => {
  const [first, second, ...rest] = pages;
  // Same wording, different sentence boundaries: no sentence matches exactly,
  // so only the phrase comparison can see it.
  const reworded = {
    ...second,
    text: first.text.replaceAll(first.name, second.name).replace(/\. /g, ", and "),
  };
  const result = compareSuburbPages([first, reworded, ...rest]);

  assert.ok(
    result.failures.some(
      (failure) =>
        failure.includes(`${first.slug} ↔ ${second.slug}`) && failure.includes("five-word phrases"),
    ),
    `reworded copy was not reported: ${JSON.stringify(result.failures)}`,
  );
});

test("the guard fails when a page has too little copy of its own", () => {
  const [first, ...rest] = pages;
  const thin = { ...first, text: `Cash for cars ${first.name}. Call us for a quote today.` };
  const result = compareSuburbPages([thin, ...rest]);

  assert.ok(
    result.failures.some(
      (failure) => failure.startsWith(first.slug) && failure.includes(`fewer than ${LIMITS.minWords}`),
    ),
    `a thin page was not reported: ${JSON.stringify(result.failures)}`,
  );
});
