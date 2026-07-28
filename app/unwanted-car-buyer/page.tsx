import type { Metadata } from "next";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Unwanted Car Buyer Gold Coast",
  description:
    "Sell an unwanted, damaged or non-running vehicle on the Gold Coast. Fast quotes and free collection when we buy your car.",
  alternates: { canonical: "/unwanted-car-buyer/" },
};

export default function UnwantedCarBuyerPage() {
  return (
    <InnerPage
      eyebrow="All conditions considered"
      title="A buyer for the car you no longer want."
      intro="Old, damaged, unused or too expensive to repair—tell us what you have and receive a straightforward, no-obligation offer."
    >
      <h2>Before you spend more on repairs</h2>
      <p>
        A vehicle can become uneconomical when registration, mechanical work and
        storage costs add up. Requesting an offer gives you another option to
        compare before committing more money.
      </p>

      <h2>We assess the whole vehicle</h2>
      <p>
        The price can be affected by model demand, running condition, body and
        mechanical damage, mileage, completeness and reusable parts. Clear
        photos and accurate details help us make a more useful first assessment.
      </p>
      <ul className="feature-list">
        <li>Old family cars</li>
        <li>Non-running vehicles</li>
        <li>Damaged cars</li>
        <li>Unwanted utes</li>
        <li>Vans and 4WDs</li>
        <li>Scrap vehicles</li>
      </ul>

      <h2>No private-sale routine</h2>
      <p>
        You do not need to create an advertisement, negotiate with multiple
        buyers or organise separate towing. If you accept the offer, we arrange
        collection and explain what is required to complete the sale.
      </p>
    </InnerPage>
  );
}
