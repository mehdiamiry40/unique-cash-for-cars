import type { Faq } from "@/lib/schema";

/**
 * The site has two commercial pillars:
 *
 *   /                        Cash For Cars Gold Coast
 *   /car-removal-gold-coast  Car Removal Gold Coast
 *
 * The homepage is authored directly. This file holds the removal pillar only;
 * former sell-my-car, unwanted-car and wrecker pages permanently redirect into
 * the most relevant pillar so their signals are not split across lookalike
 * commercial pages.
 */
export type ServicePage = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  serviceType: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  faqs: Faq[];
  related?: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "car-removal-gold-coast",
    title: "Car Removal Gold Coast | Free Pickup + Vehicle Offers",
    metaDescription:
      "Free car removal across the Gold Coast from homes, basements, roadsides and yards. Same-day pickup may be available, with payment confirmed before collection.",
    h1: "Car Removal Gold Coast",
    serviceType: "Car Removal Gold Coast",
    intro:
      "We collect cars across the Gold Coast without a callout or towing fee. Tell us what the vehicle is, where it is parked and anything that makes access difficult; we will quote the car and confirm the collection plan before dispatch.",
    sections: [
      {
        heading: "Free car removal with no hidden towing deduction",
        body: [
          "There is no separate callout fee or towing charge inside our confirmed Gold Coast service area for a vehicle we agree to buy. The removal cost is not deducted from the vehicle offer.",
          "This is different from booking an ordinary tow. The confirmed offer includes removal. It applies when the vehicle, condition, completeness, pickup location and access match the details supplied; if something material differs, we discuss it before the sale proceeds.",
        ],
      },
      {
        heading: "Vehicles we collect across the Gold Coast",
        body: [
          "A vehicle does not need to start, drive or pass a safety inspection for us to assess it. We quote according to the specific vehicle and its recoverable value rather than using one flat scrap rate.",
        ],
        list: [
          "Old and unwanted cars that are no longer being used",
          "Non-runners with engine, gearbox, electrical or battery faults",
          "Accident, hail, flood and write-off vehicles",
          "Unregistered and unroadworthy cars",
          "Incomplete projects and vehicles with missing parts",
          "Utes, vans, 4WDs, SUVs and light commercial vehicles",
        ],
      },
      {
        heading: "Pickup from driveways, basements, roadsides and yards",
        body: [
          "We collect from homes, workplaces, repairers, storage yards and breakdown locations. A non-running car can usually be winched, and a car with seized brakes or missing wheels may need skates or different loading equipment.",
          "Apartment basements, gated complexes, narrow streets, soft acreage access and blocked-in vehicles all need a little planning. Give us the clearance height, parking level and access instructions when you book so the right recovery setup is sent the first time.",
        ],
      },
      {
        heading: "What to prepare before collection",
        body: [
          "We must confirm that the person selling the vehicle has lawful authority to do so. The registration path also changes depending on whether the vehicle will remain registered or is leaving the road for dismantling. Queensland requires a registered vehicle sold for parts to be de-registered first, so check the current TMR process before collection.",
        ],
        list: [
          "Photo identification for the owner or authorised seller",
          "Proof of ownership and the current registration status",
          "A finance payout letter if money is still owing",
          "Keys if available, plus any access codes or booking instructions",
          "Number plates where TMR requires them to be returned or retained",
        ],
      },
      {
        heading: "What happens after your car is removed",
        body: [
          "Reusable components are assessed before the remaining vehicle is sent through the appropriate recycling process. Engines, transmissions, panels, glass, wheels, lights and electrical modules may retain value even when the complete car no longer runs.",
          "Fluids and batteries must be handled separately before an end-of-life shell is processed. Keeping the car complete usually gives us more recoverable value to include in the offer than receiving it after the high-value parts have been removed.",
        ],
      },
      {
        heading: "Same-day collection when the route allows",
        body: [
          "Same-day pickup is often possible when you call early and the vehicle is ready, but it is not a blanket promise. Truck availability, access, distance and ownership paperwork all affect the booking window.",
          "We confirm the pickup time, offer and payment method before collection. Describe the car and its location accurately so the offer and recovery plan are based on the job that is actually waiting for us.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is car removal free everywhere on the Gold Coast?",
        answer:
          "Removal is free inside the Gold Coast service area for vehicles we agree to buy. There is no separate callout fee or towing deduction. Give us the exact suburb and access details so we can confirm coverage before you accept the quote.",
      },
      {
        question: "Can you remove my car on the same day?",
        answer:
          "Often, particularly when you call early and the vehicle is accessible with its ownership paperwork ready. Same-day service depends on the truck route and the recovery equipment required, so we confirm timing rather than advertising a guarantee we cannot always keep.",
      },
      {
        question: "Does the car need to start or roll?",
        answer:
          "No. We can assess non-runners. Tell us if the brakes are seized, wheels are missing, the steering is locked or another vehicle blocks access so the recovery requirements can be confirmed before dispatch.",
      },
      {
        question: "Do I have to be there when the vehicle is collected?",
        answer:
          "The owner or a person with clear legal authority normally needs to be available so we can verify identity, ownership and the required paperwork. Confirm an authorised handover with us before the truck is dispatched.",
      },
      {
        question: "Do I need a Queensland safety certificate?",
        answer:
          "It depends on the registration status and buyer. A registered private sale generally needs a current safety certificate before disposal; an unregistered sale or trade to a licensed motor dealer does not. A registered vehicle sold for parts must first be de-registered. See our Queensland roadworthy guide and confirm the current TMR rules for your circumstances.",
      },
      {
        question: "What happens to the number plates?",
        answer:
          "That depends on the registration outcome. If registration is cancelled, TMR explains how to deal with the plates and claim any eligible refund. Personalised plates have separate rules. We confirm the intended transaction, but the current TMR guidance is the authority.",
      },
      {
        question: "Will you pay me as well as remove the car?",
        answer:
          "Yes, when we agree to buy it. We confirm the offer and payment method before pickup. The offer applies when the make, model, year, condition, completeness, location and access match the details supplied, and no towing fee is deducted.",
      },
    ],
    related: [
      "abandoned-car-private-property-queensland",
      "sell-car-without-roadworthy-qld",
      "unregistered-vehicle-permit-queensland",
      "selling-car-with-lpg-queensland",
      "cancel-car-registration-queensland-after-sale",
      "dead-hybrid-battery-repair-or-sell",
      "selling-car-personalised-plates-queensland",
      "deceased-estate-car-sale-queensland",
      "how-much-is-my-scrap-car-worth-gold-coast",
      "transferring-car-registration-in-queensland",
      "statutory-vs-repairable-write-off-queensland",
      "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    ],
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}
