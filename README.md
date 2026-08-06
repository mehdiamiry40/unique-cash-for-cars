# uniquecashforcars.com.au

Next.js site for Unique Cash For Cars.

Next 16 (App Router) · React 19 · TypeScript · Tailwind v4 · MDX guides · no CMS.

## SEO architecture

The site has two commercial search targets and one canonical landing page for
each:

| Search query | Owner URL | Page role |
|---|---|---|
| `cash for cars gold coast` | `/` | Quotes, valuation, vehicle eligibility and payment |
| `car removal gold coast` | `/car-removal-gold-coast` | Free collection, access, timing and removal preparation |

About, Contact and Guides support those pillars without using either exact
query in their title or H1. Navigation, footer and contextual CTAs reinforce
both owners. The former cash-for-cars hub, adjacent commercial pages and every
location landing page redirect directly to the closest pillar; none appears in
the sitemap or internal navigation.

See `docs/two-keyword-seo-map.md` for the complete URL map, editorial rules and
post-deployment checks.

## Local development

```bash
npm ci
npm run dev
```

The quote endpoint needs either a webhook or Resend configuration:

```bash
QUOTE_WEBHOOK_URL=...
# or
RESEND_API_KEY=...
QUOTE_TO_EMAIL=...
```

With neither configured, it returns 503 and asks the visitor to call. It never
reports that an undelivered enquiry succeeded.

## Verify before deployment

```bash
npm run verify
```

This runs:

| Check | Purpose |
|---|---|
| `typecheck` | TypeScript errors |
| `lint` | ESLint and Next.js rules |
| `check:urls` | Every legacy WordPress URL resolves or redirects |
| `test` | Production build plus crawler-visible output tests |

The rendered-output suite starts a real production server. It verifies
canonicals, unique keyword ownership, title/description uniqueness, one H1 per
page, two-pillar internal links, direct permanent redirects, sitemap contents,
structured-data IDs, article metadata, robots directives, 404 behavior,
security headers, images, accessibility state and preview-deployment noindex.

Next emits `308 Permanent Redirect` for `permanent: true`. Google treats 301
and 308 as permanent redirects for signal consolidation. Canonical slashless
legacy URLs reach their owner in one hop. An old WordPress trailing-slash form
first passes through Next's slash normalisation, so the suite caps that path at
two permanent hops and verifies the final page is a direct 200.

## Project map

```text
src/
  app/
    (posts)/                         Supporting guides at legacy root URLs
    car-removal-gold-coast/          Removal keyword pillar
    api/quote/                       Quote endpoint
    page.tsx                         Cash-for-cars keyword pillar
    sitemap.ts                       Indexable URL inventory
    robots.ts                        Production/preview crawl rules
  components/
    PrimaryServiceLinks.tsx          Shared two-pillar contextual links
  content/
    site.ts                          Brand, contact and service-area details
    services.ts                      Car-removal pillar content
    suburbs.ts                       Direct redirects for retired locations
    posts.ts                         Guide metadata
  lib/
    schema.ts                        JSON-LD graph builders
    seo.ts                           Canonical and social metadata
scripts/
  check-urls.mjs                     Legacy URL parity guard
  legacy-urls.json                  WordPress URL inventory
tests/
  rendered-html.test.mjs             Crawler-visible regression suite
docs/
  two-keyword-seo-map.md             SEO ownership and migration record
public/
  img/ and assets/                    Current image assets
  wp-content/uploads/                Preserved legacy media URLs
```

## Business data and trust

`src/content/site.ts` is the single source of truth for the public brand,
registered entity, phone, hours, ABN, licence number and service area. Keep it
aligned with the official registers and the Google Business Profile.

The website describes the operator as serving the Gold Coast; it does not
invent a Gold Coast storefront or street address. Do not add a local address,
reviews, ratings, pickup counts, same-day guarantees or licence claims without
current evidence.

At the time of the August 2026 audit, the official ABN record showed A Plus Car
Removal Pty Ltd as active, but did not show Unique Cash For Cars as a current
registered business name. Resolve the trading-name status before strengthening
brand/legal claims. Queensland motor-dealer licence 4253110 was current on 5
August 2026 and expires on 20 November 2026; recheck it before and after renewal.

## Deployment follow-up

After production deploy:

1. Submit `/sitemap.xml` in Google Search Console.
2. Request indexing for `/` and `/car-removal-gold-coast`.
3. Confirm retired URLs return one 308 hop to the intended owner.
4. Monitor query-to-page mapping so each phrase keeps its single owner.
5. Update the Google Business Profile and citations to the same brand, phone,
   service area and legal entity.
6. Add genuine Gold Coast proof: consented pickup photos, verified reviews and
   accurate collection examples.

Do not recreate keyword-swapped suburb pages. If a new page is proposed, it
needs a distinct user purpose and evidence that cannot live on either pillar.
