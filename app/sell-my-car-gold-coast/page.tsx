import type { Metadata } from "next";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Sell My Car Gold Coast",
  description:
    "Sell your car on the Gold Coast without private listings or towing costs. Get a fast offer and book free vehicle collection.",
  alternates: { canonical: "/sell-my-car-gold-coast/" },
};

export default function SellMyCarPage() {
  return (
    <InnerPage
      eyebrow="A simpler vehicle sale"
      title="Sell your car on the Gold Coast."
      intro="Avoid listings, repeated inspections and uncertain buyers. Share the vehicle details, consider the offer and choose a pickup time that suits you."
    >
      <h2>A clear process from the first call</h2>
      <p>
        Start with the vehicle’s year, make, model, condition and pickup suburb.
        Those details help us assess demand, reusable parts and likely transport
        requirements before discussing an offer.
      </p>
      <ol>
        <li><strong>Request a quote.</strong> Call, text or use the short form.</li>
        <li><strong>Review the offer.</strong> There is no obligation to accept.</li>
        <li><strong>Choose a pickup.</strong> Same-day availability depends on location and schedule.</li>
        <li><strong>Complete the sale.</strong> Confirm your identity and authority to sell the vehicle.</li>
      </ol>

      <h2>Vehicles in every kind of condition</h2>
      <p>
        We consider daily drivers, older family cars, work utes, vans, 4WDs,
        accident-damaged vehicles and cars that no longer start. You do not need
        to repair or detail the vehicle before requesting an offer.
      </p>
      <ul className="feature-list">
        <li>Running vehicles</li>
        <li>Mechanical faults</li>
        <li>Accident damage</li>
        <li>Expired registration</li>
        <li>Older cars</li>
        <li>Unwanted work vehicles</li>
      </ul>

      <h2>Prepare for pickup</h2>
      <p>
        Remove personal belongings, locate your keys and have photo ID ready.
        If finance, shared ownership or another claim applies to the vehicle,
        disclose it before booking so the correct paperwork can be confirmed.
      </p>
    </InnerPage>
  );
}
