import type { Faq } from "@/lib/schema";
import { site } from "@/content/site";
import { suburbPath } from "@/content/suburbs";
import { openingHoursPhrase } from "@/lib/hours";

/**
 * The site has two commercial pillars:
 *
 *   /                        Cash For Cars Gold Coast
 *   /car-removal-gold-coast  Car Removal Gold Coast
 *
 * The homepage is authored directly. This file holds the removal pillar only.
 * /sell-my-car-gold-coast is its own page for the seller's preparation
 * questions. Unwanted-car and wrecker URLs still redirect into the closest
 * pillar so those signals are not split across lookalike commercial pages.
 *
 * Division of labour. The homepage speaks as the buyer: who is buying, how the
 * offer is worked out, how payment is confirmed. This page is about the
 * collection: what free removal covers, where a truck can load from, cars that
 * will not move, what to have ready and how the pickup is timed. It links back
 * to the homepage for the offer and to /sell-my-car-gold-coast for paperwork,
 * so the three pages do not answer each other's query.
 */

/** A run of text, or a link, inside a paragraph or list item. */
export type Inline = string | { text: string; href: string };

/** A paragraph or list item: plain text, or text with links in it. */
export type RichText = string | readonly Inline[];

export type ServicePage = {
  slug: string;
  /** At most 60 characters. Only this page may use its exact query here. */
  title: string;
  /** At most 155 characters. Also the Service description in the schema. */
  metaDescription: string;
  h1: string;
  intro: string;
  /** Short points under the intro. Each must be true without the others. */
  highlights?: string[];
  serviceType: string;
  sections: { heading: string; body: RichText[]; list?: RichText[] }[];
  /** Plain strings: the same text is shown and marked up as FAQPage. */
  faqs: Faq[];
  related?: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "car-removal-gold-coast",
    title: "Car Removal Gold Coast | Free Pickup + Offer for Your Car",
    metaDescription:
      "Free car removal across the Gold Coast from driveways, basements, roadsides and yards. Same-day pickup may be available, with the offer confirmed first.",
    h1: "Car Removal Gold Coast",
    serviceType: "Car Removal Gold Coast",
    intro:
      "We remove cars across the Gold Coast at no charge when we buy them. Tell us what the vehicle is, where it is parked and what is in the way. We quote the car, then confirm the loading plan and the pickup window before a truck is sent.",
    highlights: [
      "No callout fee or towing charge for a vehicle we agree to buy",
      "Cars that do not start, roll or steer can still be assessed",
      "Driveways, basements, roadsides, yards and gated estates",
      "Offer, payment method and pickup window confirmed before dispatch",
    ],
    sections: [
      {
        heading: "What free car removal means here",
        body: [
          "For a vehicle we agree to buy inside the confirmed Gold Coast service area, there is no callout fee and no towing charge. Nothing is deducted from the offer for the tow.",
          "That is different from booking an ordinary tow, where you pay to have a car moved. Here the removal is part of a purchase, so it starts with a quote for the vehicle. The offer applies when the vehicle, its condition and completeness, the pickup location and the access match what you described. If something material is different, we talk to you before the sale goes ahead.",
          [
            "This page is about the collection. Who the buyer is and how the offer is worked out are covered on our ",
            { text: "cash for cars Gold Coast", href: "/" },
            " page.",
          ],
        ],
      },
      {
        heading: "Car removals from driveways, basements, roadsides and yards",
        body: [
          "Where the car sits decides how it is loaded. When you ask for a quote, tell us which of these describes yours and the detail that goes with it.",
        ],
        list: [
          "Driveways and garages: whether the car is nose-in, what is parked behind it, and how much room there is in front of the garage.",
          "Basement and podium carparks: the building name, the parking level and the signed clearance height, plus any loading dock booking or visitor pass. A car under a low clearance bar may have to be winched to street level before it is loaded.",
          "Kerbsides and roadsides: the street, the nearest side street or driveway, and anything that limits where a truck can stop.",
          "Yards, sheds and acreage: the surface and length of the track, and whether it has been wet. A loaded truck can bog where an empty one drove in.",
          "Gated estates and complexes: how visitors get through the gate, and any body corporate rules about trucks.",
          "Repairers and storage yards: who can release the car, and when the site is open.",
        ],
      },
      {
        heading: "Cars that do not start, roll or steer",
        body: [
          "A vehicle does not need to start, drive or pass a safety inspection for us to assess it. A non-running car can usually be winched onto the truck. One with seized brakes, flat tyres, missing wheels or locked steering may need skates or different loading equipment.",
          "Before the truck is sent, tell us whether the wheels turn, whether the steering is free, whether the tyres hold air and whether you have the keys. The right recovery setup can then be sent the first time.",
        ],
      },
      {
        heading: "Vehicles we remove",
        body: [
          "We quote the specific vehicle and what can be recovered from it. There is no single flat scrap rate.",
        ],
        list: [
          "Old and unwanted cars that are no longer driven",
          "Non-runners with engine, gearbox, electrical or battery faults",
          "Accident, hail and flood-damaged vehicles, and insurance write-offs",
          "Unregistered cars, and cars that will not pass a safety inspection",
          "Unfinished projects and vehicles with parts missing",
          "Utes, vans, 4WDs, SUVs and light commercial vehicles",
        ],
      },
      {
        heading: "Access changes from suburb to suburb",
        body: [
          "The same car is a different job in a tower basement than on an acreage block. Each of these pages sets out what to tell us about access in that part of the Gold Coast.",
        ],
        /*
         * One line per suburb page, each naming the access problem that page
         * is actually about. Not a list of identical blurbs: if a line could be
         * moved to another suburb, it does not belong here.
         */
        list: [
          [
            { text: "Southport unit blocks and light rail streets", href: suburbPath("southport") },
            ": clearance bars in basement carparks, and where a truck can stop beside the corridor.",
          ],
          [
            { text: "Surfers Paradise tower basements", href: suburbPath("surfers-paradise") },
            ": signed height limits, loading dock bookings and visitor passes.",
          ],
          [
            { text: "Robina driveways and townhouse complexes", href: suburbPath("robina") },
            ": cars parked nose-in in a garage, and shared internal roads.",
          ],
          [
            { text: "Burleigh Heads headland streets", href: suburbPath("burleigh-heads") },
            ": narrow or steep streets near the national park, and undercroft parking along the highway.",
          ],
          [
            { text: "Labrador's older streets", href: suburbPath("labrador") },
            ": cars that have stood for years, and who has authority to sell them.",
          ],
          [
            { text: "Nerang acreage, sheds and work yards", href: suburbPath("nerang") },
            ": unsealed tracks, soft ground after rain and vehicles boxed in at a yard.",
          ],
          [
            { text: "Helensvale gated estates", href: suburbPath("helensvale") },
            ": boom gates, resident codes and body corporate conditions for trucks.",
          ],
          [
            { text: "Mermaid Waters canal streets", href: suburbPath("mermaid-waters") },
            ": tight cul-de-sacs, and cars parked behind a boat or trailer.",
          ],
        ],
      },
      {
        heading: "What to have ready on the day",
        body: [
          "We have to confirm that the person selling the vehicle has lawful authority to sell it, so the owner or an authorised person normally needs to be there with identification.",
          "The registration path depends on what happens to the car next. Queensland requires a registered vehicle sold for parts to be de-registered first, so check the current Transport and Main Roads process before collection.",
          [
            "A registration in someone else's name, finance still owing and personalised plates each take a step of their own. Our ",
            { text: "sell my car Gold Coast", href: "/sell-my-car-gold-coast" },
            " checklist goes through the paperwork in order.",
          ],
        ],
        list: [
          "Photo identification for the owner or authorised seller",
          "Proof of ownership and the current registration status",
          "A payout letter from the lender if money is still owing",
          "Keys if you have them, plus any gate codes, dock bookings or access instructions",
          "Number plates, where Transport and Main Roads requires them to be returned or kept",
          "Personal belongings taken out, including anything under the seats",
        ],
      },
      {
        heading: "Same-day car removal when the route allows",
        body: [
          "Same-day pickup may be available when the route, the access and the paperwork allow it. Truck availability, distance, the loading equipment the car needs and whether the ownership paperwork is ready all affect the window.",
          `We are open ${openingHoursPhrase()}. Calling early in the day with the vehicle details, the address and the access notes gives the best chance of an early window. We confirm the pickup time, the offer and the payment method before collection.`,
        ],
      },
      {
        heading: "How this differs from a tow truck or a car wrecker",
        body: [
          "A tow truck moves a car for a fee, and the car is still yours afterwards. A removal through us is a sale: we buy the vehicle and the tow is included.",
          "Many people looking for car wreckers on the Gold Coast want the same result: an old or broken car gone, with some money for it. A traditional wrecker, or auto dismantler, is a parts business. It buys vehicles to strip, sells the used parts to repairers and the public, and sends what is left to a metal recycler. Collection terms vary between businesses, so ask whether towing is included or deducted from the price.",
          "We start from the seller's side. We quote the whole vehicle, confirm the offer and payment method before pickup, and include removal inside the confirmed Gold Coast service area with no towing deduction. You deal with one buyer for the offer, the paperwork and the collection.",
          `Licensing is the other practical difference. A business calling itself a wrecker, recycler or cash-for-cars buyer is not automatically a licensed motor dealer. ${site.name} is operated by ${site.registeredEntityName} under Queensland motor dealer licence ${site.licenceNumber}. That matters when a registered vehicle is traded to a dealer, where the safety-certificate exemption can apply. A registered vehicle sold for parts must still be de-registered first.`,
          "If you need a second-hand part for another car, contact a parts wrecker directly. This page is about selling and removing a whole vehicle.",
        ],
      },
      {
        heading: "What happens after the car is removed",
        body: [
          "Reusable components are assessed before the rest of the vehicle goes through the appropriate recycling process. Engines, transmissions, panels, glass, wheels, lights and electrical modules can hold value even when the complete car no longer runs.",
          "Fluids and batteries are handled separately before an end-of-life shell is processed. It is also why a complete car is usually worth more to us than one that has already had its high-value parts removed.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is car removal free on the Gold Coast?",
        answer:
          "Yes, for a vehicle we agree to buy inside the confirmed service area. There is no separate callout fee or towing charge, and nothing is deducted from the offer for the tow. Give us the exact suburb and access details so we can confirm coverage before you accept the quote.",
      },
      {
        question: "Will you pay me as well as remove the car?",
        answer:
          "Yes, when we agree to buy it. We confirm the offer and payment method before pickup. The offer applies when the make, model, year, condition, completeness, location and access match the details supplied.",
      },
      {
        question: "Can you remove a car that does not start or roll?",
        answer:
          "Yes, we assess non-runners. Tell us if the brakes are seized, wheels are missing, the tyres are flat, the steering is locked or another vehicle blocks the way, so the loading equipment can be confirmed before a truck is sent.",
      },
      {
        question: "Can you collect a car from a basement or unit-block carpark?",
        answer:
          "It depends on the building. A clearance bar, a tight ramp or a level with no room to winch all change how the car is brought out. Tell us the building name, the parking level and the signed clearance height, plus any loading dock or visitor rules, and we will confirm whether the pickup can be done as described.",
      },
      {
        question: "Can you remove my car on the same day?",
        answer:
          "Same-day removal may be available when the route, the access and the paperwork allow it, particularly if you call early with the vehicle and access details ready. It depends on the truck route and the equipment the car needs, so we confirm a pickup window with you before collection.",
      },
      {
        question: "Do I have to be there when the car is collected?",
        answer:
          "The owner or a person with clear legal authority normally needs to be available so we can verify identity, ownership and the required paperwork. If someone else will meet the truck, tell us who before it is sent.",
      },
      {
        question: "Do I need a safety certificate, or to cancel the registration first?",
        answer:
          "It depends on the registration status and the kind of sale. An unregistered vehicle, or a registered vehicle traded to a licensed motor dealer, does not need a safety certificate. A registered vehicle sold for parts must be de-registered first. Tell us the registration status and check the current Transport and Main Roads rules for your situation.",
      },
      {
        question: "What happens to the number plates?",
        answer:
          "That depends on what happens to the registration. If it is cancelled, Transport and Main Roads explains how to hand in the plates and claim any eligible refund. Personalised plates have separate rules. Check the current guidance before the car is collected.",
      },
      {
        question: "Someone left a car on my property. Can you remove it?",
        answer:
          "Not on the basis that it is parked on your land. The car still belongs to its owner, and Queensland sets out a process that has to be followed before an abandoned or left-behind vehicle can be sold or disposed of. Once you hold lawful authority and the paperwork that shows it, contact us for a quote.",
      },
    ],
    related: [
      "abandoned-car-private-property-queensland",
      "unregistered-vehicle-permit-queensland",
      "cancel-car-registration-queensland-after-sale",
      "sell-car-without-roadworthy-qld",
      "where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
      "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
      "statutory-vs-repairable-write-off-queensland",
      "blown-engine-repair-or-sell",
      "dead-hybrid-battery-repair-or-sell",
      "how-much-is-my-scrap-car-worth-gold-coast",
      "transferring-car-registration-in-queensland",
      "selling-car-personalised-plates-queensland",
      "selling-car-with-lpg-queensland",
      "selling-nsw-registered-car-queensland",
      "deceased-estate-car-sale-queensland",
    ],
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}
