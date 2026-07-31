# Sitemap audit — 2026-07-31

Live source: `https://uniquecashforcars.com.au/sitemap.xml`  
Generator: `src/app/sitemap.ts`  
Advertised by: `src/app/robots.ts` → `Sitemap: https://uniquecashforcars.com.au/sitemap.xml`

## Inventory (23 URLs)

| Group | Count | Source |
|---|---|---|
| Static pages | 9 | Hardcoded in `sitemap.ts` |
| Live suburb pages | 8 | `suburbs` in `src/content/suburbs.ts` |
| Active blog posts | 6 | `posts` where `!archived` |
| **Total** | **23** | |

Archived (reachable, not listed): `/5-best-luxury-eco-friendly-cars-in-australia-2020`

Legacy Yoast paths 301 → this sitemap: `/sitemap_index.xml`, `/page-sitemap.xml`, `/post-sitemap.xml`.

## Coverage check

| Check | Result |
|---|---|
| Every App Router page that should rank is listed | **Pass** — home, 4 service pages, company, contact, blog, privacy, 8 suburbs, 6 posts |
| Dynamic suburb pages match `suburbs` | **Pass** — 8/8 |
| Retired suburb URLs (Ashmore, Adelaide, etc.) absent | **Pass** — they 301 and must not be listed |
| Archived 2020 post absent | **Pass** |
| Redirecting URLs absent | **Pass** |
| Trailing-slash variants absent (except home — see below) | **Pass** for non-home |
| `llms.txt` / `/api/*` absent | **Pass** (correct — not HTML landing pages) |
| Origin is canonical apex (no www) | **Pass** |
| Content-Type `application/xml` | **Pass** |
| Every listed URL returns 200 (no redirect hop) | **Pass** (probed live) |
| Canonical on each listed URL matches itself | **Fail → fixed** for homepage (see Findings) |

## Findings

### F1 — Homepage `loc` ≠ canonical (fixed)

| | Value |
|---|---|
| Sitemap `<loc>` | `https://uniquecashforcars.com.au/` |
| Page canonical | `https://uniquecashforcars.com.au` |

`pageMeta({ path: "/" })` uses `site.url` with **no** trailing slash. The sitemap appended `/`. Google treats these as the same homepage in practice, but the sitemap should emit the exact canonical form.

**Fix:** emit `site.url` for the homepage entry; assert loc === canonical in tests.

### F2 — Archived post out of sitemap but still indexable (fixed)

`archived: true` correctly drops the 2020 eco-cars post from the sitemap, but its metadata still allowed `index, follow`. Discovery via old links / blog index could keep it in the index and compete with current guides.

**Fix:** `noIndex: true` on that post (still 200 for inbound links; `follow` preserved via `pageMeta`).

### F3 — `changefreq` / `priority` are decorative

Google has long said it largely ignores these. Keeping them is harmless documentation of intent; no change required.

### F4 — Static pages omit `lastmod` (correct)

Build-time stamps on static/suburb pages were removed earlier so every deploy did not fake freshness. Posts keep real `date` / `updated`. Do **not** reintroduce deploy-time `lastmod`.

### F5 — Owner follow-ups (not sitemap bugs)

1. Confirm Search Console property still has `sitemap.xml` submitted (Yoast index URLs 301 here).
2. Decide long-term fate of the 2020 post: refresh or 301 to `/blog` (now noindexed + out of sitemap).
3. When adding a suburb or post, it must go through `suburbs` / `posts` — the sitemap has no separate allowlist beyond those arrays (static list is the only manual surface).

## Priority / changefreq map (current intent)

| URL pattern | priority | changefreq | lastmod |
|---|---|---|---|
| `/` | 1.0 | weekly | — |
| `/cash-for-cars`, `/cash-for-cars/*` | 0.9 | monthly | — |
| Service pages | 0.8 | monthly | — |
| `/contact-us` | 0.7 | yearly | — |
| `/blog` | 0.6 | weekly | — |
| Company info | 0.5 | yearly | — |
| Posts | 0.4 | yearly | `updated \|\| date` |
| `/privacy-policy` | 0.2 | yearly | — |

## Verdict

Sitemap is **structurally healthy**: complete coverage of indexable HTML, correct origin, no redirects/retired URLs, archived post excluded, robots advertises it only when search-visible. Two consistency fixes applied (homepage loc, archived `noIndex`).
