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
nvm use
npm ci
npm run dev
```

Use Node 24 and npm 10.9.8, matching CI and production. Local development,
local `next start`, and Vercel previews validate quote input in simulation only:
they do not save details, notify the operator or count a conversion. Live quote
capture requires `VERCEL_ENV=production` and a non-development runtime.
Never add production credentials to preview or development environments.

The production quote endpoint needs exactly one complete delivery configuration:

```bash
QUOTE_WEBHOOK_URL=...
# or
RESEND_API_KEY=...
QUOTE_TO_EMAIL=...
QUOTE_FROM_EMAIL="Unique Cash For Cars <quotes@uniquecashforcars.com.au>"
DATABASE_URL=...
CRON_SECRET=...
```

`QUOTE_FROM_EMAIL` must use a sending domain verified in Resend. Missing,
incomplete or ambiguous configuration returns 503 and asks the visitor to call;
it never reports that an enquiry was captured unless the database commit
succeeded. The validated lead and one delivery outbox event are committed
atomically, then the route makes an immediate delivery attempt. Provider
timeouts, 429s and 5xx responses from Resend remain in the outbox for bounded
retries from the authenticated `/api/cron/quote-delivery` job. Ambiguous generic
webhook failures need manual reconciliation; only webhook 429s are automatically
retried. Browser, database and Resend
retries reuse the same opaque submission ID so an ambiguous response cannot
silently create another email.

Apply tracked schema changes before deploying code that uses them:

```bash
umask 077
vercel env pull /private/tmp/ucfc-production-migration.env --environment=production --yes
node --env-file=/private/tmp/ucfc-production-migration.env scripts/migrate-db.mjs
```

Confirm the intended production database before running migrations. The runner
applies numbered migrations under one transaction lock and does not reapply
completed migrations. Keep this temporary credentials file outside the source
tree and remove it after migration. Monitoring uses additive migration 002;
apply it before the release that adds receipt reconciliation and quote health.

Vercel Git production builds fail before deployment when delivery, database or
cron configuration is invalid. For a prebuilt deployment, use `vercel build
--prod` with the production environment pulled—do not substitute a plain local
`next build`, where `VERCEL_ENV` is intentionally unset.

Operational states, alert fields, triage queries and guarded manual recovery are
documented in `docs/quote-delivery-runbook.md`.

The cron limits delivery and receipt-check work within its 60-second budget.
Resend delivery receipts are reconciled separately from API acceptance. The
public `/api/health/quote` endpoint exposes only a healthy boolean and fails
closed on stale workers or unresolved enquiries. After the first healthy
production run, enable `QUOTE_HEALTH_MONITOR_ENABLED=true` in repository Actions
variables to activate the ten-minute monitor. GitHub branch protection requires
the private-repository plan support described in `.github/SECURITY-CONTROLS.md`.

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
