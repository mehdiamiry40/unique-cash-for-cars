# Two-keyword SEO map

Audit date: 6 August 2026

## Objective

Concentrate the site's commercial relevance on two Gold Coast queries without
making every URL compete for the same terms:

| Query | Canonical owner | Primary conversion |
|---|---|---|
| `cash for cars gold coast` | `/` | Request a vehicle quote |
| `car removal gold coast` | `/car-removal-gold-coast` | Arrange collection |

Only the owner page may use its exact query in the SEO title and H1. Supporting
pages may mention the services naturally in descriptions and body copy, but
must link authority back to both owners with descriptive anchors.

## Indexable URL roles

| URL | Role |
|---|---|
| `/` | Cash-for-cars commercial pillar |
| `/car-removal-gold-coast` | Car-removal commercial pillar |
| `/about` | Branded company and operator information |
| `/contact-us` | Branded contact/conversion utility |
| `/blog` | Supporting guide hub |
| Current guide URLs | Informational support; contextual links to both pillars |

The privacy policy is `noindex, follow` and excluded from the sitemap. The
archived 2020 article remains reachable and noindexed for inbound links, but is
not promoted by the guide hub.

## Consolidated commercial URLs

| Retired URL | Direct permanent destination |
|---|---|
| `/cash-for-cars` | `/` |
| `/sell-my-car-gold-coast` | `/` |
| `/unwanted-car-buyer` | `/` |
| `/car-wreckers-gold-coast` | `/car-removal-gold-coast` |
| `/company-info-cash-for-cars-gold-coast-and-free-car-removal` | `/about` |

Unique content from those pages was merged into the appropriate owner before
the redirects were introduced.

The slashless legacy form reaches its owner in one permanent hop. Because Next
normalises trailing slashes before applying custom redirects, an original
WordPress trailing-slash form can take one normalisation hop plus the
consolidation hop. Automated tests cap the chain there and require a direct-200
final destination.

## Consolidated location URLs

All former `/cash-for-cars/<location>` landing pages redirect directly to `/`:

`southport`, `surfers-paradise`, `robina`, `burleigh-heads`, `labrador`,
`nerang`, `helensvale`, `mermaid-waters`, `ashmore`, `pacific-pines`,
`upper-coomera`, `carrara`, `mudgeeraba`, `varsity-lakes`, `palm-beach`,
`logan`, `ipswich`, `toowoomba`, `cash-for-cars-adelaide` and `adelaide`.

The homepage retains a factual, non-linked service-area list. It does not make
unsupported claims about pickup frequency, local premises or suburb-specific
customer behavior.

## On-page rules

- Put the mapped exact query once in the owner's title and once in its H1.
- Write the rest for the user's decision: offer factors, eligibility, timing,
  access, documents, registration and what happens on collection.
- Keep About, Contact and the guide hub branded or informational in title/H1.
- Link every indexable page to both owners with descriptive anchor text.
- Do not publish copied suburb variants, fabricated reviews, self-serving
  rating schema or unverifiable superlatives such as “#1” or “highest paying”.
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
3. Inspect the retired URLs and confirm a single permanent hop.
4. Watch organic conversions separately on the two owners.
5. Investigate any third URL beginning to receive either exact query before
   changing copy; it may indicate internal-link or title drift.
6. Build real local entity confidence through consistent citations, verified
   reviews and consented first-party pickup evidence.

Automated rendered-output tests enforce the keyword-owner map, direct redirect
targets, internal pillar links, schema IDs, sitemap exclusions and noindex
rules on every deployment.
