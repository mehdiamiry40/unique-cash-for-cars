# Skills audit — SEO + frontend design

**Date:** 31 July 2026  
**Skills used (from [skills.sh](https://skills.sh)):**

| Skill | Source |
|---|---|
| `seo` | [addyosmani/web-quality-skills](https://www.skills.sh/addyosmani/web-quality-skills/seo) |
| `frontend-design` | [anthropics/skills](https://www.skills.sh/anthropics/skills/frontend-design) |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines) |

This is a code-level audit of the Next.js rebuild. Off-site items (Google Business Profile, backlinks) from `docs/seo-audit-uniquecashforcars.md` still apply and are not repeated here.

---

## SEO skill checklist

### Critical — pass

| Check | Status |
|---|---|
| HTTPS | Pass (HSTS in `next.config.ts`) |
| robots.txt allows crawling | Pass (`src/app/robots.ts`); preview builds disallow all |
| No `noindex` on important pages | Pass (`isSearchVisible`) |
| Title tags present and unique | Pass (asserted in tests) |
| Single `<h1>` per page | Pass (asserted in tests) |

### High priority — pass / note

| Check | Status |
|---|---|
| Meta descriptions present | Pass; unique per page (asserted) |
| Sitemap | Pass; posts carry real `lastmod`; static pages omit fake timestamps (correct) |
| Canonical URLs | Pass via `pageMeta()` |
| Mobile-responsive | Pass (`viewport` default + mobile call bar) |
| Core Web Vitals | Strong baseline (light page, priority hero, self-hosted fonts) |

### Medium priority

| Check | Status | Notes |
|---|---|---|
| Structured data | Pass | `AutomotiveBusiness`, `WebSite`, `FAQPage`, `Service`, `BreadcrumbList`, `BlogPosting` |
| Internal linking | Pass | Suburb hub, footer, further reading |
| Image alt text | Mostly pass | Hero decorative `alt=""` is intentional; service cards descriptive |
| Descriptive URLs | Pass | Legacy WP paths preserved |
| Breadcrumb navigation | Pass | Visible + schema on inner pages |

### AI search visibility (skill § AI search)

| Check | Status |
|---|---|
| AI crawlers not blanket-blocked | Pass |
| FAQ / Article schema for extractability | Pass |
| Self-contained first-paragraph answers | Strong on FAQs and How-it-works |
| `llms.txt` | **Added** — speculative index at `/llms.txt` |

### Still owner-side (not code)

1. Google Business Profile (map pack) — highest revenue impact  
2. Fill `site.abn` and `site.licenceNumber`  
3. Real suburb testimonials  
4. GA4 / GTM / Clarity wiring if required for launch  
5. Higher-res service photography (cards are 460×345)

### SERP snippet opportunity

Homepage description was keyword-led and thin on CTA. Updated to lead with the offer mechanic (firm quote in a minute) while keeping payout + free towing + brand.

---

## Frontend-design skill critique

**Subject:** Local cash-for-cars buyer on the Gold Coast.  
**Audience:** Someone next to a car they want gone — mobile, urgent, phone-first.  
**Page job:** Get a call or quote submission.

### What already works

- Conversion-first layout (phone CTA + quote form above the fold)
- Real local photography, not stock collage
- Brand red is distinctive and AA-compliant after the earlier contrast fix
- Process numbering (01–03) is justified — order carries meaning

### Gaps vs skill / design brief (within existing WP brand system)

| Gap | Finding | Action this pass |
|---|---|---|
| Brand in hero | Eyebrow was generic (“Sell your car fast with”); brand lived only in the logo | Brand name is now the hero eyebrow |
| Typography | Single Open Sans stack — correct for WP fidelity; not expressive | Kept (design-system exception); added `text-pretty` on headings |
| Motion | Only hover colour transitions | Subtle hero entrance + form settle; reduced-motion respected |
| Atmosphere | Flat white / grey bands below hero | Left as brand system; hero image remains the visual plane |
| Cards | Service / process cards match WP | Left — they group interactive destination links and process steps |

**Signature kept:** phone number as the primary visual CTA, quote form as the secondary conversion surface. Boldness stays there; surrounding chrome stays quiet.

---

## Web Interface Guidelines findings

### Fixed this pass

```text
## src/app/globals.css
globals.css - headings lacked text-wrap:pretty
globals.css - no touch-action:manipulation on interactive hit targets
globals.css - no shared :focus-visible treatment for links/buttons
globals.css - missing color-scheme:light for native controls

## src/components/QuoteForm.tsx
QuoteForm.tsx - focus used :focus not :focus-visible
QuoteForm.tsx - email missing spellCheck={false}
QuoteForm.tsx - placeholders lacked … / example patterns
QuoteForm.tsx - success CTA missing focus-visible ring
QuoteForm.tsx - submit button missing focus-visible ring

## src/components/Header.tsx
Header.tsx - nav links/buttons missing focus-visible rings
Header.tsx - mobile menu chevron SVG missing aria-hidden
Header.tsx - call CTA missing focus-visible

## src/components/MobileCallBar.tsx
MobileCallBar.tsx - fixed bar links missing focus-visible

## src/components/Footer.tsx
Footer.tsx - links missing focus-visible

## src/components/ui.tsx
ui.tsx - SectionHeading missing text-pretty (via heading utilities)

## src/components/FaqAccordion.tsx
FaqAccordion.tsx - summary missing focus-visible ring
```

### Pass / intentional

```text
## Accessibility
✓ Skip link present
✓ Semantic header/main/footer/nav
✓ Form labels (sr-only) + radio fieldset
✓ Icon-only menu button has aria-label
✓ Decorative icons aria-hidden
✓ prefers-reduced-motion kill-switch
✓ Images with dimensions / fill + sizes
✓ Hero priority; below-fold Image defaults to lazy

## Forms
✓ autocomplete + correct input types
✓ Honeypot named outside autofill vocabulary
✓ Errors with role="alert"
✓ Submit disables only while submitting; "Sending…"

## Anti-patterns
✓ No outline-none without replacement (CallButton already had focus-visible)
✓ No transition:all
✓ No user-scalable=no
```

---

## Priority after this PR

1. Owner: GBP + ABN/licence + testimonials  
2. New service photography at ≥920px wide  
3. Optional later: stronger display type pairing if brand refresh is approved (would leave WP fidelity)
