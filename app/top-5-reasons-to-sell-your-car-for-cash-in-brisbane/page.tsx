import type { Metadata } from "next";
import { ArticlePage } from "../components/ArticlePage";

export const metadata: Metadata = {
  title: "When a Direct Car Buyer May Suit You",
  description: "Five situations where a direct vehicle buyer may be more practical than a private listing.",
  alternates: { canonical: "/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/" },
};

export default function DirectBuyerGuide() {
  return (
    <ArticlePage
      title="When a direct car buyer may suit you."
      intro="A private sale may produce a different price, but convenience, timing and vehicle condition can make a direct buyer the more practical option."
    >
      <h2>1. The vehicle does not run</h2>
      <p>A buyer that arranges collection removes the need to organise separate towing.</p>
      <h2>2. Repairs are uneconomical</h2>
      <p>You can compare an as-is offer before investing further in an older vehicle.</p>
      <h2>3. You need a predictable timeframe</h2>
      <p>A booked collection can be easier to plan than waiting for private enquiries.</p>
      <h2>4. You want fewer inspections</h2>
      <p>Accurate details and photos can reduce the need for repeated viewings.</p>
      <h2>5. Convenience matters most</h2>
      <p>For some sellers, a simple transaction is worth more than managing a listing and negotiation.</p>
    </ArticlePage>
  );
}
