# SEO Audit — uniquecashforcars.com.au

**Audited:** 28 July 2026 · 27 pages + 5 blog URLs crawled · live data from the site, Google search results and three competitors

---

## The short version

Your website is not technically broken. It loads fast, it's indexed, the tags are in place, Google can crawl everything. If someone has told you that you need a "site speed fix" or a "technical SEO package", you'd be paying for a problem you don't have.

The actual problems are three, in order of how much they cost you:

1. **You have no Google Business Profile.** In this industry the map pack — the three businesses with star ratings that sit above the normal results — takes most of the clicks. You are not in it. This is your single biggest loss.
2. **Your 19 suburb pages are near-copies of each other.** Once you swap the suburb name out, the median pair of pages shares 45% of its sentences word-for-word, a third of all pairs share 50%+, and the worst pair (Palm Beach vs Varsity Lakes) is 93% identical. Google classifies this as doorway pages and suppresses the *whole site*, not just those pages.
3. **When you do rank, your listing is the least attractive one on the page.** Your title says "$9999". The competitors around you say $11,000, $13,000, $19,999 and $22,000. They have star ratings. You have neither. That is a clicks problem in the most literal sense.

Everything below is ordered by impact. Do items 1–3 and ignore the rest if you have to.

---

## Before you do anything: check Search Console

You already have Google Search Console verified and GA4, GTM and Microsoft Clarity installed — good, the data is there.

Open Search Console → Performance → last 3 months. You're looking for one number:

- **High impressions, near-zero clicks** → you rank, but nobody picks you. Your problem is the snippet: price claim, no reviews, weak title. Go to Priority 3.
- **Near-zero impressions too** → you don't rank at all. Your problem is authority and the duplicate pages. Go to Priorities 1 and 2.

Five minutes of looking will tell you which half of this document matters most. My read from the outside is that it's mostly the second, but check.

---

## What's already fine — don't spend money here

| Check | Status |
|---|---|
| Indexed in Google | Yes — pages appear for long-tail searches |
| robots meta | `index, follow` — correct |
| Canonical tags | Present and correct |
| XML sitemaps | Present (27 pages, 5 posts), submitted in robots.txt |
| Page speed | Time to first byte 305 ms, page load 2.7 s, total weight 0.28 MB, 49 requests |
| Largest Contentful Paint | Fast — the hero image renders almost immediately |
| Mobile viewport | Present |
| Language tag | `en-AU` — correct |
| Title/description lengths | All within Google's display limits |
| Analytics | GA4 + GTM + Clarity all firing |

Your site is lighter and faster than most of your competitors. Speed is not why you're invisible.

---

## Priority 1 — Google Business Profile (highest impact by a wide margin)

Search "cash for cars Southport" on your phone. Above every website result there's a map with three businesses, their star ratings and a "Call" button. That's where the calls go. You are not there.

For a service like yours — urgent, local, phone-driven — the map pack typically captures the majority of clicks on mobile. No amount of website work substitutes for being in it.

### The complication you need to know about

Your footer lists your address as **20-B Bonemill Rd, Runcorn QLD 4113**. Runcorn is a southern suburb of Brisbane — about 59 km and a 40-minute drive from Southport. Every page on your site targets the Gold Coast.

Google's local rankings weight proximity between the business location and the searcher heavily. A Runcorn-registered business will struggle to appear for "cash for cars Surfers Paradise" no matter how well optimised the profile is.

Your options, honestly ranked:

**A. Register as a Service Area Business (do this regardless).** Google lets businesses that travel to customers hide their street address and declare a service area instead. Set your service area to the Gold Coast suburbs you actually cover. You'll rank best for searches physically closer to Runcorn — Logan, Springwood, Underwood, Slacks Creek, Beenleigh — and get some Gold Coast visibility, but you won't beat a Southport-based yard for Southport searches.

**B. Get a genuine Gold Coast presence.** A real, staffed location on the Gold Coast that you can verify. This is the only thing that makes you competitive for Gold Coast map searches. It's a business decision, not an SEO one — but be clear-eyed that without it, Gold Coast map rankings have a ceiling.

**C. Pivot your targeting to Logan/Brisbane South.** You already have Logan and Ipswich pages. Ranking #1 for "cash for cars Logan" is worth more than ranking #40 for "cash for cars Gold Coast." Consider whether "Gold Coast" is the right primary target at all given where you're based.

Do not create a fake Gold Coast address or use a mailbox — Google suspends profiles for this and recovery is slow and often unsuccessful.

### Setting it up

1. Go to google.com/business, create the profile, choose category **Auto Wrecker** (secondary: *Salvage Yard*, *Used Car Dealer*, *Towing Service*).
2. Choose "I deliver goods and services to my customers" → set service areas.
3. Verify — usually postcard or video. Video verification is common for service-area businesses; have signage, vehicles and equipment ready to film.
4. Fill in **everything**: hours, phone `0423 476 111`, website, services list, 20+ photos of actual vehicles, tow truck and staff. Profiles with photos get materially more engagement than those without.
5. Post weekly. Vehicles collected, prices paid, suburbs served. It's low effort and it's a ranking signal.

### Reviews — the part that decides everything

Reviews are the strongest lever you have and they cost nothing but discipline.

Every customer, at the moment you hand over the cash and they're happiest: send them a review link by SMS before you drive away. Not later. Later never happens.

Your competitors have dozens to hundreds of reviews. Getting to 25 genuine ones over three months would put you in the conversation. Reply to every single review, including negative ones — Google's own guidance says responding is a positive signal, and prospective customers read the replies.

**A note on review markup:** don't let anyone sell you "review stars in Google" via schema on your own site. Since 2019 Google has not displayed review snippets for self-serving reviews on `LocalBusiness` or `Organization` markup. The stars come from your Google Business Profile, not your website.

---

## Priority 2 — The duplicate suburb pages

This is the one actively holding the site down.

### What I measured

I crawled all 19 suburb pages under `/cash-for-cars/`, stripped navigation and footer, replaced each suburb name with a placeholder, and compared every possible pair of pages sentence by sentence:

- **Median overlap between any two pages: 45%** (mean 41%)
- **A third of all page pairs share 50% or more of their sentences**
- **Worst pair: Palm Beach vs Varsity Lakes — 93% identical**
- **Word counts: 18 of the 19 pages fall between 1,314 and 1,452 words**

That last figure is the tell. Nineteen pages about nineteen different places do not naturally all land within 140 words of each other. They were spun from one template.

Google's spam policies name this directly. Doorway pages are described as sites created to rank for near-identical queries that funnel users to the same destination — which is exactly what a set of near-identical suburb pages is. The penalty is site-wide, which is why even your homepage struggles.

### Two pages that shouldn't exist

- `/cash-for-cars/cash-for-cars-adelaide/` — Adelaide is 1,600 km away
- `/cash-for-cars/toowoomba/` — 130 km inland, nowhere near the Gold Coast

These tell Google your site isn't really about anywhere in particular, which weakens your claim to every location.

### What to do

**Option A — Consolidate (recommended, and much less work).** Keep 4–6 suburb pages where you genuinely have the most jobs. Redirect the rest with 301s to the most relevant remaining page. Delete the Adelaide page entirely. Fewer, stronger pages beat nineteen weak ones — and your top-ranking competitor's homepage is only 485 words, so page count clearly isn't what's winning in this niche.

**Option B — Genuinely rewrite each one.** Only worth it if the content is actually local. Each page needs things that could only be true of that suburb:

- Real jobs you've done there — "collected a 2009 Camry from Ferry Road last month, paid $1,150"
- Photos of your truck at recognisable local spots
- Local specifics: the streets you cover, typical response time from your depot, nearby landmarks
- Suburb-specific vehicle mix — Surfers has different stock than Mudgeeraba
- A named local testimonial

If you can't write 300 words about a suburb that couldn't be copy-pasted to another suburb, that page shouldn't exist.

I'd take Option A. It's faster, cheaper and safer.

---

## Priority 3 — Why nobody clicks even when you rank

I ran the searches your customers run. Here are the headline offers competitors put in their page titles, straight from the results:

| Site | Search | Headline offer |
|---|---|---|
| Ezy Cash for Cars | Southport | **Up to $19,999** |
| Prestige Car Removal | Gold Coast | Up to $13,000 |
| Cash for Car Gold Coast | Gold Coast | Up to $11,000 |
| **You** | both | **Up to $9,999** |

You are the lowest number on the page. Whether or not those figures are realistic, yours reads as the worst offer available. That alone explains a chunk of missing clicks.

You have three ways out:

1. **Compete on the number** — only if you can honestly pay it. Inflated claims generate calls you have to disappoint, which generates bad reviews, which costs more than the clicks are worth.
2. **Compete on a different axis** — this is the better play. "Paid in 24 hours", "Same-day pickup, cash on the spot", "Free rego cancellation handled for you", "Licensed QLD wrecker, 10+ years". Speed and trust beat a number nobody believes.
3. **Get reviews so stars appear next to your map listing** — the strongest click magnet available, and it comes free with Priority 1.

Rewrite your titles and meta descriptions around whichever angle is actually true. Right now every title on your site follows the same "Cash For Cars [Suburb] Up To $9999 | Free Car Removal" pattern — identical in structure to every competitor. There's nothing for a searcher to choose you on.

---

## Priority 4 — Trust and quality problems

These matter because Google evaluates sites on experience, expertise, authoritativeness and trust, and because real customers judge you the same way.

### Fix today (30 minutes total)

**Unfilled template text on a live page.** On `/sell-my-car-gold-coast/`, the FAQ reads:

> "Website name" will pay you anywhere from $50 to $9,999 for your car.

The placeholder was never replaced. This is on a page Google is currently indexing. Nothing says "template site" more loudly.

**COVID-19 section on the homepage.** Your homepage has a "Our Coronavirus (COVID-19) Guidelines" section in 2026. Delete it. It dates the site by six years.

**Broken robots.txt entries.** Five malformed lines like:

```
Disallow: /https://uniquecashforcars.com.au/]Car
Disallow: /https://uniquecashforcars.com.au/?source=about_page--------------------
```

These don't block anything real, so no damage is being done — but clean them out.

**Footer branding mismatch.** The copyright reads "Cash For Cars Gold Coast", not "Unique Cash For Cars". Google builds an understanding of your business identity from consistent naming; conflicting names across your site, your profile and directory listings weaken it. Pick one legal trading name and use it identically everywhere.

**Missing alt text.** 8 of 36 images on the homepage have no alt attribute. Quick fix, small gain, also an accessibility requirement.

### Fix this month

**No reviews or testimonials anywhere on the site.** People are handing a stranger their car for cash. There is nothing on the site that suggests anyone has ever done this successfully. Add real testimonials with first names and suburbs, and embed your Google reviews once you have them. This is for conversion, not for search rankings.

**No proof you're licensed.** You claim to be "a trustworthy and licensed business" on nearly every page but display no ABN, no QLD motor dealer or scrap metal dealer licence number, no photos of the yard, no named staff. An ABN in the footer and a licence number on the About page cost nothing and do real work.

**Nobody's name on the site.** No owner, no manager, no photos of humans. For a cash transaction with a stranger, that's a hard sell.

**Dead blog.** Four posts, one of which is titled "5 Best Luxury Eco-Friendly Cars In Australia 2020". Either publish or remove it — an abandoned blog signals an abandoned business.

---

## Priority 5 — Schema markup

You currently output `Organization` schema with only a name, URL and logo. No address, no coordinates, no hours, no service area.

Switch to `AutomotiveBusiness` (or `AutoDealer`) and include:

- Full `address` — street, suburb, state, postcode
- `geo` coordinates
- `openingHoursSpecification`
- `areaServed` — list your actual suburbs
- `telephone` matching your Google Business Profile exactly
- `sameAs` — Facebook and every directory listing

Your top-ranking competitor doesn't have this either, so it's a cheap edge. Yoast or Rank Math will generate most of it once you fill in the Local SEO settings; it doesn't need a developer.

Also add `FAQPage` schema to your existing FAQ sections — you already have the content, it just isn't marked up.

---

## Priority 6 — Content people actually search for

Once the duplicate problem is resolved, you're missing pages for genuinely high-intent queries:

- **"How much is my scrap car worth in QLD?"** — a real guide with real price ranges by vehicle type. This is the question people ask before they search for a buyer, and answering it honestly is how you get found early.
- **"How to cancel your rego in QLD after selling a car"** — practical, searched constantly, and positions you as the one who handles the annoying part.
- **"Do I need a roadworthy certificate to sell a damaged car in QLD?"** — high volume, high intent.
- **Brand pages** — "cash for Toyota", "cash for Hyundai". Lower competition than suburb pages, and people search this way.
- **"Car removal [suburb]"** as distinct from "cash for cars [suburb]" — different search, same customer.

One properly researched, genuinely useful page per month beats nineteen spun ones. And unlike suburb pages, this content earns links — which is the authority you're currently missing.

---

## Realistic expectations

The uncomfortable truth: "cash for cars Gold Coast" is one of the most saturated local search markets in Australia. I looked at your competitors — the one ranking #1 has a 485-word homepage with weaker markup than yours. They're not winning on page quality. They're winning on domain authority, backlinks, an exact-match domain and an established Google Business Profile.

That means:

- **Weeks 1–4:** Google Business Profile live and verified, quick fixes done, review requests running. First map-pack impressions.
- **Months 2–3:** Duplicate pages consolidated. Expect a temporary dip as Google reprocesses, then recovery. Reviews accumulating — this is where the phone starts moving.
- **Months 4–6:** Consolidated pages gaining traction. Genuine content earning its first links.
- **Beyond:** Organic rankings for "cash for cars Gold Coast" itself are a long game against entrenched competitors. Suburb-level and Logan/Brisbane-South terms are winnable much sooner.

The map pack and reviews will move the needle faster than anything you do to the website. If you only have time for one thing, do Priority 1.

---

## First 30 days

**Week 1**
- [ ] Check Search Console impressions vs clicks — settle which problem is bigger
- [ ] Remove the "Website name" placeholder from `/sell-my-car-gold-coast/`
- [ ] Delete the COVID-19 section from the homepage
- [ ] Clean up robots.txt
- [ ] Fix footer branding and add your ABN
- [ ] Start the Google Business Profile registration

**Week 2**
- [ ] Complete the profile: hours, services, 20+ real photos, service areas
- [ ] Set up an SMS review-request template and start using it on every job
- [ ] Add alt text to the 8 images missing it
- [ ] Add your licence number to the About page

**Week 3**
- [ ] Decide: consolidate suburb pages or rewrite them (recommend consolidate)
- [ ] Delete the Adelaide page, 301 redirect it
- [ ] Map out which 4–6 suburb pages survive and where the rest redirect

**Week 4**
- [ ] Implement the redirects
- [ ] Upgrade schema to `AutomotiveBusiness` with full address, hours and service area
- [ ] Rewrite homepage title and description around a differentiator that isn't the price
- [ ] Publish the first genuinely useful article — "How much is my scrap car worth in QLD?"

---

## Sources

- Live crawl of uniquecashforcars.com.au — 27 pages and 5 blog URLs, 28 July 2026
- [Google: Making Review Rich Results more helpful](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful) — self-serving review markup policy
- [Google: Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- Competitor analysis: [cashforcargoldcoast.com.au](https://cashforcargoldcoast.com.au/), [ezycashforcars.com.au](https://ezycashforcars.com.au/cash-for-cars-southport/), [prestigecarremoval.com.au](https://prestigecarremoval.com.au/cash-for-cars-gold-coast/), [1800salvage.com.au](https://www.1800salvage.com.au/cash-for-cars/gold-coast)
