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

`public/img` holds the real photographs, restored from the WordPress media
library and committed. `npm run fetch:assets` re-downloads them from the live
site and is only needed if one goes missing.

## Verify before every deploy

```bash
npm run verify
```

Runs five checks:

| Check | What it catches |
|---|---|
| `typecheck` | Type errors across the app |
| `lint` | ESLint + Next.js rules |
| `check:urls` | **Any WordPress URL that would 404 after launch** |
| `check:duplication` | Location pages drifting back toward duplicate content |
| `test` | What a crawler actually receives — see below |

`check:urls` is the one that matters most. It reads every URL the old site had
(`scripts/legacy-urls.json`) and asserts each one resolves to a route or has a
permanent redirect. A missed URL is a page that dies at launch.

### The test suite

`npm test` builds the site and runs `tests/rendered-html.test.mjs` against a
real `next start` server. Response headers come from `next.config.ts` and never
appear in the prerendered HTML, so a live server is the only way to check them.

It asserts, across every page in the sitemap:

- Each sitemap URL returns a direct 200, and its canonical points back at itself
- Titles and descriptions sit inside what a search result displays, and **no two
  pages share either** — the specific failure this rebuild exists to prevent
- One `h1` per page
- Structured data parses, carries the right types per page (`AutomotiveBusiness`
  and `WebSite` everywhere, `FAQPage` where FAQs render, `BreadcrumbList`,
  `Service` on location pages, `BlogPosting` on posts), no `aggregateRating`,
  and **every `{"@id"}` reference resolves to a node defined on the same page**
- The 15 retired location URLs return a permanent redirect to a page that exists
- The security headers are actually on the response — including HSTS and the
  nonce-free CSP directives — and `x-powered-by` is not
- Images and the preserved WordPress upload paths are served immutable
- No internal link 404s, and every referenced image exists in `public/`
- **The og:image's extension, its `Content-Type` and its actual bytes agree.**
  It shipped as JPEG behind a `.png` name, which under `nosniff` is how a link
  preview ends up with no picture
- **`prose-site` styles the elements the MDX posts use.** Tailwind's preflight
  resets heading sizes, so a missing `h1` rule silently renders every post
  title at body-text size — which is what it was doing
- The current page is marked with `aria-current`, not colour alone
- This build is indexable — and a `VERCEL_ENV=preview` build is not

`tests/contrast.test.mjs` runs separately and needs no server: it parses the
design tokens out of `globals.css` and asserts each foreground/background pair
clears WCAG AA. The brand red and the muted grey are deliberately darker than
the WordPress originals because the sampled values failed; the test is there so
nobody "corrects" them back.

That last one builds a second copy into `.next-preview` (gitignored) and checks
it serves `Disallow: /` and `noindex`. It costs an extra build, which is worth
it: a preview URL left indexable competes with the live site for its own
keywords and nobody notices for months.

Each assertion was checked by breaking the thing it guards and confirming the
test failed — a dropped security header, a dangling schema `@id`, a missing
image, and an inverted preview-indexing rule.

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
    suburbs.ts       The 4 location pages + the 15 retired-page redirects.
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
    deploy.ts        Keeps preview deployments out of search.
scripts/             Asset fetch + the two pre-deploy checks.
docs/                SEO audit that prompted this rebuild.
public/
  img/               The 8 images the pages currently use.
  assets/            Hero artwork as webp (1920x800 landscape, 800x1000 portrait).
                     Not currently rendered — the hero uses public/img.
  wp-content/uploads/  116 original WordPress images. See below.
.github/workflows/   CI: verify + build on push and PR.
```

### The image library

`public/wp-content/uploads` holds the full original WordPress media library,
kept at its original paths. Two reasons: old image URLs keep resolving, so
Google Images results and any external hotlinks survive the move; and it is a
real photo library where this project otherwise has eight files.

Worth knowing what is in there, because the pages don't use most of it yet:

- **Actual photographs** — `2020/01/cash-for-cars.jpg` is a 1920x660 banner
  shot, `2023/09/damaged-car.jpg` is 1600x1067, `2022/05/why-choose-us.jpg`,
  `2020/01/wrecked-vehicles.jpg`, `2022/10/truck-removing-car.jpg`.
- **15 car-brand logos** under `2020/11/` — Toyota, Mazda, Ford, Holden, BMW,
  Audi, Mercedes, Nissan, Honda, Subaru, Suzuki, Mitsubishi, Kia, Jeep, Volvo.
  A "brands we buy" strip is a standard trust element on competitor sites.
- Thumbnail variants (`-300x230`, `-768x590`) that WordPress generated for
  srcsets. Kept because they may be indexed; not useful for new work.

**To change business details** — phone, hours, trading name — edit
`src/content/site.ts` only. It feeds the header, footer, schema, contact page
and every `tel:` link.

---

## What changed from WordPress, and why

Read `docs/seo-audit-uniquecashforcars.md` for the full reasoning. The short list:

**19 location pages → 4.** The old ones were spun from a single template:
median 45% of sentences identical between any two pages once the suburb name
was swapped out, worst pair 93%, and 18 of 19 pages within 140 words of the
same length. Google treats that as doorway pages and suppresses the whole
domain. The 15 retired pages 301 to the nearest survivor; nothing 404s.

The pages that remain each lead with something only true of that place —
basement access in Surfers and salt corrosion in Burleigh, for example.
`check:duplication` enforces this: current overlap is 0%, and the build fails
above 15% mean.

**`Organization` → `AutomotiveBusiness` schema.** The old markup had a name, a
URL and a logo. This one has opening hours and a Gold Coast service area, while
deliberately omitting a public street address and coordinates. Deliberately no
`aggregateRating` — Google hasn't shown review snippets for self-serving
LocalBusiness markup since 2019. Stars come from Google Business Profile.

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

**With neither set, the endpoint answers 503 and tells the caller to phone
instead.** It does not accept and drop the enquiry, and it does not report
success it cannot deliver — but nobody can reach you through the form until one
of these is configured. Don't ship without it.

### 2. Fill in the gaps in `src/content/site.ts`

`abn` and `licenceNumber` are empty strings. Fill them in and they appear
automatically in the footer and on the About page.

This one is not cosmetic. The old site called itself "a trustworthy and
licensed business" on nearly every page while displaying neither number, and
the rebuild inherited the claim in four places — the hero list, the homepage
intro, a homepage FAQ and the About page's `<title>`. Those have been reworded
to things the business can stand behind, because an unsubstantiated licensing
representation is an Australian Consumer Law exposure, not just weak copy.

Once you have the licence number, put the stronger wording back **with the
number next to it** — "Licensed QLD vehicle buyer, licence 12345" is worth far
more than the adjective on its own.

### 3. Replace the placeholders in `src/content/suburbs.ts`

Search for `NEEDS OWNER INPUT`. Real testimonials with a first name and suburb.
Don't invent them.

### 4. Decide on the 2020 blog post

`5-best-luxury-eco-friendly-cars-in-australia-2020` is six years out of date.
It's currently labelled as an archive — and the label is now actually visible,
which it wasn't: the callout is a blockquote and `prose-site` had no blockquote
rule, so it rendered as ordinary prose. Either rewrite the post or add a
redirect in `next.config.ts`.

If you redirect it, delete the `.mdx` file in the same commit. `check:urls`
will fail if you don't — a page file shadowed by a redirect is built on every
deploy and served to nobody, which is exactly what happened to the retired
Brisbane post.

### 5. Replace the service-card photographs

The six images on the homepage are 460×345, and that is the largest copy that
exists anywhere in `public/wp-content/uploads`. A modern phone at 2× wants
roughly 780px across, so the cards are soft on most devices and no code change
can fix it. Same story for the header logo at 200×87. New photography is the
only remedy.

---

## A note on the Next version

Pinned to Next 16, and verified on it: `npm run verify` passes end to end under
Next 16 with Turbopack — all routes, redirects, schema, sitemap and the full
rendered-output suite. An earlier revision of this file warned that the build
had only ever been checked under Next 15 with webpack; that is no longer true.

If Turbopack ever gives you trouble, `npm run build -- --webpack` is the
escape hatch.

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
