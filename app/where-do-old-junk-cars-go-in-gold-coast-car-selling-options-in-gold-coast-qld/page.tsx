import type { Metadata } from "next";
import { ArticlePage } from "../components/ArticlePage";

export const metadata: Metadata = {
  title: "Where Old and Junk Cars Go on the Gold Coast",
  description: "Learn what can happen to an old vehicle after sale, from reuse and parts recovery to material recycling.",
  alternates: { canonical: "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld/" },
};

export default function OldCarGuide() {
  return (
    <ArticlePage
      title="Where old and junk cars go."
      intro="An end-of-life vehicle can still contain reusable parts and recyclable material. Its next step depends on condition, demand and safe processing."
    >
      <h2>Resale or repair</h2>
      <p>
        Some older vehicles are suitable for repair and resale. This depends on
        whether the work is economical and the vehicle can meet relevant
        requirements.
      </p>
      <h2>Parts recovery</h2>
      <p>
        Working engines, transmissions, panels, wheels and other components may
        be removed for reuse. Recovering serviceable parts can extend the life
        of other vehicles.
      </p>
      <h2>Material recycling</h2>
      <p>
        Fluids and hazardous components should be handled appropriately before
        metals and other recoverable materials are separated for recycling.
      </p>
      <h2>Before handing over the car</h2>
      <p>
        Remove personal property, keep a record of the transaction and complete
        the required ownership and registration steps for your circumstances.
      </p>
    </ArticlePage>
  );
}
