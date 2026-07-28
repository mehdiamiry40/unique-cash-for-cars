/**
 * Blog index.
 *
 * The four posts below kept their original root-level URLs from WordPress —
 * changing them would throw away whatever links and rankings they have.
 * Each lives at src/app/(posts)/<slug>/page.mdx.
 *
 * Note: the 2020 eco-cars post is badly dated. Options are to refresh it with
 * current models or to 301 it to a relevant page. Leaving a six-year-old
 * "best of 2020" list live is the worst of the three.
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
};

export const posts: Post[] = [
  {
    slug: "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    title: "What to do with a damaged car on the Gold Coast",
    description:
      "Repair, claim, part out or sell — how to work out which option actually leaves you better off after an accident or a failed roadworthy.",
    date: "2024-06-18",
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
    slug: "top-5-reasons-to-sell-your-car-for-cash-in-brisbane",
    title: "Five reasons to sell your car for cash in Brisbane",
    description:
      "When a cash sale beats a private listing, and when it doesn't. An honest comparison.",
    date: "2023-08-02",
    readingMinutes: 5,
  },
  {
    slug: "5-best-luxury-eco-friendly-cars-in-australia-2020",
    title: "5 best luxury eco-friendly cars in Australia (2020)",
    description:
      "An archived look at the luxury hybrid and electric models available in Australia in 2020.",
    date: "2020-02-14",
    readingMinutes: 4,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
