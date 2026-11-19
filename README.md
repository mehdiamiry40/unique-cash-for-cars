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
both owners. The former cash-for-cars hub and the adjacent commercial pages
redirect directly to the closest pillar; none appears in the sitemap or
internal navigation.

Eight suburb pages sit beside the pillars at `/cash-for-cars/<suburb>`:
Southport, Surfers Paradise, Robina, Burleigh Heads, Labrador, Nerang,
Helensvale and Mermaid Waters, the suburbs in `site.areaServed`. They were
folded into the homepage in August 2026 and restored on 19 November 2026,
after Search Console showed the retired location URLs going from 1,239
impressions in 28 days to none. Each targets its suburb name only and has to
say something specific to that suburb. Twelve other location URLs, which never
had a page here, still redirect to the homepage.

See `docs/two-keyword-seo-map.md` for the complete URL map, editorial rules and
post-deployment checks.

## Local development

```bash
nvm use
npm ci
npm run dev
```

Use Node 24 and npm 10.9.8, matching CI and production. Local development,
local `next start`, and Vercel previews validate quote input in simulation only:
they do not notify the operator or count a conversion. Live quote capture
requires `VERCEL_ENV=production` and a non-development runtime.
Never add production credentials to preview or development environments.

The production quote endpoint needs exactly one complete delivery configuration:

```bash
QUOTE_WEBHOOK_URL=...
# or
RESEND_API_KEY=...
QUOTE_TO_EMAIL=...
QUOTE_FROM_EMAIL="Unique Cash For Cars <quotes@uniquecashforcars.com.au>"
```

`QUOTE_FROM_EMAIL` must use a sending domain verified in Resend. Missing,
incomplete or ambiguous configuration returns 503 and asks the visitor to call.
Each enquiry is sent straight to the provider; the site does not store leads.
If the provider rejects or times out, the visitor sees an error and can retry or
call. Browser retries reuse the same opaque submission ID as the provider
idempotency key, so an ambiguous response cannot send a second email.

Vercel Git production builds fail before deployment when the delivery
configuration is invalid. For a prebuilt deployment, use `vercel build --prod`
with the production environment pulled—do not substitute a plain local
`next build`, where `VERCEL_ENV` is intentionally unset. The repository is
public; the branch protection policy for `main`, and whether it has been
applied, is described in `.github/SECURITY-CONTROLS.md`.

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
| `check:duplication` | No two suburb pages share their sentences or phrasing |
| `test` | Production build plus crawler-visible output tests |

The rendered-output suite starts a real production server. It verifies
canonicals, unique keyword ownership, title/description uniqueness, one H1 per
page, two-pillar internal links, direct permanent redirects, sitemap contents,
structured-data IDs, article metadata, robots directives, 404 behavior,
security headers, images, accessibility state and preview-deployment noindex.
For the suburb pages it also checks that each is a direct 200 at its slashless
URL, that an unknown suburb slug is a 404, the suburb-scoped structured data,
the links between neighbouring suburbs and from the homepage, and that the copy
makes no claim about pickup frequency, payment method or customers.

Next emits `308 Permanent Redirect` for `permanent: true`. Google treats 301
and 308 as permanent redirects for signal consolidation. A retired URL reaches
its owner in one hop in both its slashless form and the trailing-slash form
WordPress served, on the apex and on `www`. Next's built-in slash redirect runs
before every custom redirect and added a hop to the slash form, so
`skipTrailingSlashRedirect` turns it off and `redirects()` in `next.config.ts`
ends with its own slash-removal rule instead. The suite requires exactly one
permanent hop to a direct 200, and a 308 from `/page/` to `/page` for every
live page.

## Project map

```text
src/
  app/
    (posts)/                         Supporting guides at legacy root URLs
    car-removal-gold-coast/          Removal keyword pillar
    cash-for-cars/[suburb]/          The eight suburb pages
    api/quote/                       Quote endpoint
    page.tsx                         Cash-for-cars keyword pillar
    sitemap.ts                       Indexable URL inventory
    robots.ts                        Production/preview crawl rules
  components/
    PrimaryServiceLinks.tsx          Shared two-pillar contextual links
  content/
    site.ts                          Brand, contact and service-area details
    services.ts                      Car-removal pillar content
    suburbs.ts                       Suburb page copy, and redirects for retired locations
    posts.ts                         Guide metadata
  lib/
    schema.ts                        JSON-LD graph builders
    seo.ts                           Canonical and social metadata
scripts/
  check-urls.mjs                     Legacy URL parity guard
  check-duplication.mjs              Suburb page doorway-content guard
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
2. Request indexing for `/`, `/car-removal-gold-coast` and the eight
   `/cash-for-cars/<suburb>` pages.
3. Confirm retired URLs return one 308 hop to the intended owner.
4. Monitor query-to-page mapping so each phrase keeps its single owner.
5. Update the Google Business Profile and citations to the same brand, phone,
   service area and legal entity.
6. Add genuine Gold Coast proof: consented pickup photos, verified reviews and
   accurate collection examples.

Do not recreate keyword-swapped suburb pages. The eight suburb pages exist
because each has copy specific to its suburb; `docs/two-keyword-seo-map.md`
lists the rules they must keep. If a new page is proposed, including a page for
one of the twelve retired locations, it needs a distinct user purpose, evidence
that the business serves the area, and content that cannot live on either
pillar.
