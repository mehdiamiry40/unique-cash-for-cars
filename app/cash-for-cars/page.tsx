import type { Metadata } from "next";
import Link from "next/link";
import { InnerPage } from "../components/InnerPage";
import { suburbs } from "../data/site";

export const metadata: Metadata = {
  title: "Cash for Cars Gold Coast Service Areas",
  description:
    "Free vehicle collection across Gold Coast suburbs when we buy your car. View our northern, central and southern service areas.",
  alternates: { canonical: "/cash-for-cars/" },
};

export default function AreasPage() {
  return (
    <InnerPage
      eyebrow="Gold Coast service area"
      title="Car pickup across the coast."
      intro="We plan daily collection routes through the northern, central and southern Gold Coast. Availability depends on your vehicle, access and requested time."
    >
      <h2 id="service-areas">Areas we regularly service</h2>
      <p>
        Choose your suburb below or call if your location is not listed. Nearby
        areas may still be available by arrangement.
      </p>
      <div className="area-index">
        {suburbs.map((suburb) => (
          <Link id={suburb.slug} key={suburb.slug} href="/contact-us/">
            {suburb.name}
          </Link>
        ))}
      </div>

      <h2>Northern Gold Coast</h2>
      <p>
        Helensvale, Pacific Pines, Upper Coomera, Labrador and surrounding
        suburbs are included in our regular northern route planning.
      </p>

      <h2>Central Gold Coast</h2>
      <p>
        We collect around Southport, Surfers Paradise, Ashmore, Carrara, Nerang,
        Robina, Varsity Lakes and Mermaid Waters.
      </p>

      <h2>Southern Gold Coast</h2>
      <p>
        Burleigh Heads, Palm Beach and nearby southern suburbs can request
        collection, including same-day options when the schedule allows.
      </p>
    </InnerPage>
  );
}
