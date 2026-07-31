import type { Faq } from "@/lib/schema";

/**
 * The three service pages carried over from WordPress, at their original URLs.
 *
 * The old /sell-my-car-gold-coast/ page shipped with an unfilled template
 * placeholder in its FAQ — `"Website name" will pay you anywhere from $50 to
 * $9,999` — which was live and indexed. That's fixed here.
 */

export type ServicePage = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  faqs: Faq[];
  /**
   * Slugs from posts.ts to link at the foot of the page.
   *
   * Pick guides that answer a question this page raises but does not have room
   * to settle — the finance and paperwork detail, for instance. It is a real
   * internal-linking path for the blog, not a related-posts widget: without it
   * each guide hangs off /blog alone.
   */
  related?: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "sell-my-car-gold-coast",
    title: "Sell My Car Gold Coast — Paid Same Day, No Inspections",
    metaDescription:
      "Sell your car on the Gold Coast without listings, tyre-kickers or no-shows. Firm quote on the phone, cash on collection, free removal. Call today.",
    h1: "Sell My Car Gold Coast",
    intro:
      "Selling privately means photos, listings, messages, strangers at your house and a fortnight of no-shows. Selling to us means one phone call and a truck. Here's how to decide which is right for your car.",
    sections: [
      {
        heading: "When selling to us makes sense — and when it doesn't",
        body: [
          "We'll be straight with you, because it saves us both time. If your car is registered, roadworthy, under about ten years old and you're not in a hurry, you will almost certainly get more for it selling privately. Take the photos, write the listing, be patient.",
          "Where we're the better option is everything else. Cars that don't start. Cars that would fail a roadworthy. Cars that are worth less than the repair quote. Cars you need gone by Friday because you're moving, or the lease is up, or you've already bought the replacement. In those situations a private sale is slow, stressful and often ends in the same place anyway.",
        ],
      },
      {
        heading: "What you need to have ready",
        body: [
          "Selling is quick when the paperwork is in order and slow when it isn't. Before you call, check you have:",
        ],
        list: [
          "Photo ID matching the registered owner",
          "The registration certificate, or the rego number if you can't find it",
          "Any finance payout letter, if there's money still owing",
          "The keys — not essential, but it helps the price",
        ],
      },
      {
        heading: "What happens on the day",
        body: [
          "We turn up at the time we agreed, at your home, work, or wherever the car is sitting. We check the car matches what you described, verify your ID and ownership, and you sign the transfer of registration.",
          "Then we pay you — cash on the spot, or bank transfer if you'd rather — and load the car. You keep the plates if the registration is still current so you can claim any refund from TMR. The whole thing usually takes about twenty minutes.",
        ],
      },
    ],
    faqs: [
      {
        question: "How much will you pay for my car?",
        answer:
          "Between a few hundred dollars for a stripped scrap shell and $9,999 for a late-model vehicle in good order. We won't pretend a single number applies to every car — call us with the make, model, year and condition and we'll give you a real figure in about a minute.",
      },
      {
        question: "Is your quote based on anything, or is it a guess?",
        answer:
          "It's based on current wholesale and salvage values for that make and model, the recoverable parts, and the scrap steel price at the time. That's why the number moves with the market and why we ask specific questions rather than quoting a flat rate.",
      },
      {
        question: "Can you buy my car the same day?",
        answer:
          "Often, yes — particularly across the Gold Coast if you call in the morning. Tell us your deadline when you ring and we'll tell you honestly whether we can meet it.",
      },
      {
        question: "Can I sell a car that still has finance owing on it?",
        answer:
          "Yes, provided the payout figure is less than what we're paying you, or you can cover the difference. You'll need a payout letter from the finance company. We can't complete a sale while an encumbrance is still registered against the vehicle.",
      },
      {
        question: "Do you buy cars that don't run?",
        answer:
          "That's most of what we buy. Flat battery, blown engine, no gearbox, four flat tyres, hasn't moved in five years — none of it matters. We tow it regardless, so it never needs to start.",
      },
      {
        question: "Will you sell me spare parts?",
        answer:
          "We recover parts from Korean, Japanese, Australian, European and American vehicles. Call with the make, model and year and we'll check what's on the shelf.",
      },
    ],
    related: [
      "how-much-is-my-scrap-car-worth-gold-coast",
      "selling-a-car-with-finance-owing-queensland",
      "transferring-car-registration-in-queensland",
    ],
  },

  {
    slug: "car-removal-gold-coast",
    title: "Car Removal Gold Coast — Free Towing, Same Day",
    metaDescription:
      "Free car removal across the Gold Coast. Basements, driveways and roadsides are covered. No callout fee and we pay you for the car.",
    h1: "Car Removal Gold Coast",
    intro:
      "Towing charges are why so many dead cars sit in driveways for years. Ours is free, and we pay you for the car on top of it.",
    sections: [
      {
        heading: "Free means free",
        body: [
          "There is no callout fee, no towing charge, no distance surcharge inside our service area and nothing deducted from your quote when the truck arrives. The figure we give you on the phone is the figure that goes in your hand.",
          "This catches people out because it's the reverse of a normal tow. You're not paying us to take the car away — we're paying you for it, and the removal is our cost of collecting something we want.",
        ],
      },
      {
        heading: "Where we can get to",
        body: ["We collect from just about anywhere a truck or a winch cable can reach:"],
        list: [
          "Home driveways, garages and carports",
          "Apartment basements with height restrictions — we winch to street level",
          "Workplace and shopping-centre carparks",
          "Roadsides and breakdown locations",
          "Smash repairers, mechanics and storage yards",
          "Acreage and unsealed driveways",
        ],
      },
      {
        heading: "Tell us the awkward bit up front",
        body: [
          "The jobs that go wrong are the ones where we find out about the problem on arrival. A clearance bar we can't fit under, a driveway too soft to hold a loaded truck, a car boxed in by two others, a building that needs a loading-dock booking.",
          "None of these stop us. All of them cost you a day if we turn up without knowing. When you book, describe where the car actually is and we'll send the right truck the first time.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I have to be there when you collect the car?",
        answer:
          "Yes, or someone authorised to sign on your behalf. We need to verify ID against the registered owner and get the transfer signed. It's a legal requirement, not paperwork for its own sake.",
      },
      {
        question: "What if the car is blocked in or won't roll?",
        answer:
          "Seized brakes, missing wheels and cars boxed in by other vehicles are all routine. Tell us when you book so we bring skates and a winch. We've very rarely had to leave one behind.",
      },
      {
        question: "Do I need to remove the number plates?",
        answer:
          "If the registration is still current, take the plates off and return them to TMR — you may be entitled to a refund on the unused portion. If the car is already unregistered, leave them on and we'll dispose of them.",
      },
      {
        question: "How much notice do you need?",
        answer:
          "Not much. Same-day is often possible on the Gold Coast if you call in the morning. We will confirm timing when you request your quote.",
      },
    ],
    related: [
      "transferring-car-registration-in-queensland",
      "where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
    ],
  },

  {
    slug: "unwanted-car-buyer",
    title: "Unwanted Car Buyer — Any Condition, Any Age",
    metaDescription:
      "We buy unwanted cars in any condition across the Gold Coast — non-runners, write-offs, project cars and deceased estates. Free removal, cash paid.",
    h1: "Unwanted Car Buyer",
    intro:
      "The car that was going to be fixed. The one from a deceased estate. The project that never got finished. If it's taking up space and doing nothing, we'll take it and pay you for it.",
    sections: [
      {
        heading: "What counts as unwanted",
        body: [
          "Nearly anything. The common thread isn't the car's condition, it's that keeping it has stopped making sense — the repair costs more than it's worth, nobody in the household drives it, or it came with a house or an estate and needs to go.",
        ],
        list: [
          "Non-runners and mechanical write-offs",
          "Insurance write-offs, including statutory and repairable",
          "Flood and hail-damaged vehicles",
          "Half-finished project cars and shells",
          "Deceased estate vehicles",
          "Cars left behind by tenants",
          "Fleet and business vehicles at end of life",
        ],
      },
      {
        heading: "Deceased estates and cars you didn't buy",
        body: [
          "A good share of our work is cars the seller never chose — inherited, left behind by a tenant, or included with a property. These need more paperwork than a normal sale, not less, and it's worth sorting before we come out.",
          "For an estate vehicle we'll generally need the death certificate and evidence that you're the executor or administrator, along with your own ID. For an abandoned tenant's car, Queensland has a defined process for goods left behind at the end of a tenancy and it needs to have been followed. Call us before you book and we'll tell you exactly what's required — it's usually more straightforward than people expect.",
        ],
      },
      {
        heading: "Why an unwanted car is worth more than it looks",
        body: [
          "Owners routinely assume a car that can't be driven is worth nothing. It very rarely is. The engine and transmission hold value even when the car doesn't run, catalytic converters contain recoverable precious metals, and panels, glass, wheels, lights and interior parts all have a market. Even after all that, the shell is several hundred kilos of recyclable steel.",
          "The only cars genuinely worth close to nothing are ones already stripped of their drivetrain and body panels. If yours is complete, it's worth a phone call.",
        ],
      },
    ],
    faqs: [
      {
        question: "The car has been sitting for ten years. Is it too far gone?",
        answer:
          "Almost certainly not. Time off the road affects tyres, fluids and the battery, none of which drive the value much. What matters is whether the car is complete. If the engine, gearbox and panels are still on it, we'll make an offer.",
      },
      {
        question: "I'm the executor of an estate. Can I sell the car?",
        answer:
          "Yes, with the right documentation — normally the death certificate plus evidence of your appointment as executor or administrator, and your own photo ID. Ring us before booking so we can confirm what Queensland Transport will need for the transfer.",
      },
      {
        question: "Can I sell a car that isn't registered in my name?",
        answer:
          "Not as it stands, but it's usually fixable. If a previous owner never completed the transfer, we'll talk you through what's needed. Please sort it before we come out rather than at the roadside.",
      },
      {
        question: "Do you take motorbikes, trailers or machinery?",
        answer:
          "Trailers and light commercial vehicles, yes. Motorbikes and machinery we assess case by case — send a photo and we'll tell you straight away.",
      },
    ],
    related: [
      "statutory-vs-repairable-write-off-queensland",
      "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
      "transferring-car-registration-in-queensland",
    ],
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((p) => p.slug === slug);
}
