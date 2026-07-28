# uniquecashforcars.com.au

Next.js rebuild of the WordPress site for Unique Cash For Cars.

Next 16 (App Router) · React 19 · TypeScript · Tailwind v4 · MDX for blog posts · no CMS.

---

## Getting started

```bash
npm install
npm run fetch:assets   # pulls images from the live WordPress site into public/img
npm run dev
```

`public/img` currently holds **flat-colour placeholders** so the project builds
without network access. Run `npm run fetch:assets` before you look at anything
visually, or the pages will be full of grey rectangles.

## Verify before every deploy

```bash
npm run verify
```

Runs four checks:

| Check | What it catches |
|---|---|
| `typecheck` | Type errors across the app |
| `lint` | ESLint + Next.js rules |
| `check:urls` | **Any WordPress URL that would 404 after launch** |
| `check:duplication` | Location pages drifting back toward duplicate content |

`check:urls` is the one that matters most. It reads every URL the old site had
(`scripts/legacy-urls.json`) and asserts each one resolves to a route or has a
permanent redirect. A missed URL is a page that dies at launch.

> **On 308 vs 301:** Next emits `308 Permanent Redirect` for
> `permanent: true`, not `301`. Google's redirect documentation lists 301 and
> 308 together as permanent redirects and treats them equivalently for
> crawling and ranking-signal consolidation, so this is fine — don't let anyone
> "fix" it.

---

## Where things live

```
src/
  content/
    site.ts          Business details — name, phone, address, hours. Single source of truth.
    suburbs.ts       The 6 location pages + the 13 retired-page redirects.
    services.ts      The 3 service pages.
    posts.ts         Blog index metadata.
  app/
    (posts)/         Blog posts as .mdx, at their original root-level URLs.
    cash-for-cars/   Hub page + [suburb] dynamic route.
    api/quote/       Quote form endpoint.
    sitemap.ts       Replaces the Yoast sitemap.
    robots.ts        Replaces the WordPress robots.txt.
  components/        Header, Footer, QuoteForm, FaqAccordion, shared UI.
  lib/
    schema.ts        JSON-LD builders (AutomotiveBusiness, FAQPage, Breadcrumb).
    seo.ts           pageMeta() — always sets a canonical.
scripts/             Asset fetch + the two pre-deploy checks.
docs/                SEO audit that prompted this rebuild.
```

**To change business details** — phone, address, hours, trading name — edit
`src/content/site.ts` only. It feeds the header, footer, schema, contact page
and every `tel:` link.

---

## What changed from WordPress, and why

Read `docs/seo-audit-uniquecashforcars.md` for the full reasoning. The short list:

**19 location pages → 6.** The old ones were spun from a single template:
median 45% of sentences identical between any two pages once the suburb name
was swapped out, worst pair 93%, and 18 of 19 pages within 140 words of the
same length. Google treats that as doorway pages and suppresses the whole
domain. The 13 retired pages 301 to the nearest survivor; nothing 404s.

The six that remain each lead with something only true of that place —
basement access in Surfers, salt corrosion in Burleigh, flood write-offs in
Ipswich, proximity to the Runcorn depot in Logan. `check:duplication` enforces
this: current overlap is 0%, and the build fails above 15% mean.

**`Organization` → `AutomotiveBusiness` schema.** The old markup had a name, a
URL and a logo. This one has the full address, geo coordinates, opening hours
and service area. Deliberately no `aggregateRating` — Google hasn't shown
review snippets for self-serving LocalBusiness markup since 2019. Stars come
from Google Business Profile.

**Placeholder text removed.** `/sell-my-car-gold-coast` was live and indexed
with `"Website name" will pay you anywhere from $50 to $9,999` in its FAQ.

**COVID-19 section removed** from the homepage.

**robots.txt rebuilt.** The old one had five malformed lines like
`Disallow: /https://uniquecashforcars.com.au/]Car`.

**Mobile call bar added.** Most traffic is someone standing next to a car they
want gone. The old site made them scroll to find a phone number.

---

## Before you go live

### 1. Wire up the quote form

`src/app/api/quote/route.ts` needs one of these in your environment:

```bash
QUOTE_WEBHOOK_URL=...      # Zapier / Make / your CRM
# or
RESEND_API_KEY=...
QUOTE_TO_EMAIL=...
```

**With neither set, form submissions are logged to the server console and
otherwise discarded.** Don't ship without this.

### 2. Fill in the gaps in `src/content/site.ts`

`abn` and `licenceNumber` are empty strings. The old site claimed to be "a
trustworthy and licensed business" on nearly every page while displaying
neither. Fill them in and they appear automatically in the footer and on the
About page.

### 3. Replace the placeholders in `src/content/suburbs.ts`

Search for `NEEDS OWNER INPUT`. Real testimonials with a first name and suburb.
Don't invent them.

### 4. Check the drive times

Each suburb has a `driveTime` string that becomes a promise to customers.
Verify them against reality before launch.

### 5. Decide on the 2020 blog post

`5-best-luxury-eco-friendly-cars-in-australia-2020` is six years out of date.
It's currently labelled as an archive. Either rewrite it or add a redirect in
`next.config.ts`.

---

## A note on the Next version

This is pinned to Next 16. The build was verified end to end — 26 static pages,
all routes, redirects, schema and sitemap — but under **Next 15 with webpack**,
because the machine it was built on couldn't run Next 16's arm64 native binary.

Nothing in the code uses a Next 16-only API, so `npm run build` should work.
If Turbopack (the default bundler in 16) gives you trouble, two escape hatches
in order of preference:

```bash
npm run build -- --webpack     # same bundler the verification ran on
npm i next@15 eslint-config-next@15   # verified-good combination
```

## Launch day

1. `npm run verify` — must pass clean.
2. `npm run build && npm start` — click through every page locally.
3. Deploy. Keep the WordPress site up until DNS has fully propagated.
4. **Search Console:** submit `https://uniquecashforcars.com.au/sitemap.xml`.
   The old `/sitemap_index.xml` 301s to it, so existing submissions keep working.
5. Re-add the Google Analytics / GTM / Clarity tags. They were on the old site
   and are **not** in this build yet — decide whether you want them all before
   adding them back.
6. Use Search Console's URL Inspection on the six location pages and the
   homepage to confirm the canonical and schema are read correctly.
7. Watch Coverage in Search Console daily for the first fortnight. A spike in
   404s means a URL was missed — `check:urls` should have caught it, so add the
   URL to `scripts/legacy-urls.json` and fix it.

Expect a ranking dip for two to four weeks while Google reprocesses the
redirects. That's normal for a migration. What isn't normal is a dip that
doesn't recover — if you see that after six weeks, check Coverage for 404s and
Search Console's Manual Actions report.

---

## The thing this rebuild doesn't fix

The audit in `docs/` is blunt about this: the site was never the main problem.
There is no Google Business Profile, and for "cash for cars \[suburb\]"
searches the map pack takes most of the clicks. A faster site with better
markup helps at the margin. Being in the map pack with 25 reviews changes the
phone volume.

Do that too.
