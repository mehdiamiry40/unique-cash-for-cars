# Two-keyword SEO map

Audit date: 6 August 2026. Suburb pages restored: 19 November 2026 (see
"Suburb pages" below). Homepage, removal pillar and seller page rewritten:
26 November 2026 (see "What each commercial page answers" below).

## Objective

Concentrate the site's commercial relevance on two Gold Coast queries without
making every URL compete for the same terms:

| Query | Canonical owner | Primary conversion |
|---|---|---|
| `cash for cars gold coast` | `/` | Request a vehicle quote |
| `car removal gold coast` | `/car-removal-gold-coast` | Arrange collection |

Only the owner page may use its exact query in the SEO title and H1. Supporting
pages may mention the services naturally in descriptions and body copy, but
must link authority back to both owners with descriptive anchors. Suburb
pages target their place name only ("cash for cars southport") and follow the
same rule. `/sell-my-car-gold-coast` owns the seller's query "sell my car
gold coast" and does not use either pillar phrase in its title or H1.

## Indexable URL roles

| URL | Role |
|---|---|
| `/` | Cash-for-cars commercial pillar |
| `/car-removal-gold-coast` | Car-removal commercial pillar |
| `/about` | Branded company and operator information |
| `/contact-us` | Branded contact/conversion utility |
| `/blog` | Supporting guide hub |
| Current guide URLs | Informational support; contextual links to both pillars |
| `/sell-my-car-gold-coast` | Seller's checklist for "sell my car gold coast"; links back to both pillars |
| `/cash-for-cars/<suburb>` (eleven) | Place-name queries; access guidance specific to that place |

The privacy policy is `noindex, follow` and excluded from the sitemap. The
archived 2020 article remains reachable and noindexed for inbound links, but is
not promoted by the guide hub.

## Consolidated commercial URLs

| Retired URL | Direct permanent destination |
|---|---|
| `/cash-for-cars` | `/` |
| `/unwanted-car-buyer` | `/` |
| `/car-wreckers-gold-coast` | `/car-removal-gold-coast` |
| `/company-info-cash-for-cars-gold-coast-and-free-car-removal` | `/about` |

Unique content from those pages was merged into the appropriate owner before
the redirects were introduced.

Both the slashless legacy form and the original WordPress trailing-slash form
reach their owner in one permanent hop, on the apex and on `www`. Next's
built-in slash normalisation runs before custom redirects and used to add a hop
to the slash form; since 19 November 2026 it is switched off
(`skipTrailingSlashRedirect`) and `next.config.ts` redirects both forms itself,
then removes the slash from every other path. Automated tests require exactly
one hop and a direct-200 final destination.

## Suburb pages

Eleven location pages are live at `/cash-for-cars/<suburb>`:

`southport`, `surfers-paradise`, `robina`, `burleigh-heads`, `labrador`,
`nerang`, `helensvale`, `mermaid-waters`, `ipswich`, `logan` and `toowoomba`.

They are the places in `site.areaServed` after "Gold Coast", in the same order.
The first eight are Gold Coast suburbs. Ipswich (4305), Logan City and
Toowoomba (4350) are outside that city: the page eyebrow says so, and Toowoomba
is written as a pickup reached by travelling over the range, not as a local
depot. Ipswich and Logan neighbour each other. Logan also links to Helensvale.
Toowoomba's only neighbour page is Ipswich. A place named only as nearby is not
claimed as coverage.

Why they came back. All twenty location URLs were folded into the homepage on
6 August 2026. The 19 November 2026 Search Console audit showed the retired
location URLs had 1,239 impressions in the previous 28 days and none after:
Google folded them into the homepage and stopped ranking them. The owner asked
for the pages to be restored. The eight Gold Coast suburbs that already had
rewritten pages came back first. Ipswich, Logan and Toowoomba came back next,
because those three URLs were still collecting impressions while they 308'd to
the homepage. The copy is in `src/content/suburbs.ts`.

Rules the suburb pages must keep:

- Title and H1 name the suburb ("Cash for Cars Southport"). Neither may contain
  "cash for cars gold coast" or "car removal gold coast"; those stay with the
  two owners.
- Each page leads with something only true of that suburb: its streets,
  landmarks, housing and the access problems that follow from them. A paragraph
  that could be moved to another suburb by swapping the place name does not
  belong. `npm run check:duplication` and `tests/suburb-duplication.test.mjs`
  fail when two pages share sentences or phrasing.
- No unsupported claims about pickup frequency, local premises or
  suburb-specific customer behavior. The August pages said things like
  "same-day pickup is often available" and "a lot of our Southport jobs are…".
  The restored copy says what the seller should tell us and why, and a test
  rejects that kind of wording.
- Prices, payment, timing and removal say only what the two owners and
  `site.ts` say. No payment method is named and no pickup time is promised.
- Queensland process statements match the site's guides, and each page links
  to the guides that carry the sources.
- No testimonials, review counts or statistics without evidence.
- Structured data is a `Service` scoped to the suburb as a `Place`, a two-level
  `BreadcrumbList` (Home, then the suburb) and an `FAQPage` matching the
  visible questions. The sitewide offer catalog still lists only the two owners.

Internal links: the homepage coverage section links to every suburb page with
the anchor "Cash for cars <suburb>", the footer lists them on every page, and
each suburb page links to its neighbouring suburb pages and to both owners.
Gold Coast suburb pages, and the homepage, also link to `/sell-my-car-gold-coast`.
Since 26 November 2026 each Gold Coast suburb page also links to `/` from its
body copy with the anchor "cash for cars Gold Coast". Search Console showed the
Surfers Paradise page collecting impressions for the city-wide query (61 in six
months, at position 57.5), so the suburb pages now hand that query back to its
owner in the text and not only in the service cards. The sentence lives in the
suburb template, not in `suburbs.ts`. The removal pillar links to each Gold
Coast suburb page with an anchor that names that suburb's access problem.

There is no hub page. `/cash-for-cars` still redirects to `/`, because a hub
would compete with the homepage for its own query.

## What each commercial page answers

The 26 November 2026 rewrite gave the three commercial pages separate jobs, so
they stop answering each other's query. Search Console had the homepage
outranking the removal pillar for "car removal gold coast" (position 23.2
against 61.5 over six months).

| Page | Speaks as | Covers | Hands off |
|---|---|---|---|
| `/` | The buyer | Who is buying, what is bought, how the quote and the payment confirmation work, that removal is included, where the truck goes | Collection detail to the removal pillar; paperwork to the seller page |
| `/car-removal-gold-coast` | The collection | What free removal covers, access types, cars that will not move, what to have ready, timing, how a removal differs from a tow or a wrecker | The offer to `/`; paperwork to the seller page |
| `/sell-my-car-gold-coast` | The seller's checklist | Who can buy the car, registration, finance, plates, transfer or cancellation afterwards | The offer to `/`; collection to the removal pillar |

No homepage section heading repeats the removal pillar's exact phrase. Prices,
payment and timing say the same thing on all three: one published cap
(`site.maxPayout`), a payment method that is confirmed before pickup and never
named, and same-day collection that may be available and is never promised.

The sitemap dates these three pages by hand in `src/app/sitemap.ts`
(`contentDates`). Change a date only when that page's copy changes. About,
Contact and the guide hub have no content date and stay without a lastmod.

## Consolidated location URLs

Nine former `/cash-for-cars/<location>` URLs still redirect directly to `/`:

`ashmore`, `pacific-pines`, `upper-coomera`, `carrara`, `mudgeeraba`,
`varsity-lakes`, `palm-beach`, `cash-for-cars-adelaide` and `adelaide`.

The seven Gold Coast names still have no page of their own. Adelaide stays
redirected for a different reason: it is in South Australia, not a service
area, and a page for it would be a doorway page. It is not in `site.areaServed`.

## On-page rules

- Put the mapped exact query once in the owner's title and once in its H1.
- Write the rest for the user's decision: offer factors, eligibility, timing,
  access, documents, registration and what happens on collection.
- Keep About, Contact and the guide hub branded or informational in title/H1.
- Link every indexable page to both owners with descriptive anchor text.
- Do not publish copied suburb variants, fabricated reviews, self-serving
  rating schema or unverifiable superlatives such as “#1” or “highest paying”.
  The suburb pages are held to the rules in "Suburb pages" above.
- Use one stable `Service` schema ID per owner and the same two services in the
  sitewide `AutomotiveBusiness` offer catalog.
- Keep Gold Coast typed as `City`; its named suburbs are `Place` values.

## Accuracy and entity controls

The public brand and registered operator are deliberately separate in the
site model. The service is described as serving the Gold Coast, not as having a
staffed Gold Coast storefront.

Audit references:

- [Current ABN record for 39 627 952 916](https://abr.business.gov.au/ABN/View?id=39627952916)
- [ABN/business-name history](https://abr.business.gov.au/AbnHistory/View?id=39627952916)
- [Queensland register result for motor-dealer licence 4253110](https://ftlr.fairtrading.qld.gov.au/home/search?LicenceNumber=4253110&GivenName=&LastName=&CompanyName=&MasterType=MOTOR%20DEALING)
- [Queensland safety-certificate rules](https://www.qld.gov.au/transport/registration/roadworthy)
- [Queensland registration transfer guidance](https://www.qld.gov.au/transport/registration/transfer/online)
- [RTA guidance for goods left behind](https://www.rta.qld.gov.au/forms-resources/factsheets/goods-and-documents-left-behind-fact-sheet-general-tenancies)
- [Google service-area business guidance](https://support.google.com/business/answer/9157481)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

Before publishing stronger legal, licence, location or availability claims,
the owner must verify the current evidence. Do not infer a legal exception from
the marketing objective.

## Post-deployment measurement

1. Submit the new sitemap and request recrawls for both owners.
2. In Search Console, track each target query by page. The expected mapping is
   exact: cash query → `/`; removal query → `/car-removal-gold-coast`.
3. Inspect the retired URLs and confirm a single permanent hop. Inspect the
   location URLs and `/sell-my-car-gold-coast` and confirm each is a direct 200
   with its own canonical, then request indexing for them.
4. Watch organic conversions separately on the two owners.
5. Investigate any third URL beginning to receive either exact query before
   changing copy; it may indicate internal-link or title drift. That includes a
   suburb page: each should earn its suburb-name queries, not the Gold Coast
   ones.
6. Build real local entity confidence through consistent citations, verified
   reviews and consented first-party pickup evidence.

Automated rendered-output tests enforce the keyword-owner map, direct redirect
targets, internal pillar links, schema IDs, sitemap exclusions and noindex
rules on every deployment, along with the suburb pages' URLs, canonicals,
headings, structured data, links and copy rules.
