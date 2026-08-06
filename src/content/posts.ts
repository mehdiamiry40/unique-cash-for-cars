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
    slug: "how-much-is-my-scrap-car-worth-gold-coast",
    title: "How much is my scrap car worth on the Gold Coast?",
    description:
      "What a dismantler is actually paying for, the five things that move the number, and when scrapping is the wrong answer.",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 6,
  },
  {
    slug: "statutory-vs-repairable-write-off-queensland",
    title: "Statutory vs repairable write-off in Queensland",
    description:
      "Which classification you have decides whether the car can ever be driven again — and it changes the value less than most owners expect.",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 7,
  },
  {
    slug: "selling-a-car-with-finance-owing-queensland",
    title: "Selling a car with finance owing in Queensland",
    description:
      "You can sell an encumbered car. How the payout figure, the PPSR and negative equity actually work, and what delays a sale.",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 6,
  },
  {
    slug: "transferring-car-registration-in-queensland",
    title: "Transferring car registration in Queensland",
    description:
      "Who lodges what, when a safety certificate is required, and the three ownership situations that hold up a collection.",
    date: "2026-07-28",
    updated: "2026-08-06",
    readingMinutes: 6,
  },
  {
    slug: "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    title: "What to do with a damaged car on the Gold Coast",
    description:
      "Repair, claim, part out or sell — how to work out which option actually leaves you better off after an accident or a failed roadworthy.",
    date: "2024-06-18",
    updated: "2026-08-06",
    readingMinutes: 7,
  },
  {
    slug: "where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
    title: "Where do old junk cars go on the Gold Coast?",
    description:
      "What actually happens to a car after it leaves your driveway, and what each disposal route is worth to you.",
    date: "2024-03-12",
    readingMinutes: 6,
  },
  {
    slug: "5-best-luxury-eco-friendly-cars-in-australia-2020",
    title: "5 best luxury eco-friendly cars in Australia (2020)",
    description:
      "An archived look at the luxury hybrid and electric models available in Australia in 2020.",
    date: "2020-02-14",
    readingMinutes: 4,
    archived: true,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
