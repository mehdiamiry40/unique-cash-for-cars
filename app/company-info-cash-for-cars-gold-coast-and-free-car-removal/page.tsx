import type { Metadata } from "next";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "About Unique Cash for Cars",
  description:
    "Learn how Unique Cash for Cars helps Gold Coast vehicle owners sell unwanted, damaged and older cars with free collection.",
  alternates: {
    canonical:
      "/company-info-cash-for-cars-gold-coast-and-free-car-removal/",
  },
};

export default function AboutPage() {
  return (
    <InnerPage
      eyebrow="About Unique Cash for Cars"
      title="Local service without the sales theatre."
      intro="We help Gold Coast vehicle owners move on from cars they no longer need through clear offers, practical collection and straightforward communication."
    >
      <h2>What we do</h2>
      <p>
        Unique Cash for Cars buys vehicles in a wide range of conditions. Our
        service is designed for people who value speed and convenience over the
        uncertainty of a private listing.
      </p>

      <h2>What you can expect</h2>
      <ul>
        <li>A no-obligation conversation about your vehicle.</li>
        <li>An offer based on the details and current market factors.</li>
        <li>Free collection when we buy within the agreed service area.</li>
        <li>Clear instructions about identification and paperwork.</li>
      </ul>

      <h2>Our service standard</h2>
      <p>
        We ask customers to provide accurate vehicle and access information, and
        we aim to be equally clear about the offer, collection timing and next
        steps. If something changes before pickup, call us so the booking can be
        updated.
      </p>
    </InnerPage>
  );
}
