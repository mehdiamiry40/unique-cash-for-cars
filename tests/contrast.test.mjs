/**
 * Colour-contrast guard.
 *
 * The palette in globals.css was sampled from the live WordPress site, and two
 * of the sampled values failed WCAG AA for the way this site uses them:
 *
 *   brand     #d75253  4.02:1 on white — used for link text and, with white
 *                      labels on top, for every primary CTA. The CTAs are
 *                      16-18px bold, below the 18.66px where the 3:1
 *                      large-text allowance begins, so 4.5:1 applies.
 *   ink-muted #777777  4.48:1 on white, 3.96:1 on surface-alt.
 *
 * Both were darkened. This test exists because the obvious "fix" for a future
 * maintainer comparing against the old site is to put the lighter values back,
 * and nothing else in the build would notice.
 *
 * Parsing the source rather than the rendered page is deliberate: it pins the
 * tokens themselves, needs no server, and the failure message names the token.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(
  fileURLToPath(new URL("../src/app/globals.css", import.meta.url)),
  "utf8",
);

function token(name) {
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  assert.ok(value, `--color-${name} is not defined in globals.css`);
  return value;
}

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const [r, g, b] = channels(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/*
 * 4.5:1 is AA for normal-size text. 3:1 is AA for non-text UI boundaries
 * (WCAG 1.4.11), which is what a form input's border is — `hairline` is
 * 1.26:1 and is fine as a decorative divider, but not as a control edge.
 */
const pairs = [
  ["brand as text on white", "brand", "surface", 4.5],
  ["brand as text on the grey band", "brand", "surface-alt", 4.5],
  ["white button label on brand", "surface", "brand", 4.5],
  ["white button label on brand hover", "surface", "brand-dark", 4.5],
  ["body text on white", "ink", "surface", 4.5],
  ["headings on white", "ink-heading", "surface", 4.5],
  ["muted text on white", "ink-muted", "surface", 4.5],
  ["muted text on the grey band", "ink-muted", "surface-alt", 4.5],
  ["white on navy", "surface", "navy", 4.5],
  ["form control border on white", "field", "surface", 3.0],
];

for (const [label, fg, bg, required] of pairs) {
  test(`${label} meets WCAG AA`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(
      ratio >= required,
      `--color-${fg} on --color-${bg} is ${ratio.toFixed(2)}:1, needs ${required}:1 ` +
        `(${token(fg)} on ${token(bg)})`,
    );
  });
}
