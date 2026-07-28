# Full code and website audit — July 2026

Line-by-line review of every source file in this repository, plus the rendered
output of all 16 indexable pages served from a real production build.

**Scope.** All 44 files under `src/`, `scripts/`, `tests/`, both config layers,
`public/`, the CI workflow, the README, and the HTTP responses of a
`next build && next start` server. Findings are ordered by severity, and every
one below was reproduced against the running site — not inferred from source.

**Baseline: the build is healthy.** `typecheck`, `lint`, `check:urls`,
`check:duplication` and all 15 rendered-output tests pass on Next 16 with
Turbopack. `npm audit` reports 0 vulnerabilities. A scan of the full git
history found no committed secrets. What follows is what those checks do not
cover.

---

## Summary

| Severity | Count | Theme |
|---|---|---|
| High | 6 | Contrast failures, unstyled blog headings, misgrouped phone number, broken social image, unsubstantiated licence claims |
| Medium | 12 | Dead prerendered route, blind spot in the URL checker, API hardening, missing blog schema, font and image weight, README drift |
| Low | 12 | Dead code, unused assets, minor SEO and hygiene |

---

## Status

Every finding below has been actioned. Three did not end in a code change, and
those are recorded honestly rather than quietly marked done.

| # | Finding | Status |
|---|---|---|
| H1 | Blog `h1` renders at body size | **Fixed** — `prose-site h1` rule |
| H2 | Archived-post blockquote unstyled | **Fixed** — `prose-site blockquote` rule |
| H3 | Phone number misgrouped | **Fixed** — one source of truth, no hardcoded copies left |
| H4 | JPEG served as `image/png` | **Fixed** — renamed to `.jpg`, all references updated |
| H5 | Unsubstantiated licence claims | **Fixed by rewording** — needs the owner to supply ABN + licence number to restore the stronger copy |
| H6 | Brand red and ink-muted fail AA | **Fixed** — `#d75253→#c14142`, `#777→#696969`, `white/90→white` |
| M1 | Unreachable prerendered post | **Fixed** — file deleted, redirect kept |
| M2 | `check:urls` blind to config redirects | **Fixed** — reads `next.config.ts`, and now fails on shadowed routes |
| M3 | Rate-limiter map leaks | **Fixed** — sweep + tracked-IP ceiling |
| M4 | Body cap was header-only | **Fixed** — bounded streaming read |
| M5 | Honeypot named `website` | **Fixed** — renamed out of the autofill vocabulary |
| M6 | No Article/Breadcrumb on posts | **Fixed** — `BlogPosting` + `BreadcrumbList`, asserted in tests |
| M7 | 92 KB of fonts per page | **Fixed** — weight 300 dropped (−19 KB/page) |
| M8 | Images below display resolution | **Partly fixed — blocked on assets.** See below |
| M9 | No `aria-current` | **Fixed** |
| M10 | `aria-haspopup` without menu semantics | **Fixed** — attribute removed |
| M11 | README contradicts the code | **Fixed** — all five, plus the stale Next 15 note |
| M12 | Privacy policy overstates collection | **Fixed** — rewritten to match reality |
| L1-L6, L8, L9, L11, L12 | Dead code, assets, sitemap, `dynamicParams`, CSP/HSTS, title typo, `host:`, deps | **Fixed** |
| L7 | Interstate redirects → Gold Coast hub | **Reviewed, no change.** See below |
| L10 | Four footer `<h2>`s | **Reviewed, no change.** See below |
| — | Input borders at 1.26:1 (found while fixing H6) | **Fixed** — new `--color-field` at 3.23:1 |

### M8 — blocked on source assets

The six service-card images are 460×345, and that is the largest version that
exists anywhere in the repository: `public/wp-content/uploads/2022/09/` holds
only those and 300×225 thumbnails. `next/image` will not invent pixels, so a
2× phone still upscales them. What was fixable has been: the header logo now
declares its true intrinsic size (200×87 rather than 170×74), which stops
`next/image` advertising 256w and 384w candidates for a 200px file.

**The remaining fix is new photography**, not code. Until then the cards are
soft on high-DPI screens.

### L7 — reviewed, no change

`logan`, `ipswich` and `toowoomba` 301 to `/cash-for-cars`, whose copy is Gold
Coast-only. There is no better destination — the business no longer serves
those areas, and the alternatives are worse: a 404 throws away the inbound
links, and `/` is no more topically relevant. Left as-is deliberately. If
Search Console starts reporting these as soft 404s, the answer is to let them
404 rather than to redirect them somewhere else.

### L10 — reviewed, no change

The four footer headings are correct HTML, and removing them from the outline
would take away the landmarks screen-reader users rely on to navigate a footer.
The "chrome in the outline" concern is real but minor, and the fix is worse
than the finding.

---

## High

### H1. Blog post titles render at body-text size

`src/app/globals.css:68` defines `@utility prose-site` with rules for `p`, `ul`,
`ol`, `li`, `strong`, `a`, `h2` and `h3` — but **not `h1`**. Tailwind's preflight
resets all headings:

```css
h1,h2,h3,h4,h5,h6 { font-size: inherit; font-weight: inherit }
```

(confirmed in the built stylesheet, `.next/static/chunks/*.css`).

The three MDX posts open with `# Title`, which compiles to a bare `<h1>` with no
class. Verified on the running server:

```
/what-to-do-with-a-damaged-car-…    <h1>          ← no class
/where-do-old-junk-cars-go-…        <h1>          ← no class
/5-best-luxury-eco-friendly-cars-…  <h1>          ← no class
/  /cash-for-cars  /contact-us …    <h1 class="heading-xl mb-6">
```

So on all three blog posts the article title inherits `font-size: 1.0625rem`
and normal weight from `body` — visually identical to the paragraph beneath it.

**Fix:** add an `h1` rule to `prose-site` mirroring `heading-xl`.

### H2. The "Archived post" warning is invisible

`src/app/(posts)/5-best-luxury-eco-friendly-cars-in-australia-2020/page.mdx:26`
uses a blockquote to label the post as out of date. `prose-site` has no
`blockquote` rule and preflight zeroes its margin, so it renders as ordinary
prose (`<blockquote>` with no styling, confirmed in the response body).

The post's own comment block says the interim plan is "the clearly-labelled
archive below". It is not currently labelled in any way a reader would notice —
which leaves a six-year-old "best of 2020" list looking current, the one outcome
that file explicitly calls the bad choice.

### H3. The phone number is grouped wrongly on every page

`src/content/site.ts:20`

```ts
display: "042 347 6111",     // shown everywhere
e164:    "+61423476111",     // correct
```

`+61423476111` is the Australian mobile `0423 476 111`. The site renders it as
`042 347 6111`, which reads like a landline and is hard to dictate over the
phone.

The codebase already disagrees with itself: the API's own failure copy says
`0423 476 111` (`src/app/api/quote/route.ts:151` and `:190`), and
`tests/rendered-html.test.mjs:513` asserts that spelling. Meanwhile the
misgrouped form is baked into the contact page's meta description
(`src/app/contact-us/page.tsx:13`), so it also appears in search results.

This is the single most-repeated string on the site and the primary conversion
element — it appears in the header CTA, the mobile call bar, the footer, both
closing CTA bands and every location page.

**Fix:** `display: "0423 476 111"` in `site.ts`, and replace the two hardcoded
strings in `route.ts` with `site.phone.display`.

### H4. The social share image is a JPEG served as `image/png` under `nosniff`

`public/img/Best-Cash-for-Cars-Gold-Coast.png` contains JPEG bytes
(1920×800, verified by header inspection). Because the extension is `.png`,
Next serves it as:

```
Content-Type: image/png
X-Content-Type-Options: nosniff
Cache-Control: public, max-age=31536000, immutable
```

`src/lib/seo.ts:20` makes this file the default `og:image` and `twitter:image`
for **every page**. Social crawlers (Facebook, LinkedIn, X, Slack, WhatsApp)
fetch that URL directly rather than through `/_next/image`, and a MIME mismatch
combined with `nosniff` — which this site deliberately sets — is precisely the
case where a strict client refuses to render the image. The consequence is
link previews with no picture.

**Fix:** rename the file to `.jpg` and update `src/lib/seo.ts:20`, or re-encode
it as a real PNG. (`next/image` is unaffected either way — sharp sniffs content,
which is why the homepage hero still looks right.)

### H5. "Licensed" is claimed in four places with nothing to back it

| Location | Copy |
|---|---|
| `src/app/page.tsx:28` | "A licensed, insured Queensland business" |
| `src/app/page.tsx:183` | "is a licensed Queensland business" |
| `src/app/page.tsx:99` | "…when you sell to a licensed buyer" |
| `company-info…/page.tsx:14` | title: "Licensed QLD Vehicle Buyer" |

`src/content/site.ts:58-59` still has `abn: ""` and `licenceNumber: ""`, so the
footer block (`Footer.tsx:46-53`) and the About page credentials section
(`company-info…/page.tsx:85-107`) both render nothing.

Under Australian Consumer Law an unsubstantiated licensing representation is a
live exposure, and this is the exact credibility gap the rebuild was meant to
close — the README flags it at line 183 and it is still open.

**Fix:** fill in `abn` and `licenceNumber` (they render automatically), or soften
the four copy claims until you can.

### H6. Brand red fails WCAG AA as text *and* as a button background

Measured against the tokens in `src/app/globals.css:9-22`:

| Foreground | Background | Ratio | AA normal (4.5:1) |
|---|---|---|---|
| `--color-brand` `#d75253` | white | **4.02** | ✗ |
| `--color-brand` `#d75253` | `--color-surface-alt` `#f1f1f1` | **3.56** | ✗ |
| white | `--color-brand` `#d75253` | **4.02** | ✗ |
| white/90 | `--color-brand` | **3.56** | ✗ |
| `--color-ink-muted` `#777` | white | **4.48** | ✗ |
| `--color-ink-muted` `#777` | `#f1f1f1` | **3.96** | ✗ |
| `--color-brand-dark` `#b83f40` | white | 5.49 | ✓ |
| `--color-ink` `#4a4a4a` | white | 8.86 | ✓ |

The 3:1 "large text" allowance does not rescue the buttons: WCAG large text
starts at 18.66 px bold, and the CTAs are `text-base`/`text-lg` bold — 16 px and
18 px. Affected, non-decorative usages:

- **White on brand, below large-text size:** `ui.tsx:113` (`CallButton`,
  used on 9 pages), `MobileCallBar.tsx:18`, `Header.tsx:130`,
  `QuoteForm.tsx:69` and `:220`, `page.tsx:275`, `layout.tsx:65` (skip link).
- **Brand as text on white/grey:** `page.tsx:158`, `:194`, `:198`, `:254`;
  `[suburb]/page.tsx:86`, `:106`; `cash-for-cars/page.tsx:68`;
  `not-found.tsx:9`; `Header.tsx:80` and `:114`; `globals.css:89`
  (`prose-site a` — every inline link in every blog post).
- **`text-ink-muted`:** 15 usages including the footer copyright on grey
  (3.96:1, the worst on the site), blog dates, breadcrumbs, the contact page
  labels and the form's reassurance line.

`--color-brand-dark` already clears AA at 5.49:1. The lowest-risk fix keeps
`#d75253` for decorative fills and switches text-on-white and small-text button
fills to `brand-dark`, and darkens `--color-ink-muted` to roughly `#6b6b6b`
(4.5:1 on white) or `#666` (5.0:1, safe on both surfaces).

---

## Medium

### M1. A page is prerendered that can never be reached

The build output lists:

```
├ ○ /top-5-reasons-to-sell-your-car-for-cash-in-brisbane
```

but `next.config.ts:76-80` permanently redirects that exact path to `/blog`,
and redirects are evaluated before filesystem routes. The 48-line MDX file at
`src/app/(posts)/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/page.mdx`
is built on every deploy and served to nobody. It is also absent from
`src/content/posts.ts`, so it appears in neither the blog index nor the sitemap.

`tests/rendered-html.test.mjs:343` asserts the redirect, so retiring the post
looks intentional — in which case the MDX file should be deleted. If the
content is wanted (it is good, and it is the only page targeting Brisbane and
Logan), drop the redirect and add it to `posts.ts` instead. Right now it is
neither.

### M2. `check:urls` cannot see `next.config.ts` redirects

`scripts/check-urls.mjs:53-66` derives redirects by regex-parsing
`retiredSuburbRedirects` out of `src/content/suburbs.ts`. It never reads
`next.config.ts`. Two consequences:

- It reports `/top-5-reasons-to-sell-your-car-for-cash-in-brisbane` as a live
  **"static route"**. It is not — it 301s. A false green.
- Any legacy URL covered *only* by a `next.config.ts` redirect (`/feed`,
  `/sitemap_index.xml`, `/page-sitemap.xml`, `/post-sitemap.xml`) would be
  reported as a launch-breaking 404 if it were ever added to
  `legacy-urls.json`.

The README calls this script "the one that matters most", which makes the blind
spot worth closing — import the config, or assert redirects against a running
server the way the test suite does.

### M3. The rate limiter leaks memory

`src/app/api/quote/route.ts:30,68-74`

```ts
const recent = new Map<string, number[]>();
…
const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
hits.push(now);
recent.set(ip, hits);          // keys are never deleted
```

Every distinct IP adds a permanent key. On a warm serverless instance this grows
without bound. Prune entries whose window has emptied, or sweep the map on
write.

### M4. The body-size guard is trivially bypassed

`route.ts:84-87` trusts the `content-length` header. A chunked request omits it
entirely, and `await request.json()` then buffers whatever arrives. Low
severity — but the guard currently provides less protection than it appears to.

### M5. The honeypot can silently discard real enquiries

`QuoteForm.tsx:207` renders a hidden input named `website`; `route.ts:107`
returns `{ ok: true }` when it is filled, and the client then shows the full
success panel ("Thanks — we've got your details").

Password managers and browser autofill do populate fields named `website` /
`url`. When that happens a genuine customer sees a success message and their
enquiry is thrown away, with no trace anywhere. Rename the field to something
autofill does not recognise, and consider pairing it with a submission-timing
check.

### M6. Blog posts carry no `Article` and no `BreadcrumbList` schema

`src/content/posts.ts:17` documents `date` as "Used for sitemap lastmod and the
Article schema" — but no Article builder exists in `src/lib/schema.ts` and no
post emits one. `src/app/(posts)/layout.tsx:16-30` renders a visible
Home / Blog breadcrumb with no corresponding markup, and
`tests/rendered-html.test.mjs:71` codifies the omission by excluding posts from
the breadcrumb assertion. `Post.updated` is declared, never set and never read.

### M7. 92 KB of fonts preloaded on every page, one weight for one heading

`src/app/layout.tsx:21-32` declares five Open Sans weights; `next/font` emits a
high-priority `<link rel="preload">` for each on every page:

```
open_sans_latin_300  18,660 B
open_sans_latin_400  18,640 B
open_sans_latin_600  18,620 B
open_sans_latin_700  18,204 B
open_sans_latin_800  18,600 B
```

Weight 300 is used **once** in the entire codebase — the "Get Fast Enquiry"
heading at `QuoteForm.tsx:84`. Dropping it removes ~19 KB of render-priority
traffic from every page load; `font-semibold` (600, 8 usages) is also worth
reviewing against 700.

### M8. Card images are half the resolution they are displayed at

All six service-card images are 460×345:

```
accident-damaged-car.jpg  460x345   car-front-damaged.jpg      460x345
car-abandoned.jpg         460x345   unwanted-car-gold-coast.jpg 460x345
old-car-gold-coast.jpg    460x345   used-car-gold-coast.jpg     460x345
```

`src/app/page.tsx:221` requests `sizes="(max-width: 768px) 100vw, …"` — roughly
780 device pixels on a 390 px phone at DPR 2, and ~1170 at DPR 3. `next/image`
will not upscale past the source, so the browser does, and the cards are visibly
soft on every modern phone.

Same problem on the logo: `public/img/logo.jpg` is 200×87, rendered at `h-14`
(56 CSS px → 112 device px tall on a 2× screen) by `Header.tsx:53-60`, which
declares `width={170} height={74}`. The header logo is upscaled ~29% on retina.

### M9. No `aria-current` anywhere on the site

Verified across all 16 pages: zero occurrences. `Header.tsx:80` and `:114`
signal the active nav item with `text-brand` only. Colour alone is not a
sufficient indicator (WCAG 1.4.1), and assistive tech gets no "current page"
cue at all. Add `aria-current="page"` where `isActive(...)` is true.

### M10. `aria-haspopup="true"` promises a menu widget that is not implemented

`Header.tsx:75`. The attribute maps to `menu`, which tells assistive tech to
expect arrow-key navigation, `Home`/`End`, and roving focus. The dropdown is a
plain `<ul>` of links with none of that. Either drop the attribute — a
disclosure pattern with `aria-expanded`, which is already present and correct —
or implement the menu keyboard model.

### M11. The README contradicts the code in five places

| README | Reality |
|---|---|
| L17-19 "`public/img` currently holds **flat-colour placeholders**" | Real photographs since `5971668` |
| L57, L86 "the 13 retired location URLs" | **15** entries in `retiredSuburbRedirects` |
| L86, L137 "6 location pages" | **4** (`suburbs.ts`) |
| L104 "assets/ … incl. an 800×1000 portrait crop" | The file exists; nothing on the site references `public/assets/` at all |
| L180-181 "**form submissions are logged to the server console and otherwise discarded**" | `route.ts:147-155` returns **503** and delivers nothing |

The last one is the dangerous one: an owner reading it would believe leads are
being captured in logs while the form is unwired. The code's behaviour (refuse
rather than pretend) is correct; the README is wrong.

Also stale: L205-216's caveat that the build was only verified "under Next 15
with webpack". Next 16 + Turbopack builds clean here and passes all 15 tests.

### M12. The privacy policy describes analytics that do not exist

`src/app/privacy-policy/page.tsx:49-58` has an "Analytics and cookies" section
stating the site uses analytics tools and sets cookies. Grepping the rendered
homepage for `gtag|googletagmanager|analytics|clarity|hotjar|fbq` returns
nothing — the README confirms the tags were deliberately not carried over
(L226). A privacy policy that overstates collection is its own small compliance
problem. Either re-add the tags (README L226 lists this as a launch step) or
scope the section to what the site actually does. `Last updated` is also
hardcoded at `page.tsx:21`.

---

## Low

1. **Dead code** — `Button` (`ui.tsx:64-91`, never used), `Section` `tone="brand"`
   (`ui.tsx:35`, never used), `getPost` (`posts.ts:51`), `suburbSlugs`
   (`suburbs.ts:262` — `check-urls.mjs` re-derives it from source text rather
   than importing), `Post.updated` (`posts.ts:20`), `--color-brand-darker`
   (`globals.css:11`).
2. **Unused public assets** — `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
   `window.svg` are Next starter leftovers. `public/assets/` is unreferenced by
   any page: `hero-cash-for-cars-mobile.webp`, `unique-cash-logo.webp` and
   `video-poster.webp` have zero references, and `hero-cash-for-cars.webp` is
   referenced only by a cache-header assertion in the test suite. The hero
   actually renders `/img/Best-Cash-for-Cars-Gold-Coast.png`.
3. **The "Services" nav item never highlights** — `site.ts:82` sets
   `href: "#"`, so `Header.tsx:47` evaluates `pathname.startsWith("#")`, which
   is always false. The parent stays inactive on all three of its child pages.
4. **Duplicate work** — `text(body.fuel, 20)` is computed twice
   (`route.ts:133-135`).
5. **Sitemap `lastmod` is always "now"** — `sitemap.ts:30` stamps every static
   page with the build time, so all nine claim to have changed on every deploy.
   Use real content dates, as the post entries already do.
6. **`dynamicParams` is not disabled** on `/cash-for-cars/[suburb]`. Unknown
   slugs reach the server to produce a 404 rather than being rejected from the
   static manifest. `export const dynamicParams = false` makes junk crawls free.
7. **Interstate redirects land on a Gold Coast-only page** — `logan`,
   `ipswich` and `toowoomba` (`suburbs.ts:287-289`) 301 to `/cash-for-cars`,
   whose copy says "We collect across the Gold Coast." Google may read that
   relevance gap as a soft 404.
8. **No CSP.** `next.config.ts:79-92` sets four good headers but no
   `Content-Security-Policy`. Non-trivial here (inline JSON-LD plus Next's
   bootstrap scripts need nonces), so treat as a project rather than a tweak.
   `Strict-Transport-Security` is also absent from the config — Vercel normally
   adds it for custom domains, worth confirming on the live host.
9. **`$9999` vs `$9,999`** — the homepage `<title>` (`layout.tsx:37`,
   `page.tsx:22`) uses `$9999` and the misspelling **"Upto"**, while everything
   else uses `site.maxPayout` (`$9,999`). This is the highest-value string in
   the entire SERP footprint.
10. **Four navigational `<h2>`s in the footer** on every page
    (`Footer.tsx:27,57,72,87`) add chrome to every document outline.
11. **`robots.ts:27` emits `host:`** — a non-standard Yandex directive Google
    ignores. Harmless, but noise.
12. **Dependency freshness** — `npm audit` is clean; `react`/`react-dom`
    (19.2.4 → 19.2.8) and `postcss` (8.5.23 → 8.5.24) have patch updates.

---

## What is genuinely well built

Worth recording, because the failure modes above are cosmetic and fixable while
these are structural and hard to retrofit:

- **URL preservation is taken seriously and it works.** 32 legacy URLs, every
  one resolving or 301'ing, enforced by a script that runs in CI. Trailing-slash
  forms 308 correctly. `www` → apex is handled at the config layer and tested.
- **`src/lib/deploy.ts:19` gets the hard call right.** Excluding only when
  `VERCEL_ENV === "preview"`, rather than including only on `"production"`, is
  the direction that fails safe for a locally produced build — and the comment
  explains exactly why.
- **The doorway-page guard is real engineering.** `check-duplication.mjs`
  normalises place names before comparing, so it cannot be fooled by a
  find-and-replace. Current overlap: 0%.
- **The schema graph is correct** — one script tag per page, `@id` references
  that all resolve, no `aggregateRating`, no fabricated address or coordinates.
  The test suite verifies each of those properties rather than just parsing.
- **15 rendered-output tests against a live server**, including a second
  `VERCEL_ENV=preview` build to prove the noindex path. That is more rigour than
  most sites this size ever get.
- **No third-party requests at all.** Self-hosted fonts, no CDN, no tag
  managers. Security headers present, `x-powered-by` suppressed, no secrets in
  git history, no dependency vulnerabilities.

---

## Suggested order of work

1. **H3** phone number, **H4** OG image extension, **L9** title typo — three
   one-line edits with direct commercial impact.
2. **H1 + H2** — add `h1` and `blockquote` rules to `prose-site`. One CSS block,
   fixes three live pages.
3. **H6** contrast — a token change plus a mechanical class sweep.
4. **H5** — an owner decision: supply the ABN and licence number, or soften the
   claims.
5. **M1, M2, M11, M12** — reconcile the code with what the docs and the checker
   believe about it.
6. **M3-M5** — API hardening before the form is wired to a real inbox.
7. Everything else as capacity allows.

None of the above is a build blocker. The site ships and works today; this is
the list of what an owner would want fixed before spending money driving traffic
to it.
