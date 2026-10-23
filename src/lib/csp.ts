import { createHash } from "node:crypto";

/**
 * Replaced after `next build` with the sha256 hashes of every inline script in
 * the prerendered HTML, plus the Google measurement snippet next/script inserts.
 * A real hash token keeps the directive valid if that pass does not run; those
 * pages would then refuse their own scripts instead of failing open.
 */
export const SCRIPT_HASH_PLACEHOLDER =
  "'sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='";

/**
 * Hosts the production gtag snippet actually loads.
 *
 * Google Ads (AW-) and GA4 (G-) are loaded from googletagmanager.com by
 * next/script. gtag then requests the Ads and Analytics collectors below.
 * `https://*.google-analytics.com` and `https://*.analytics.google.com` are
 * the regional GA4 collectors (`region1`, and the same pattern for other
 * regions). A visitor's region is chosen by Google, so listing one region
 * would drop measurement everywhere else. These are not open wildcards:
 * `https://*.google.com`, `https:`, and `*` are intentionally absent.
 */
const scriptHosts = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://ssl.google-analytics.com",
  "https://www.googleadservices.com",
  "https://www.google.com",
  "https://pagead2.googlesyndication.com",
  "https://googleads.g.doubleclick.net",
  // gtag's call-measurement loader. Loaded by the tag itself, not by our HTML.
  "https://www.gstatic.com",
];

const imageHosts = [
  "https://www.google-analytics.com",
  "https://www.googletagmanager.com",
  "https://www.google.com",
  "https://www.google.com.au",
  "https://googleads.g.doubleclick.net",
  "https://stats.g.doubleclick.net",
  "https://www.googleadservices.com",
  "https://pagead2.googlesyndication.com",
  "https://www.gstatic.com",
];

const connectHosts = [
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
  "https://*.analytics.google.com",
  "https://stats.g.doubleclick.net",
  "https://ad.doubleclick.net",
  "https://www.google.com",
  "https://www.google.com.au",
  "https://googleads.g.doubleclick.net",
  "https://www.googleadservices.com",
  "https://pagead2.googlesyndication.com",
  "https://www.googletagmanager.com",
  "https://www.gstatic.com",
];

const frameHosts = [
  "https://www.googletagmanager.com",
  "https://td.doubleclick.net",
];

export function hashInlineScript(source: string) {
  const digest = createHash("sha256").update(source, "utf8").digest("base64");
  return `'sha256-${digest}'`;
}

/**
 * Script-element text, exactly as the HTML parser exposes it.
 * Script data does not decode character references, so the bytes between the
 * tags are the bytes the browser hashes.
 */
export function extractInlineScriptSources(html: string) {
  const openTags = html.match(/<script\b/gi)?.length ?? 0;
  const closeTags = html.match(/<\/script>/gi)?.length ?? 0;
  if (openTags !== closeTags) {
    throw new Error(
      `Unbalanced script tags (${openTags} open, ${closeTags} close) while collecting CSP hashes`,
    );
  }

  const sources: string[] = [];
  const tags = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  let matched = 0;
  for (const match of tags) {
    matched += 1;
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (body.length === 0) continue;
    sources.push(body);
  }

  if (matched !== openTags) {
    throw new Error(
      `Could not pair every script tag (${matched} of ${openTags}) while collecting CSP hashes`,
    );
  }

  return sources;
}

export function contentSecurityPolicy(
  inlineHashes: readonly string[] = [SCRIPT_HASH_PLACEHOLDER],
) {
  const hashes =
    inlineHashes.length > 0 ? inlineHashes.join(" ") : SCRIPT_HASH_PLACEHOLDER;

  return [
    "default-src 'self'",
    `script-src 'self' ${hashes} ${scriptHosts.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self'",
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' ${imageHosts.join(" ")}`,
    "font-src 'self'",
    `connect-src 'self' ${connectHosts.join(" ")}`,
    `frame-src ${frameHosts.join(" ")}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
