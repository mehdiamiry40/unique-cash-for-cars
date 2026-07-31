# Full-scale website audit — 31 July 2026

Line-by-line review of the repository after the SEO/frontend skills pass
(#13), plus a crawl of the live production site at
`https://uniquecashforcars.com.au` and a production `next build && next start`
of every indexable page.

**Scope.** All 44 files under `src/`, `scripts/`, `tests/`, config layers,
`public/`, CI, README, `.env.example`, and live HTTP responses. Findings are
ordered by severity and were reproduced against the running site or a local
production build — not inferred from source alone.

**Baseline before this pass.** `typecheck`, `lint`, `check:urls`,
`check:duplication` and 28 rendered-output / contrast tests passed. Live site
is already the Next.js rebuild on Vercel (not WordPress). July 2026 fixes from
`docs/full-code-and-site-audit-2026-07.md` remain intact except where Google Ads
(#12) made the privacy policy false.

---

## Summary

| Severity | Count | Theme |
|---|---|---|
| Critical | 1 | Privacy policy denied tracking that production loads |
| High | 3 | Preview Ads pollution; honeypot → conversion; serverless rate limit |
| Medium | 8 | Nav/README drift, webhook timeout, EV fuel, focus rings, SEQ meta, soft images, trust gaps |
| Low | 8 | Form copy, archived post, sitemap lastmod, env example, deps, comments |

---

## Status

| # | Finding | Status |
|---|---|---|
| C1 | Privacy denies Google Ads while layout loads gtag | **Fixed** — policy rewritten, date bumped to 31 July 2026 |
| H1 | Google Ads loads on preview deployments | **Fixed** — `isAdsEnabled` gates on `VERCEL_ENV === "production"` |
| H2 | Honeypot 200 counted as Ads conversion | **Fixed** — no `leadId` + client/guard refuse to track without it |
| H3 | In-memory rate limit ineffective on Vercel | **Documented** — soft brake only; KV upgrade when abuse appears. Sweep-every-request improved. |
| M1 | Cash For Cars nav omitted 4 live suburbs | **Fixed** — all 8 in nav |
| M2 | README suburb / launch checklist drift | **Fixed** |
| M3 | Webhook `fetch` had no timeout | **Fixed** — 10s, same as Resend |
| M4 | Quote form omitted Electric fuel | **Fixed** — UI + API allowlist |
| M5 | Brand CTAs used brand-coloured focus rings | **Fixed** — white rings on brand fills |
| M6 | Unwanted-car meta claimed “South East Queensland” | **Fixed** — Gold Coast |
| M7 | Soft retina service cards / logo | **Blocked on assets** — still 460×345 / 200×87 |
| M8 | Empty ABN / licence / testimonials | **Owner** — not inventable |
| L1 | “Get Fast Enquiry” form heading | **Fixed** — “Get a Free Quote” |
| L2 | 2020 post unmarked / in sitemap | **Fixed** — `archived`, badge on index, dropped from sitemap |
| L3 | Sitemap `lastmod` ignored `post.updated` | **Fixed** |
| L4 | `.env.example` Ads placeholders / Resend-from | **Fixed** |
| L5 | `brace-expansion` high npm advisory | **Fixed** — `npm audit fix` |
| L6 | Hardcoded phone in Ads config | **Fixed** — uses `site.phone.display` |
| L7 | Stale comments (4 slugs, deleted Brisbane post) | **Fixed** |
| L8 | Unused hero webps in `public/assets/` | **Reviewed, no change** — keep until a deliberate hero swap |

### Tests added

- Honeypot returns 200 without `leadId`
- Privacy policy mentions Google Ads and does not deny third-party tags
- Archived post reachable but absent from sitemap; blog index shows “Archived”
- Every live suburb is linked from the homepage chrome
- Preview build does not load `googletagmanager.com`

---

## Critical

### C1. Privacy policy contradicted live Ads tags

`src/app/privacy-policy/page.tsx` said the site “sets no cookies and loads no
third-party analytics, advertising or tracking scripts” and that “Nothing is
shared with Google”. Production HTML (and the root layout) loaded
`googletagmanager.com/gtag/js?id=AW-750701638` after #12 (29 July), while the
policy still said “Last updated 28 July 2026”.

**Fix:** Rewrite Analytics / cookies / sharing sections for Google Ads
conversion and call measurement; bump the review date; comment tells future
editors to update the policy whenever tags change.

---

## High

### H1. Ads on preview

`GoogleAdsTracking` rendered unconditionally. Preview URLs could fire
production conversion tags. Gated behind `isAdsEnabled`
(`VERCEL_ENV === "production"`), stricter than `isSearchVisible`.

### H2. Honeypot → conversion

`POST /api/quote` with `contactRef` set returned `{ ok: true }`. The client
called `trackQuoteConversion` on any OK response. Now: honeypot still silent
200, but without `leadId`; `trackQuoteConversion` no-ops without an id; form
only tracks when `leadId` is present.

### H3. Rate limit on serverless

Six rapid live POSTs all returned 200 with new `leadId`s despite a 5/min
ceiling — each Vercel isolate has its own Map. Documented as a soft brake;
sweep-every-request stops stale-key buildup. Real ceiling needs Upstash /
Vercel KV.

---

## Medium (selected)

### M1 / M2 — Nav and docs lagged the eight suburbs

Nav listed four; footer and hub listed eight. README still said “4 location
pages”, “15 retired”, “six location pages”, and “Ads not in this build”.

### M7 / M8 — Owner / asset blockers

| Item | Evidence |
|---|---|
| Service cards 460×345 | Live `/_next/image?w=1080` still serves 460×345 |
| Logo 200×87 vs `h-14` @2× | Needs ~112px height source |
| `site.abn` / `licenceNumber` empty | Footer omits both |
| Suburb testimonials | Still `NEEDS OWNER INPUT` |
| No Google Business Profile | Off-site; still the largest revenue gap |

---

## Live crawl notes (production)

| Check | Result |
|---|---|
| Stack | Next on Vercel (`x-nextjs-prerender`, `/_next/static`) |
| WordPress | Gone (`/wp-login.php` → 307 `/`) |
| Homepage / suburbs / services / blog / contact | 200, schema present |
| robots / sitemap | 200; sitemap ~24 URLs before archived drop |
| www / http / trailing slash / legacy suburbs | Permanent redirects |
| Security headers | HSTS, CSP frame-ancestors, nosniff, Referrer-Policy |
| Quote delivery | Wired (valid probe → 200 + `leadId`) |
| Ads | gtag present on production HTML |

---

## Owner checklist (not code)

1. Google Business Profile (map pack)
2. Fill ABN + QLD licence number
3. Real suburb testimonials
4. Replace service-card + logo photography at ≥2× display size
5. Decide: refresh or 301 the 2020 eco-cars post (now archived + out of sitemap)
6. Optional: Upstash/KV rate limit if form spam appears
7. Optional: GA4 / Clarity — only with a privacy-policy update in the same PR

---

## Verification

`npm run verify` (typecheck, lint, check:urls, check:duplication, full test
suite including the new assertions) is the gate for this pass.
