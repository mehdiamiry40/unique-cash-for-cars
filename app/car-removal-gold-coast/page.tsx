import type { Metadata } from "next";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Free Car Removal Gold Coast",
  description:
    "Free car removal across the Gold Coast when we buy your vehicle. Running and non-running cars considered, with same-day options.",
  alternates: { canonical: "/car-removal-gold-coast/" },
};

export default function CarRemovalPage() {
  return (
    <InnerPage
      eyebrow="Free vehicle collection"
      title="Car removal across the Gold Coast."
      intro="If we buy your car, collection is included. We arrange the tow, explain the paperwork and collect from an accessible home, workplace or repairer."
    >
      <h2>No separate towing bill</h2>
      <p>
        Collection within our Gold Coast service area is part of the agreed
        vehicle purchase. Let us know whether the car rolls, steers and has all
        four wheels so the right equipment can be scheduled.
      </p>

      <h2>What we need to know</h2>
      <ul>
        <li>The exact pickup suburb and where the vehicle is parked.</li>
        <li>Whether a tow truck can safely access the driveway or car park.</li>
        <li>Whether the vehicle starts, rolls, steers and brakes.</li>
        <li>Any missing wheels, keys or major parts.</li>
      </ul>

      <h2>Same-day pickup options</h2>
      <p>
        Same-day collection is often possible when you call early, but it
        depends on the suburb, vehicle access and the day’s route. We will
        provide an available window before confirming the booking.
      </p>

      <h2>Responsible next steps</h2>
      <p>
        Depending on its condition, a purchased vehicle may be resold,
        dismantled for reusable parts or sent for material recycling. Our aim is
        to recover useful value before the remainder is processed.
      </p>
    </InnerPage>
  );
}
