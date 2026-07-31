# Further audit suggestions — 31 July 2026

Post full-scale audit #14 (`main` @ `42ffe81`). Live site
`https://uniquecashforcars.com.au` crawled the same day. This pass does **not**
re-open fixed items (privacy/Ads gating, honeypot conversions, nav suburbs,
contrast/focus rings, schema basics, redirects, archived-post sitemap).

Focus: conversion UX, E-E-A-T substance, local SEO strategy still open from
`docs/seo-audit-uniquecashforcars.md`, performance/assets, a11y polish beyond
focus rings, measurement gaps, and leftover WordPress awkwardness.

Effort: **S** = hours · **M** = 1–2 days · **L** = multi-day / ongoing.
Owner = business/ops; Code = repo change.

---

## Critical

### 1. Google Business Profile still missing (map pack)

| | |
|---|---|
| **Why** | Highest-revenue gap in this niche. Map pack captures most mobile clicks for “cash for cars [suburb]”. Website work cannot substitute. |
| **Evidence** | Still listed as #1 owner item in `docs/full-scale-website-audit-2026-07-31.md` and Priority 1 in `docs/seo-audit-uniquecashforcars.md`. Live site has no review stars; competitors do (Ezy Southport title “Up To $22,000” + review signals; Prestige “Upto $13000”; CFCGC “Up To $11,000”). |
| **Action** | Register as Service Area Business (Gold Coast suburbs you cover); category Auto Wrecker; verify; fill hours/phone/photos; SMS review request on every payout. Resolve Runcorn-vs-Gold-Coast proximity honestly (SAB vs real GC presence vs Logan pivot). |
| **Effort** | M–L (ops) |
| **Owner vs code** | **Owner/business** |

### 2. Trust vacuum: empty ABN / licence + zero social proof

| | |
|---|---|
| **Why** | Cash-for-car buyers hand a stranger a vehicle. No ABN, licence, reviews, or named humans = weak conversion and weak E-E-A-T. ACL risk if “licensed” claims return without numbers. |
| **Evidence** | Live homepage/footer: no ABN/licence (`site.abn` / `site.licenceNumber` empty in `src/content/site.ts`). Company page credentials block only renders when filled (`company-info-…/page.tsx`). Live competitors show review/testimonial patterns; Unique shows neither. Five suburbs still marked `// testimonial: NEEDS OWNER INPUT` in `src/content/suburbs.ts`. |
| **Action** | Owner supplies ABN + QLD licence; restore “licensed” copy **with numbers**; collect 10–25 real reviews via GBP; supply first-name + suburb quotes for suburb pages. |
| **Effort** | S (fill fields) + ongoing (reviews) |
| **Owner vs code** | **Owner** (code already wired for ABN/licence) |

---

## High

### 3. Testimonial data model exists but UI never renders it

| | |
|---|---|
| **Why** | Even after the owner supplies quotes, customers will never see them — owner work is blocked by a code gap. |
| **Evidence** | `Suburb.testimonial` defined in `src/content/suburbs.ts`; **zero** references in `src/app/cash-for-cars/[suburb]/page.tsx` or any other component (`rg testimonial src/` → content file only). |
| **Action** | Render a quote block on suburb (and ideally home/company) when `testimonial` is set; add a test that a filled suburb shows author + quote. |
| **Effort** | S |
| **Owner vs code** | **Code** (then Owner fills content) |

### 4. Quote form friction on a phone-first business

| | |
|---|---|
| **Why** | Form is the secondary conversion surface; current field set and requirements fight urgency. |
| **Evidence** | Live form: name, phone, **email (required)**, suburb, vehicle, expected price, fuel (default **Petrol**), condition — `QuoteForm.tsx` + API requires name/phone/email (`api/quote/route.ts`). `noValidate` disables native HTML5 UX; errors only after fetch. Contact copy asks for photos by email (`contact-us/page.tsx`) but form has **no file input**. `expectedPrice` invites low-ball anchoring. Mobile bar is strong; desktop hero still stacks a long checklist (6 points) beside the form. |
| **Action** | Make email optional (or “phone or email”); drop or demote `expectedPrice`; default fuel to none / “Not sure”; add light client validation before submit; optional photo later via SMS. Keep phone CTA primary. |
| **Effort** | S–M |
| **Owner vs code** | **Code** |

### 5. Mobile “Free Quote” always jumps to homepage `#quote`

| | |
|---|---|
| **Why** | On suburb/contact/service pages the form is already on-page; shipping users to `/#quote` loses context and scroll position. |
| **Evidence** | `MobileCallBar.tsx` → `href="/#quote"` unconditionally. Suburb/contact already mount `<QuoteForm id="quote" />`. |
| **Action** | Link to `#quote` when a quote form exists on the current route; fall back to `/#quote` otherwise. |
| **Effort** | S |
| **Owner vs code** | **Code** |

### 6. SERP snippet still loses on offer number + stars

| | |
|---|---|
| **Why** | When you rank, the listing is the least attractive offer on the page. |
| **Evidence** | Live Unique title: “Up to $9,999…”. Live Ezy Southport: “Up To $22,000”. Prestige: “$13000”. CFCGC: “$11,000”. No GBP stars on Unique. Open item from SEO audit Priority 3. |
| **Action** | Only raise `site.maxPayout` if honest; otherwise rewrite titles around speed/trust (“Same-day pickup”, “Cash on collection”, “Free towing”) — homepage title still price-led in `src/app/page.tsx` / `site.ts`. Stars require GBP (item 1). |
| **Effort** | S (copy) / L (reviews) |
| **Owner vs code** | **Owner** decision + **Code** title/meta |

### 7. Soft retina images — unused higher-res WP uploads exist

| | |
|---|---|
| **Why** | Service cards and logo look soft on phones; hurts perceived legitimacy vs competitors. Prior audit said “blocked on assets” — partly true, but better sources already sit unused in `public/wp-content/`. |
| **Evidence** | Live/repo `public/img/*` service cards are **460×345**; logo **200×87**. Unused: e.g. `wp-content/uploads/2023/09/damaged-car-1536x1024.jpg`, `…/junk-cars.jpg` (1000×768), `…/unique-cash-for-car-02.jpg` (600×800), `public/assets/hero-cash-for-cars.webp` (1920×800, unused). ~118 of 126 images unused (~5.3 MB). |
| **Action** | Swap card sources to largest usable WP originals (or re-export); commission logo ≥2× `h-14`; decide keep-or-delete unused hero webps and COVID/brand-logo cruft. |
| **Effort** | S–M |
| **Owner vs code** | **Code** (swap paths) + **Owner** (new logo/photos if needed) |

### 8. Analytics blind spot: Ads only; `data-cta` unused

| | |
|---|---|
| **Why** | You can optimise Ads conversions but not organic funnels, scroll, rage-taps, or which CTA wins. SEO audit assumed GA4/Clarity from the old WP stack — **rebuild does not load them**. |
| **Evidence** | Live HTML: `googletagmanager.com/gtag/js?id=AW-750701638` only. Privacy policy correctly denies GA4/Clarity (`privacy-policy/page.tsx`). `data-cta="call|quote-…"` attributes on CTAs have no consumer. gtag.js alone ≈ **417 KB** download. |
| **Action** | Add GA4 (and optionally Clarity) behind `isAdsEnabled`-style production gate; wire `data-cta` → events; update privacy in same PR. Keep Ads phone forwarding. Decide if Ads tag should be delayed until interaction to cut mobile cost. |
| **Effort** | M |
| **Owner vs code** | **Code** + **Owner** (property IDs / consent preference) |

---

## Medium

### 9. Internal linking density gaps (nearby pills, contact cards, “What we buy”)

| | |
|---|---|
| **Why** | Crawl equity and user paths stop at dead ends; retired suburb names appear as plain text instead of 301-powered links. |
| **Evidence** | Suburb “Also collected on the same run” renders `<li>` pills, not links (`[suburb]/page.tsx` ~164–172) — includes redirect targets like Ashmore, Varsity Lakes, Palm Beach (`retiredSuburbRedirects`). Contact “Gold Coast service area” cards are unlinked text (`contact-us/page.tsx`). Homepage “What we buy” six cards: **no `<a>`** (live HTML). Suburb pages do not use `FurtherReading` (only service pages do). |
| **Action** | Link nearby names that map to live or retired slugs; link contact areas to suburb pages; link service cards to `/sell-my-car-gold-coast`, `/car-removal-gold-coast`, `/unwanted-car-buyer` (or anchors); add 1–2 guide links on suburb FAQs. |
| **Effort** | S–M |
| **Owner vs code** | **Code** |

### 10. Company page is thin and conversion-weak

| | |
|---|---|
| **Why** | About page is a primary trust URL; live page is short, anonymous, no form, no credentials, no photos. |
| **Evidence** | Live `/company-info-cash-for-cars-gold-coast-and-free-car-removal/`: ~3 short prose sections + call CTA; no quote form; credentials section absent while ABN empty; no staff/yard imagery despite `our-company.jpg` / `unique-cash-for-car-02.jpg` in uploads. Ugly WP slug kept for equity (OK) but nav label “Company” → long path still feels WP. |
| **Action** | Add named operator (if willing), process photos, credentials, FAQ, and quote form or strong dual CTA; optional `/about` redirect later. |
| **Effort** | M |
| **Owner vs code** | **Owner** (facts/photos) + **Code** |

### 11. Hours signal Mon–Fri 09:00–17:00 only

| | |
|---|---|
| **Why** | Cash-for-cars demand is often evenings/weekends; schema + contact say closed Sat/Sun with no after-hours promise. |
| **Evidence** | `site.openingHours` weekdays only; mirrored in live JSON-LD `OpeningHoursSpecification` and contact Hours card. No Saturday/Sunday/weekend copy sitewide. |
| **Action** | If you answer the mobile on weekends, publish that; else add “leave a voicemail / form — we call back next business morning” on contact + form success. Align GBP hours. |
| **Effort** | S |
| **Owner vs code** | **Owner** policy + **Code** |

### 12. Open content SEO from original audit (still under-built)

| | |
|---|---|
| **Why** | Priority 6 queries still thin or only partially covered. |
| **Evidence** | Strong posts exist for scrap worth, write-off, finance, rego transfer (all dated **2026-07-28** — same-day cluster looks synthetic). Missing dedicated high-intent pages: cancel rego after sale, roadworthy-to-sell damaged car (homepage FAQ only), brand/make pages (“cash for Toyota”). Archived 2020 eco post still live (flagged, out of sitemap) — decide 301 vs refresh. |
| **Action** | One real guide/month; stagger `date`/`updated`; 301 or rewrite 2020 post; consider 2–3 make pages only with unique stock angles. |
| **Effort** | M–L |
| **Owner vs code** | **Owner** expertise + **Code**/MDX |

### 13. Suburb page quality variance / FAQ gaps

| | |
|---|---|
| **Why** | Eight pages are much better than the old 19, but testimonials missing unevenly; nearby towns lack pages; FAQ set is parallel (4 each) without cross-cutting money questions on every page. |
| **Evidence** | Local angles are distinct (Southport basement / Surfers deadline / Burleigh salt / Nerang acreage). `NEEDS OWNER INPUT` on 5/8. No page-level FAQ for payment method, plate refund, or finance on most suburbs (some live only on service/blog). |
| **Action** | Fill testimonials; add 1 shared + 1 local FAQ each; do not spin new suburbs without unique jobs/photos. |
| **Effort** | M |
| **Owner vs code** | Both |

### 14. Partial CSP + serverless rate limit (still open hygiene)

| | |
|---|---|
| **Why** | Documented acceptances, still real gaps if abuse or XSS appears. |
| **Evidence** | Live CSP: `frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'` only (`next.config.ts` comments explain no `script-src`). Rate limit is in-memory Map (`api/quote/route.ts`) — soft brake on Vercel. |
| **Action** | KV/Upstash when spam appears; consider stricter CSP only if willing to pay dynamic-nonce cost. |
| **Effort** | M (KV) / L (full CSP) |
| **Owner vs code** | **Code** |

---

## Low

### 15. Accessibility polish beyond focus rings

| | |
|---|---|
| **Why** | Focus rings were fixed; remaining issues hurt real users and form completion. |
| **Evidence** | Quote fields use **sr-only labels + placeholders only** (`QuoteForm.tsx`) — placeholder-as-label anti-pattern; disappears on type. Sticky header + fixed mobile bar consume vertical space (`pb-16` on main). Fuel radios `size-4` tight for touch. `summary` list-none chevron OK, but no `aria-expanded` (native details — acceptable). Skip link uses `:focus` not `:focus-visible` (minor). |
| **Action** | Visible labels above inputs; larger hit targets; ensure success/error announced (success already `aria-live`). |
| **Effort** | S |
| **Owner vs code** | **Code** |

### 16. Font weight budget — 600 still loaded for little gain

| | |
|---|---|
| **Why** | Prior pass dropped 300 (−19 KB). Four weights remain; 600 is lightly used. |
| **Evidence** | `layout.tsx` preloads 400/600/700/800 (~18 KB each woff2). `font-semibold` ≈ 8 call sites; `font-bold`/`extrabold`/heading-800 dominate. |
| **Action** | Map semibold → bold (700) and drop 600, or drop 800 and use 700 for headings if brand allows. |
| **Effort** | S |
| **Owner vs code** | **Code** |

### 17. Third-party Ads JS cost on every page

| | |
|---|---|
| **Why** | Site is otherwise light; 417 KB gtag is the largest script. |
| **Evidence** | Live every page loads gtag afterInteractive; production-only gate already correct. |
| **Action** | Load on first CTA click / idle; or accept cost as Ads cost of doing business. Measure with/without on LCP/INP. |
| **Effort** | S–M |
| **Owner vs code** | **Code** |

### 18. WordPress awkward leftovers

| | |
|---|---|
| **Why** | Next rebuild is solid, but a few surfaces still read “migrated WP theme”. |
| **Evidence** | Company URL slug; Services nav parent `href: "#"` (`site.ts`); homepage H2 “Get Cash For Scrap Cars Gold Coast” keyword-stacky; logo JPEG; unused COVID/brand PNG grid in `wp-content/uploads/2020/11/`; no visible Facebook link in footer (only `sameAs` in schema). |
| **Action** | Soften keyword H2; add footer social; prune uploads not needed for hotlinks; leave company slug unless willing to 301. |
| **Effort** | S–M |
| **Owner vs code** | **Code** |

### 19. `/cash-for-cars/adelaide` 404 vs retired `cash-for-cars-adelaide`

| | |
|---|---|
| **Why** | Minor crawl trap if old short URLs or guesses exist. |
| **Evidence** | Live `/cash-for-cars/cash-for-cars-adelaide` → 301 `/`. Live `/cash-for-cars/adelaide` → **404**. Redirect map key is `cash-for-cars-adelaide` only. |
| **Action** | Add `adelaide` → `/` or hub if Search Console shows hits. |
| **Effort** | S |
| **Owner vs code** | **Code** |

---

## Nice-to-have

### 20. Hero / design-system polish (within WP fidelity)

Shorter hero (brand + one line + phone + form); optional intentional motion already partly done; keep Open Sans if brand fidelity matters. Effort S–M, **Code**.

### 21. Make/brand landing pages

Only after GBP + trust basics; unique angles per make. Effort L, **Both**.

### 22. Photo upload on quote / SMS follow-up

Matches contact copy promise. Effort M, **Code** + delivery plumbing.

### 23. Directory `sameAs` expansion

Once listed (TrueLocal, Hotfrog, etc.), add to `site.social` / schema. Effort S, **Owner** + **Code**.

---

## Suggested next sequence

### Do this week (owner — highest ROI)

| # | Action | Outcome |
|---|---|---|
| 1 | Create / verify Google Business Profile as a Service Area Business for the Gold Coast suburbs you actually cover | Map-pack eligibility |
| 2 | SMS a review link at every cash handover until you have ≥25 reviews | Stars next to the listing |
| 3 | Fill `site.abn` and `site.licenceNumber` (footer + company page already render them) | Instant trust / ACL hygiene |
| 4 | Decide SERP angle: raise `maxPayout` only if honest, **or** lead titles with same-day / cash-on-collection | Better CTR when you rank |

### Code quick-wins — done in this PR

| # | Action | Status |
|---|---|---|
| 5 | Render `suburb.testimonial` when present | **Done** — fill `suburbs.ts` to show |
| 6 | Mobile “Free Quote” → `#quote` on pages that already have a form | **Done** |
| 7 | Slim quote form (no email, no expected-price, no default fuel) | **Done** |
| 8 | Link nearby pills + contact area cards + homepage “What we buy” | **Done** |
| 9 | Sharper service-card images from `wp-content` originals | **Done** (logo still needs a new asset) |
| 10 | Redirect `/cash-for-cars/adelaide` → `/` | **Done** |

### Do this month

| # | Action |
|---|---|
| 11 | GA4 (production-gated) + privacy update; wire `data-cta` events |
| 12 | Enrich company page with photos + quote form once credentials exist |
| 13 | One new high-intent guide (cancel rego / roadworthy-to-sell) |
| 14 | 301 or rewrite the 2020 eco-cars archive |
| 15 | Publish weekend / after-hours callback policy if the mobile is answered |

### Later / if needed

KV rate limit if spam · delay Ads JS · drop font weight 600 · prune unused uploads · make pages only with unique stock angles · photo upload on quote.

---

## Already fine — do not re-litigate

Technical SEO baseline, Ads production gate, honeypot≠conversion, suburb consolidation to 8 unique pages, FAQ/AutomotiveBusiness schema, focus-visible pass, privacy aligned with Ads, archived post out of sitemap, www/slash/WP login redirects.
