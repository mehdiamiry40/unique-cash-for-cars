import type { Metadata } from "next";
import Link from "next/link";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Car Selling Guides",
  description: "Practical guides for selling damaged, unwanted and older vehicles in Queensland.",
  alternates: { canonical: "/blog/" },
};

const articles = [
  {
    href: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/",
    title: "What to do with a damaged car on the Gold Coast",
  },
  {
    href: "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld/",
    title: "Where old and junk cars go after they are sold",
  },
  {
    href: "/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/",
    title: "When a direct car buyer may suit you",
  },
  {
    href: "/5-best-luxury-eco-friendly-cars-in-australia-2020/",
    title: "Understanding lower-emission vehicle choices",
  },
];

export default function BlogPage() {
  return (
    <InnerPage
      eyebrow="Practical vehicle guides"
      title="Useful answers for car owners."
      intro="Clear information about damaged vehicles, selling options, pickup preparation and responsible end-of-life processing."
      showQuote={false}
    >
      <div className="area-index">
        {articles.map((article) => (
          <Link key={article.href} href={article.href}>{article.title}</Link>
        ))}
      </div>
    </InnerPage>
  );
}
