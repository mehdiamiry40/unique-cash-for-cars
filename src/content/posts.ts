/**
 * Blog index.
 *
 * The posts carried over from WordPress kept their original root-level URLs —
 * changing them would throw away whatever links and rankings they have.
 * Each post lives at src/app/(posts)/<slug>/page.mdx.
 *
 * Note: the 2020 eco-cars post is badly dated. Options are to refresh it with
 * current models or to 301 it to a relevant page. Leaving a six-year-old
 * "best of 2020" list live is the worst of the three.
 *
 * REVIEW ANNUALLY — the write-off, registration-transfer and finance guides
 * describe Queensland regulatory processes. Those change. Each post carries a
 * caveat pointing readers at TMR or the PPSR as the authority, but a guide
 * that has quietly gone stale is worse for trust than no guide, and Google
 * treats obviously outdated advice content accordingly. When you revise one,
 * set `updated` — it feeds dateModified in the BlogPosting schema.
 */

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** Short, reader-facing topic label used on the guide hub. */
  category: string;
  /** Existing local asset used by the guide hub and Blog schema. */
  image: string;
  imageAlt: string;
  /** ISO date. Used for sitemap lastmod and the Article schema. */
  date: string;
  /** Set when the post has been meaningfully rewritten, not for typo fixes. */
  updated?: string;
  readingMinutes: number;
  /**
   * Kept for inbound links but excluded from the sitemap and flagged on the
   * blog index. Prefer a refresh or a 301 over leaving dated advice unmarked.
   */
  archived?: boolean;
};

export const posts: Post[] = [
  {
    slug: "sell-car-defect-notice-qld",
    title: "Selling a car with a defect notice in Queensland",
    description:
      "What major, minor and self-clearing notices allow, how a notice is cleared, and the two sale paths TMR describes if the repair is not worth doing.",
    category: "QLD paperwork",
    image: "/img/unwanted-car-gold-coast.jpg",
    imageAlt: "A car parked at a Gold Coast home after a roadside defect notice, waiting for its owner to decide on repair or sale",
    date: "2026-10-03",
    readingMinutes: 7,
  },
  {
    slug: "selling-nsw-registered-car-queensland",
    title: "Selling a NSW registered car in Queensland",
    description:
      "The sale is recorded with Service NSW, not TMR. How to lodge the notice from Queensland, cancel the NSW registration, and what the buyer must do next.",
    category: "QLD paperwork",
    image: "/img/used-car-gold-coast.jpg",
    imageAlt: "A used car parked at a Gold Coast home before its interstate registration is dealt with",
    date: "2026-09-29",
    readingMinutes: 7,
  },
  {
    slug: "blown-engine-repair-or-sell",
    title: "Blown engine: is it worth fixing or should you sell the car?",
    description:
      "Get the diagnosis in writing, check whether a dealer or workshop should pay, compare the repair options, then weigh the quote against what the car is worth.",
    category: "Selling options",
    image: "/img/old-car-gold-coast.jpg",
    imageAlt: "An older car with engine failure parked at a Gold Coast home while its owner weighs repair against sale",
    date: "2026-09-28",
    readingMinutes: 9,
  },
  {
    slug: "dead-hybrid-battery-repair-or-sell",
    title: "Dead hybrid battery: repair, replace or sell the car",
    description:
      "Check warranty and consumer-guarantee rights first, compare new, reconditioned and module repairs, then weigh the quote against what the car is worth.",
    category: "Selling options",
    image: "/img/unwanted-car-gold-coast.jpg",
    imageAlt: "A non-running car parked at a Gold Coast home while its owner decides whether to repair it",
    date: "2026-09-27",
    readingMinutes: 8,
  },
  {
    slug: "selling-car-personalised-plates-queensland",
    title: "Selling a car with personalised plates in Queensland",
    description:
      "Personalised plates belong to you, not the car. How to keep, transfer or cancel them before a sale, and why attached plates block an online transfer.",
    category: "QLD paperwork",
    image: "/img/used-car-gold-coast.jpg",
    imageAlt: "A used car on the Gold Coast before its plates are dealt with for sale",
    date: "2026-09-25",
    readingMinutes: 7,
  },
  {
    slug: "abandoned-car-private-property-queensland",
    title: "Abandoned Car on Private Property in Queensland: Your Options",
    description:
      "An abandoned car on private property in Queensland is not yours to sell. The four situations that decide who may move it, and the step that comes first.",
    category: "QLD paperwork",
    image: "/img/car-abandoned.jpg",
    imageAlt: "A long-abandoned car left parked on private property on the Gold Coast",
    date: "2026-09-22",
    readingMinutes: 7,
  },
  {
    slug: "unregistered-vehicle-permit-queensland",
    title: "Do you need an unregistered vehicle permit in Queensland?",
    description:
      "When TMR will and will not issue a permit, why the plates and the safety test rule out so many cars, and when towing is the simpler path.",
    category: "QLD paperwork",
    image: "/img/unwanted-car-gold-coast.jpg",
    imageAlt: "An unregistered car parked at a Gold Coast home before it is moved",
    date: "2026-09-18",
    readingMinutes: 7,
  },
  {
    slug: "deceased-estate-car-sale-queensland",
    title: "Selling a deceased estate car in Queensland",
    description:
      "Who holds the authority to sell, the TMR restriction that follows a death, and the order of steps that keeps a registration refund with the estate.",
    category: "QLD paperwork",
    image: "/img/used-car-gold-coast.jpg",
    imageAlt: "A used car parked at a Gold Coast home while its ownership paperwork is settled",
    date: "2026-09-17",
    readingMinutes: 7,
  },
  {
    slug: "selling-car-with-lpg-queensland",
    title: "Selling a Car With LPG in Queensland: Gas Certificate Rules",
    description:
      "Selling a car with LPG in Queensland adds one certificate most sellers miss. When it is required, what an out-of-date cylinder changes, and your options.",
    category: "QLD paperwork",
    image: "/img/used-car-gold-coast.jpg",
    imageAlt: "A used car being prepared for sale on the Gold Coast",
    date: "2026-09-16",
    readingMinutes: 6,
  },
  {
    slug: "sell-car-without-roadworthy-qld",
    title: "Can you sell a car without a roadworthy in Queensland?",
    description:
      "When a Queensland safety certificate is required, when it is not, and the lawful sale paths for an unregistered, damaged or dealer-traded car.",
    category: "QLD paperwork",
    image: "/wp-content/uploads/2020/01/cash-for-cars.jpg",
    imageAlt: "Close view of a car ready for a Queensland sale and roadworthy check",
    date: "2026-08-13",
    readingMinutes: 6,
  },
  {
    slug: "cancel-car-registration-queensland-after-sale",
    title: "How to cancel car registration in Queensland after a sale",
    description:
      "A practical TMR-based checklist for cancelling Queensland registration, surrendering plates and claiming an eligible refund after a vehicle sale.",
    category: "QLD paperwork",
    image: "/wp-content/uploads/2022/10/receive-cash-for-cars.jpg",
    imageAlt: "A vehicle owner completing the handover after selling a car",
    date: "2026-08-13",
    readingMinutes: 6,
  },
  {
    slug: "how-much-is-my-scrap-car-worth-gold-coast",
    title: "How much is my scrap car worth on the Gold Coast?",
    description:
      "What a dismantler is actually paying for, the five things that move the number, and when scrapping is the wrong answer.",
    category: "Car value",
    image: "/img/old-car-gold-coast.jpg",
    imageAlt: "An old car awaiting valuation and removal on the Gold Coast",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 6,
  },
  {
    slug: "statutory-vs-repairable-write-off-queensland",
    title: "Statutory vs repairable write-off in Queensland",
    description:
      "Which classification you have decides whether the car can ever be driven again — and it changes the value less than most owners expect.",
    category: "Write-offs",
    image: "/img/car-front-damaged.jpg",
    imageAlt: "A car with severe front-end damage after a collision",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 7,
  },
  {
    slug: "selling-a-car-with-finance-owing-queensland",
    title: "Selling a car with finance owing in Queensland",
    description:
      "You can sell an encumbered car. How the payout figure, the PPSR and negative equity actually work, and what delays a sale.",
    category: "Selling options",
    image: "/img/Best-Cash-for-Cars-Gold-Coast.jpg",
    imageAlt: "Several vehicles and Australian cash representing a financed car sale",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 6,
  },
  {
    slug: "transferring-car-registration-in-queensland",
    title: "Transferring car registration in Queensland",
    description:
      "Who lodges what, when a safety certificate is required, and the three ownership situations that hold up a collection.",
    category: "QLD paperwork",
    image: "/wp-content/uploads/2022/10/truck-removing-car.jpg",
    imageAlt: "A vehicle being collected after its ownership paperwork is completed",
    date: "2026-07-28",
    updated: "2026-08-13",
    readingMinutes: 6,
  },
  {
    slug: "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    title: "What to do with a damaged car on the Gold Coast",
    description:
      "Repair, claim, part out or sell — how to work out which option actually leaves you better off after an accident or a failed roadworthy.",
    category: "Damaged cars",
    image: "/img/accident-damaged-car.jpg",
    imageAlt: "An accident-damaged car waiting to be assessed on the Gold Coast",
    date: "2024-06-18",
    updated: "2026-08-06",
    readingMinutes: 7,
  },
  {
    slug: "where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
    title: "Where do old junk cars go on the Gold Coast?",
    description:
      "What actually happens to a car after it leaves your driveway, and what each disposal route is worth to you.",
    category: "Car recycling",
    image: "/img/car-abandoned.jpg",
    imageAlt: "An end-of-life car ready for dismantling and recycling",
    date: "2024-03-12",
    readingMinutes: 6,
  },
  {
    slug: "5-best-luxury-eco-friendly-cars-in-australia-2020",
    title: "5 best luxury eco-friendly cars in Australia (2020)",
    description:
      "An archived look at the luxury hybrid and electric models available in Australia in 2020.",
    category: "Archived",
    image: "/wp-content/uploads/2020/09/Luxury-cars-Australia.jpeg",
    imageAlt: "A luxury car from the Australian market in 2020",
    date: "2020-02-14",
    readingMinutes: 4,
    archived: true,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
