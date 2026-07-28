import type { Metadata } from "next";
import { ArticlePage } from "../components/ArticlePage";

export const metadata: Metadata = {
  title: "What to Do With a Damaged Car on the Gold Coast",
  description: "Compare repair, insurance, private sale and direct-buyer options for a damaged vehicle on the Gold Coast.",
  alternates: { canonical: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/" },
};

export default function DamagedCarGuide() {
  return (
    <ArticlePage
      title="What to do with a damaged car."
      intro="Start by making the vehicle safe, documenting the damage and understanding whether insurance or finance affects what you can do next."
    >
      <h2>1. Make the vehicle safe</h2>
      <p>
        Do not drive a vehicle that may be unsafe. Move it only when lawful and
        practical, and use professional towing if steering, brakes, tyres or
        structural components are compromised.
      </p>
      <h2>2. Check insurance and ownership</h2>
      <p>
        If an insurer is involved, follow its assessment process before selling
        or dismantling the car. Confirm any finance or shared ownership before
        accepting an offer.
      </p>
      <h2>3. Compare repair cost with likely value</h2>
      <p>
        Ask for a written repair estimate and compare it with the vehicle’s
        likely value after repair. Include towing, storage, registration and
        unexpected work in the calculation.
      </p>
      <h2>4. Request a direct offer</h2>
      <p>
        A direct vehicle buyer can be useful when repairs are uneconomical or
        you want to avoid selling a damaged car privately. Be accurate about
        the damage and provide clear photos.
      </p>
    </ArticlePage>
  );
}
