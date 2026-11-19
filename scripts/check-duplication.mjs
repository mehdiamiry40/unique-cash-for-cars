#!/usr/bin/env node
/**
 * Doorway-page guard for the suburb pages.
 *
 * The WordPress site had 19 location pages spun from one template. Once the
 * suburb name was swapped out, a median 45% of sentences were identical
 * between any two pages, and the worst pair shared 93%. That is what Google's
 * spam policies call doorway pages.
 *
 * This script fails when the copy in src/content/suburbs.ts drifts back toward
 * that. It compares the pages pairwise in two ways, with place names replaced
 * by a token so "…in Southport" and "…in Robina" count as the same words:
 *
 *   1. whole sentences that two pages share;
 *   2. five-word runs that two pages share, which catches a sentence that was
 *      copied and then lightly reworded.
 *
 *   npm run check:duplication
 *
 * It runs inside `npm run verify`, and tests/suburb-duplication.test.mjs runs
 * the same comparison against the real file and against deliberately copied
 * text, so `npm test` fails too.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const LIMITS = {
  /** Largest share of one page's sentences that may also appear on another. */
  maxPairSentenceOverlap: 0.25,
  /** Largest average sentence overlap across all pairs. */
  maxMeanSentenceOverlap: 0.15,
  /** Largest share of one page's five-word runs that may appear on another. */
  maxPairPhraseOverlap: 0.1,
  /** A page shorter than this has too little of its own to say. */
  minWords: 300,
};

const SHINGLE = 5;

/**
 * One blob of prose per entry in the `suburbs` array.
 *
 * Parsed from the source text so the script needs no TypeScript loader. Only
 * strings of 40 characters or more are read, which takes the titles,
 * descriptions, paragraphs, questions and answers and leaves slugs, postcodes
 * and guide slugs behind.
 */
export function suburbPagesFrom(source) {
  const start = source.indexOf("export const suburbs");
  if (start === -1) throw new Error("Could not find `export const suburbs` in suburbs.ts");
  const end = source.indexOf("\n];", start);
  if (end === -1) throw new Error("Could not find the end of the suburbs array");
  const array = source.slice(start, end);

  const marks = [...array.matchAll(/^\s{4}slug:\s*["']([a-z0-9-]+)["']/gm)];
  return marks.map((mark, index) => {
    const block = array.slice(mark.index, marks[index + 1]?.index ?? array.length);
    const name = block.match(/^\s{4}name:\s*["']([^"']+)["']/m)?.[1] ?? mark[1];
    // Double-quoted and backtick strings only: the copy is written in double
    // quotes, and apostrophes inside it must not be read as string delimiters.
    // Every literal is matched in order and filtered afterwards. Matching only
    // long ones would pair the closing quote of one string with the opening
    // quote of the next and read the code between them as prose.
    const strings = [...block.matchAll(/"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)]
      .map((match) => match[1] ?? match[2])
      .filter((text) => text.length >= 40)
      // Guide slugs are long strings too, but they are not prose.
      .filter((text) => /\s/.test(text));
    return { slug: mark[1], name, text: strings.join(" ") };
  });
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lower-cased words with every suburb name replaced by one token. */
function normaliser(pages) {
  const names = [...new Set(pages.map((page) => page.name))]
    // Longest first, so "Mermaid Waters" is replaced before a shorter name
    // could match part of it.
    .sort((a, b) => b.length - a.length)
    .map(escapeForRegExp);
  const placeRe = names.length ? new RegExp(`\\b(${names.join("|")})\\b`, "gi") : null;
  return (text) => (placeRe ? text.replace(placeRe, "PLACE") : text);
}

function sentencesOf(text) {
  return new Set(
    text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.replace(/\s+/g, " ").trim().toLowerCase())
      .filter((sentence) => sentence.length > 50),
  );
}

function wordsOf(text) {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function phrasesOf(text) {
  const words = wordsOf(text);
  const phrases = new Set();
  for (let i = 0; i + SHINGLE <= words.length; i += 1) {
    phrases.add(words.slice(i, i + SHINGLE).join(" "));
  }
  return phrases;
}

function overlap(a, b) {
  const smaller = Math.min(a.size, b.size) || 1;
  const shared = [...b].filter((item) => a.has(item));
  return { share: shared.length / smaller, shared };
}

/** Pairwise comparison of the pages, plus the reasons it fails, if any. */
export function compareSuburbPages(pages, limits = LIMITS) {
  const normalise = normaliser(pages);
  const prepared = pages.map((page) => {
    const text = normalise(page.text);
    return {
      slug: page.slug,
      words: wordsOf(page.text).length,
      sentences: sentencesOf(text),
      phrases: phrasesOf(text),
    };
  });

  const pairs = [];
  for (let i = 0; i < prepared.length; i += 1) {
    for (let j = i + 1; j < prepared.length; j += 1) {
      const a = prepared[i];
      const b = prepared[j];
      const sentences = overlap(a.sentences, b.sentences);
      const phrases = overlap(a.phrases, b.phrases);
      pairs.push({
        pair: `${a.slug} ↔ ${b.slug}`,
        sentenceOverlap: sentences.share,
        sharedSentences: sentences.shared,
        phraseOverlap: phrases.share,
        sharedPhrases: phrases.shared,
      });
    }
  }

  const meanSentenceOverlap = pairs.length
    ? pairs.reduce((total, pair) => total + pair.sentenceOverlap, 0) / pairs.length
    : 0;

  const percent = (value) => `${(value * 100).toFixed(0)}%`;
  const failures = [];

  for (const page of prepared) {
    if (page.words < limits.minWords) {
      failures.push(`${page.slug} has ${page.words} words of its own copy, fewer than ${limits.minWords}`);
    }
  }
  if (meanSentenceOverlap > limits.maxMeanSentenceOverlap) {
    failures.push(
      `mean sentence overlap ${percent(meanSentenceOverlap)} exceeds ${percent(limits.maxMeanSentenceOverlap)}`,
    );
  }
  for (const pair of pairs) {
    if (pair.sentenceOverlap > limits.maxPairSentenceOverlap) {
      failures.push(
        `${pair.pair} share ${percent(pair.sentenceOverlap)} of their sentences, e.g. "${pair.sharedSentences[0].slice(0, 110)}…"`,
      );
    }
    if (pair.phraseOverlap > limits.maxPairPhraseOverlap) {
      failures.push(
        `${pair.pair} share ${percent(pair.phraseOverlap)} of their five-word phrases, e.g. "${pair.sharedPhrases[0]}"`,
      );
    }
  }

  return { pages: prepared, pairs, meanSentenceOverlap, failures };
}

async function main() {
  const source = await readFile(join(ROOT, "src", "content", "suburbs.ts"), "utf8");
  const pages = suburbPagesFrom(source);

  if (pages.length < 2) {
    console.log("Fewer than two suburb pages. Nothing to compare.");
    return;
  }

  const result = compareSuburbPages(pages);
  const percent = (value) => `${(value * 100).toFixed(1).padStart(5)}%`;

  console.log(`${pages.length} suburb pages · ${result.pairs.length} pairs compared\n`);
  console.log("  Closest pairs by shared five-word phrases:");
  for (const pair of [...result.pairs].sort((a, b) => b.phraseOverlap - a.phraseOverlap).slice(0, 5)) {
    console.log(
      `  ${percent(pair.phraseOverlap)} phrases  ${percent(pair.sentenceOverlap)} sentences  ${pair.pair}`,
    );
  }
  console.log(
    `\n  mean sentence overlap ${percent(result.meanSentenceOverlap).trim()}` +
      `  ·  limits: sentences ${LIMITS.maxPairSentenceOverlap * 100}% per pair and ${LIMITS.maxMeanSentenceOverlap * 100}% mean, phrases ${LIMITS.maxPairPhraseOverlap * 100}% per pair`,
  );

  if (result.failures.length) {
    console.error("\n✗ Suburb pages are drifting toward duplicate content:\n");
    for (const failure of result.failures) console.error(`   ${failure}`);
    console.error(
      "\n   Rewrite the shared passages so each says something only true of its suburb,\n" +
        "   or move copy that is the same everywhere into a shared component.",
    );
    process.exit(1);
  }

  console.log("\n✓ Suburb pages are substantially distinct.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
