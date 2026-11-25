/**
 * Suburb pages, and the location URLs that stay retired.
 *
 * History. The WordPress site had 19 location pages spun from one template:
 * once the suburb name was swapped out, a median 45% of sentences were
 * identical between any two pages. The rebuild kept eight, rewritten so each
 * led with something only true of that suburb. In August 2026 all of them were
 * folded into the homepage (PR #24). The 19 November 2026 Search Console audit
 * then showed the retired location URLs had 1,239 impressions in the previous
 * 28 days and none after, so the eight came back at their original URLs.
 *
 * Rules for this file:
 *
 *  1. If a paragraph could be moved to another suburb by swapping the place
 *     name, it does not belong here. scripts/check-duplication.mjs fails the
 *     build when the pages drift toward each other.
 *  2. No claims about how often we collect somewhere, what our customers in a
 *     suburb are like, or premises in a suburb. Write what the reader should
 *     tell us and why it matters, not what "most of our jobs" are.
 *  3. Prices, payment, timing and removal say only what the homepage,
 *     /car-removal-gold-coast and site.ts say. Do not promise same-day pickup
 *     or name a payment method.
 *  4. Queensland process statements must match the site's own guides, which
 *     carry the sources. Link the guide through `guides` rather than restating
 *     the rule at length.
 *  5. No testimonials, review counts or statistics without evidence.
 *
 * Every entry in `suburbs` is also in `site.areaServed`, in the same order.
 * tests/rendered-html.test.mjs holds the two lists together. The Gold Coast
 * eight came back on 19 November 2026. Ipswich, Logan and Toowoomba followed:
 * those URLs were still collecting impressions while they 308'd to the homepage.
 * Adelaide stays redirected. It is in South Australia, outside this service
 * area, and a page for it would be a doorway.
 *
 * This module is imported by next.config.ts, so it must not import anything
 * at runtime.
 */

export type SuburbFaq = { question: string; answer: string };

export type Suburb = {
  slug: string;
  name: string;
  postcode: string;
  /**
   * Eyebrow region. "Gold Coast" only for the coastal suburbs. Ipswich, Logan
   * and Toowoomba are outside that city and must not inherit its label.
   */
  region: string;
  /**
   * Eyebrow text when "{region} · {postcode}" would be wrong. Logan City has
   * no single postcode, so it sets this instead of implying one.
   */
  placeLabel?: string;
  /** Unique <title>. Must not contain either pillar keyword. */
  title: string;
  /** Unique meta description, 100 to 165 characters. */
  metaDescription: string;
  h1: string;
  /** One sentence under the H1. Must be specific to the suburb. */
  hook: string;
  /** What to have ready before asking for a quote here. */
  accessNote: string;
  /** The local section. This is what stops the page being a duplicate. */
  localAngle: { heading: string; body: string[] };
  /** Parts of the suburb, so a reader can place their own street. */
  coverage: string[];
  /** Nearby suburbs, as plain text. Naming one is not a claim that we serve it. */
  nearbyPlaces: string[];
  /** Slugs of nearby suburbs that have a page here. */
  neighbours: string[];
  /** Shown on the page and marked up as FAQPage, so they must be unique. */
  faqs: SuburbFaq[];
  /** Guide slugs from posts.ts that answer the questions this page raises. */
  guides: string[];
  /** ISO date the page content last changed. Feeds the sitemap lastmod. */
  updated: string;
};

export const suburbs: Suburb[] = [
  {
    slug: "southport",
    name: "Southport",
    postcode: "4215",
    region: "Gold Coast",
    title: "Cash for Cars Southport | Unit Block and Kerbside Pickup",
    metaDescription:
      "Unit-block basement or a street beside the light rail? Get a Southport car quote from a licensed Queensland buyer, with removal planned around the access.",
    h1: "Cash for Cars Southport",
    hook:
      "Southport packs unit-block basements, light rail streets and a hospital and university precinct into a small area, so where the car is parked shapes the pickup.",
    accessNote:
      "For a basement or unit-block pickup, have the building name, parking level and clearance height ready.",
    localAngle: {
      heading: "What to tell us before a Southport pickup",
      body: [
        "Southport is the Gold Coast's central business district, and it holds several kinds of parking close together: older houses on the streets around Nerang Street and Scarborough Street, unit blocks off Ferry Road, the carparks around Australia Fair, and the precinct around Gold Coast University Hospital and Griffith University.",
        "Where the car sits decides how it is collected. A basement carpark with a clearance bar can rule out a standard tilt tray, so the car may need to be winched to street level before it is loaded. Give us the building name, the parking level and the clearance height when you ask for a quote, along with any visitor-access or loading-zone rules the building has.",
        "Kerbside pickups need the same detail. The light rail runs through central Southport, and some streets beside the corridor leave little room for a truck to stop and load. Tell us which street the car is on and whether there is a side street or driveway close by, so the collection can be planned around it.",
        "If the car was left behind at a rental property, the person arranging the sale needs lawful authority first. Queensland has a process for goods left at the end of a tenancy, and it has to be followed before the vehicle can be sold or removed. Our guide to abandoned cars on private property sets out the steps.",
      ],
    },
    coverage: [
      "Unit blocks off Ferry Road",
      "Nerang Street and Scarborough Street",
      "Carparks around Australia Fair",
      "The Gold Coast University Hospital and Griffith University precinct",
      "Streets beside the light rail corridor",
      "The Broadwater Parklands side",
    ],
    nearbyPlaces: ["Ashmore", "Molendinar", "Parkwood", "Main Beach"],
    neighbours: ["labrador", "surfers-paradise", "nerang"],
    faqs: [
      {
        question: "Can you collect a car from a basement carpark in Southport?",
        answer:
          "It depends on the building. A clearance bar, a tight ramp or a parking level with no room to winch all change how the car is recovered. Tell us the building name, the parking level and the clearance height when you ask for a quote, and we will confirm whether the pickup can be done as described before a truck is sent.",
      },
      {
        question: "A tenant left a car at my Southport rental. Can you take it?",
        answer:
          "Not until the person selling it has lawful authority. The car still belongs to its owner, and Queensland's tenancy rules set out what must happen to goods left behind before they can be sold or disposed of. Check the Residential Tenancies Authority guidance, follow that process, then contact us with the paperwork.",
      },
      {
        question: "The car is parked on a street beside the light rail. Is that a problem?",
        answer:
          "It can limit where a truck is able to stop and load. Tell us the street and the nearest side street or driveway when you call, so a workable loading spot can be confirmed before the collection is booked.",
      },
      {
        question: "Can a car be collected from a carpark in the hospital and university precinct?",
        answer:
          "Possibly, but those carparks have their own height, access and time limits. Tell us which carpark and level the car is on, and check the operator's rules for tow vehicles. The owner or a person with clear legal authority normally needs to be there so identity and ownership can be checked.",
      },
    ],
    guides: [
      "abandoned-car-private-property-queensland",
      "transferring-car-registration-in-queensland",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "surfers-paradise",
    name: "Surfers Paradise",
    postcode: "4217",
    region: "Gold Coast",
    title: "Cash for Cars Surfers Paradise | Tower Basement Pickup",
    metaDescription:
      "Car parked in a Surfers Paradise tower? We quote the vehicle, then plan removal around basement height limits, loading docks and visitor access.",
    h1: "Cash for Cars Surfers Paradise",
    hook:
      "In Surfers Paradise the car is usually inside a building, so basement height, loading docks and visitor access decide how it comes out.",
    accessNote:
      "Have the building name, the basement level and any loading-dock or visitor-pass rules ready.",
    localAngle: {
      heading: "Selling a car from a Surfers Paradise tower",
      body: [
        "Much of Surfers Paradise is high-rise. Towers line the Esplanade, Surfers Paradise Boulevard and Ferny Avenue, with more around Cavill Avenue and Orchid Avenue, and resident parking is mostly in a basement or podium carpark, not on a driveway.",
        "That makes building access the first thing to sort out. A basement height limit can stop a tilt tray at the entry, and some buildings ask for a loading dock or service bay to be booked through building management. When you ask for a quote, tell us the building name, the parking level, the signed clearance height, and whether a visitor pass or a dock booking is needed.",
        "If you are leaving on a fixed date, such as the end of a lease or a flight, say so at the start. We confirm the offer, the payment method and the pickup window before collection, so the date you need becomes part of the booking. Pickup times depend on the route, the building access and the paperwork.",
        "A car registered in another state can still be sold here, but the paperwork follows the state that registered it. If yours has NSW plates, read our guide to selling a NSW registered car in Queensland before the pickup.",
      ],
    },
    coverage: [
      "Towers along the Esplanade and Surfers Paradise Boulevard",
      "Cavill Avenue and Orchid Avenue",
      "Ferny Avenue",
      "Budds Beach and the river side",
      "Chevron Island",
      "Isle of Capri",
    ],
    nearbyPlaces: ["Main Beach", "Broadbeach", "Bundall"],
    neighbours: ["southport", "mermaid-waters"],
    faqs: [
      {
        question: "I am moving out of Surfers Paradise on a set date. Can the pickup be booked before then?",
        answer:
          "Tell us the date when you ask for a quote. We confirm the pickup window before collection, and timing depends on the route, the building access and the paperwork, so the earlier we know, the better the chance of a time that works. Have your photo ID and proof of ownership ready.",
      },
      {
        question: "My car is in a tower basement with a height limit. What do you need to know?",
        answer:
          "The building name, the parking level and the signed clearance height, plus whether the building needs a loading dock booking or a visitor pass. With those details we can confirm how the car would be brought out and whether the pickup can go ahead as described.",
      },
      {
        question: "Can I sell a car with interstate plates in Surfers Paradise?",
        answer:
          "Yes, but the sale is recorded with the state that registered the car. For a NSW registered car that means Service NSW, not Transport and Main Roads, even when the seller and buyer are both in Queensland. For any other state, check with that state's transport authority before the pickup.",
      },
      {
        question: "The car has sat unregistered in a building carpark. Can it still be sold?",
        answer:
          "An unregistered vehicle can be sold in Queensland without a safety certificate, and it does not need to start for us to assess it. Tell us how long it has been parked and whether the tyres hold air and the wheels turn, because that affects how it is moved out of the building.",
      },
    ],
    guides: [
      "selling-nsw-registered-car-queensland",
      "cancel-car-registration-queensland-after-sale",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "robina",
    name: "Robina",
    postcode: "4226",
    region: "Gold Coast",
    title: "Cash for Cars Robina | Driveway and Garage Car Pickup",
    metaDescription:
      "Get a vehicle-specific quote for a car in Robina, with removal from driveways, garages and townhouse complexes near Robina Town Centre and the station.",
    h1: "Cash for Cars Robina",
    hook:
      "Robina is a planned suburb of driveways, garages and townhouse complexes, so the questions are mostly about the car in the garage and whose name it is in.",
    accessNote:
      "Tell us whether the car is in a garage, on a driveway or in a complex with a shared internal road.",
    localAngle: {
      heading: "Selling a car from a Robina driveway or garage",
      body: [
        "Robina was planned and built from the 1980s onward around Robina Town Centre, with Robina Hospital, the train station and Cbus Super Stadium close by. Homes here generally have off-street parking, so the car is likely to be on a driveway, in a garage or inside a townhouse complex off roads such as Robina Parkway, Cheltenham Drive and Scottsdale Drive.",
        "A driveway is a simple place to load from, but the details still matter. Tell us if the car is nose-in inside a garage, if another vehicle is parked behind it, or if the complex has a narrow internal road or body corporate rules about trucks. A car that does not start can usually be winched, and one with seized brakes or flat tyres may need different loading equipment.",
        "When a car in the garage has a failed engine or gearbox, get the diagnosis and the repair quote in writing before deciding. If the repair costs more than the car would be worth once fixed, selling it complete keeps the most value in it, because the panels, glass, interior and the rest of the drivetrain are all still there.",
        "If you are selling before leaving the area, for example at the end of a course at Bond University or a placement at the hospital, check whose name the registration is in. The registered owner, or a person with lawful authority to sell, has to be the one who completes the sale.",
      ],
    },
    coverage: [
      "Homes and complexes around Robina Town Centre",
      "The Robina Hospital and train station side",
      "Robina Parkway and Cheltenham Drive",
      "Scottsdale Drive",
      "The Bond University side, off University Drive",
    ],
    nearbyPlaces: ["Varsity Lakes", "Mudgeeraba", "Merrimac", "Clear Island Waters"],
    neighbours: ["mermaid-waters", "burleigh-heads", "nerang"],
    faqs: [
      {
        question: "The engine has failed and the repair quote is more than the car is worth. What now?",
        answer:
          "Get the diagnosis and the quote in writing, then compare the repair cost with what the car would be worth once fixed. If the numbers do not work, we quote the car as it stands. A complete car with a failed engine still has value in its gearbox, panels, glass, wheels and interior.",
      },
      {
        question: "The car is in my garage and has not started for years. Can it be collected?",
        answer:
          "A car does not need to start for us to assess it. Tell us whether it rolls and steers, whether the tyres hold air and how much room there is in front of the garage, so the loading method can be confirmed before a truck is sent. Keys help, so tell us if they are missing.",
      },
      {
        question: "My car has hail damage to the roof and bonnet. Will you buy it?",
        answer:
          "We assess hail-damaged vehicles. The offer depends on the make, model, year and how complete the car is. Tell us if an insurer has assessed it, because a car recorded as a write-off comes with its own rules about what can happen to it next.",
      },
      {
        question: "The registration is still in a previous owner's name. Can I sell the car?",
        answer:
          "Sort that out first. We have to confirm that the person selling has lawful authority, and a registration record in someone else's name does not show that. Check the transfer steps with Transport and Main Roads, then contact us with the ownership paperwork.",
      },
    ],
    guides: ["blown-engine-repair-or-sell", "statutory-vs-repairable-write-off-queensland"],
    updated: "2026-11-26",
  },

  {
    slug: "burleigh-heads",
    name: "Burleigh Heads",
    postcode: "4220",
    region: "Gold Coast",
    title: "Cash for Cars Burleigh Heads | Rust and Failed Roadworthy",
    metaDescription:
      "Rust from the salt air or a failed roadworthy in Burleigh Heads? We quote corroded and unwanted cars and plan removal for headland streets and unit blocks.",
    h1: "Cash for Cars Burleigh Heads",
    hook:
      "Close to the surf, salt air works on a car from underneath, and the narrow streets by the headland need a pickup plan.",
    accessNote:
      "Tell us what the safety inspection found and whether your street has room for a truck to stop.",
    localAngle: {
      heading: "What salt air means when you sell a car in Burleigh Heads",
      body: [
        "Burleigh Heads sits between the beach, Burleigh Head National Park and Tallebudgera Creek. A car parked outside this close to the surf is exposed to salt air, and corrosion tends to start where it is hard to see: brake and fuel lines, suspension mounts, the subframe and the seams under the sills.",
        "The rust may only come to light at a safety certificate inspection. If an inspector has found structural corrosion and the repair quote is more than the car is worth, the car can still have value in its engine, gearbox, catalytic converter, panels, glass and wheels. Tell us what the inspection report says so the quote reflects the car as it is.",
        "Queensland gives you more than one way to sell a car that will not pass. You can repair the defects, trade the car to a licensed motor dealer, or cancel the registration and sell it unregistered. A registered vehicle sold for parts must be de-registered first. Our roadworthy guide explains each path.",
        "Access varies across the suburb. The streets on the headland side are narrow, the blocks along the Gold Coast Highway are largely units with basement or undercroft parking, and West Burleigh toward Reedy Creek Road has wider streets and driveways. Tell us which part you are in and where the car is parked.",
      ],
    },
    coverage: [
      "James Street and the village streets",
      "Unit blocks along the Gold Coast Highway",
      "Streets beside Burleigh Head National Park",
      "The Tallebudgera Creek end",
      "West Burleigh toward Reedy Creek Road",
    ],
    nearbyPlaces: ["Miami", "Burleigh Waters", "Varsity Lakes", "Palm Beach"],
    neighbours: ["mermaid-waters", "robina"],
    faqs: [
      {
        question: "My car failed its safety inspection on rust. Is it worth anything?",
        answer:
          "It can be. Rust that fails an inspection does not take away the value of the engine, gearbox, catalytic converter, panels, glass and wheels if they are still on the car. Tell us what the inspection report lists and we will quote the vehicle as described.",
      },
      {
        question: "Does underbody corrosion lower the offer?",
        answer:
          "It is one of the things we take into account. Heavy corrosion reduces what the body is worth and can make some parts harder to recover. The offer also reflects the make, model, year and how complete the car is, so describe the rust as accurately as you can.",
      },
      {
        question: "Can a truck get to a narrow street near the national park?",
        answer:
          "Tell us the street when you ask for a quote. Some streets near the headland are narrow or steep, with limited room to stop and load. The loading spot and the collection plan are confirmed with you before anything is booked.",
      },
      {
        question: "Do I need to clean out a beach ute or van before pickup?",
        answer:
          "It does not need to be cleaned. Remove everything you want to keep, including anything under the seats and in the door pockets, and take off racks or accessories you are not selling with the vehicle. Tell us if anything fitted to it has been removed since you described it.",
      },
    ],
    guides: ["sell-car-without-roadworthy-qld", "how-much-is-my-scrap-car-worth-gold-coast"],
    updated: "2026-11-26",
  },

  {
    slug: "labrador",
    name: "Labrador",
    postcode: "4215",
    region: "Gold Coast",
    title: "Cash for Cars Labrador | Long-Parked and Estate Cars",
    metaDescription:
      "We quote long-parked, one-owner and deceased estate cars in Labrador, with removal from the older streets between the Broadwater and Brisbane Road.",
    h1: "Cash for Cars Labrador",
    hook:
      "On the older streets back from the Broadwater, the questions are who has authority to sell the car and how long it has been parked.",
    accessNote:
      "If you are not the registered owner, tell us what authority you hold before a pickup is booked.",
    localAngle: {
      heading: "Selling a long-parked or estate car in Labrador",
      body: [
        "Labrador runs back from Marine Parade and the Broadwater toward Brisbane Road, with Frank Street carrying the Gold Coast Highway through the middle. It is one of the older residential areas on the northern Gold Coast, with houses on the streets near the water and unit blocks and newer infill among them.",
        "A car that has been parked in one place for years can be worth more than the dust suggests. Time off the road affects the tyres, the fluids and the battery. What matters more to the offer is whether the engine, gearbox, catalytic converter, panels and glass are still on the car, so tell us how complete it is and how long it has been sitting.",
        "If the car belonged to someone who has died, the person selling it needs authority to deal with it. Transport and Main Roads accepts an executor, an administrator or, where there is no will or grant, the next of kin, and it has its own application for a deceased person's registration. Our deceased estate guide explains the order to do things in.",
        "The same care applies when a relative has moved into care or given up driving and someone else is arranging the sale. We have to confirm that the seller is the owner or has lawful authority, so have that paperwork ready before a pickup is booked.",
      ],
    },
    coverage: [
      "Marine Parade and the Broadwater foreshore",
      "Frank Street and the Gold Coast Highway",
      "Brisbane Road",
      "Turpin Road and Government Road",
      "The Biggera Creek end",
    ],
    nearbyPlaces: ["Biggera Waters", "Runaway Bay", "Arundel", "Parkwood"],
    neighbours: ["southport", "helensvale"],
    faqs: [
      {
        question: "The car belonged to a relative who has died. Can I sell it?",
        answer:
          "You can if you have authority to deal with it. Transport and Main Roads accepts an executor named in the will or a grant of probate, an administrator named in letters of administration, or the next of kin where there is no will or grant. Sort out the registration with TMR first, then contact us with your photo ID and the estate paperwork.",
      },
      {
        question: "It has not been driven for eight years. Is it worth anything?",
        answer:
          "It can be. Years off the road affect tyres, fluids and the battery more than the parts that carry most of the value. If the engine, gearbox, catalytic converter, panels and glass are all still there, say so, because a complete car is worth more than one that has had parts removed.",
      },
      {
        question: "Should I cancel the registration on an estate car before selling it?",
        answer:
          "Check the order with Transport and Main Roads first. TMR asks that the registration be transferred into the estate or to another person before it is cancelled, so any refund goes to the right person. A registered vehicle sold for parts must be de-registered before the sale.",
      },
      {
        question: "My parent has moved into care and I am arranging the sale. What do you need?",
        answer:
          "Evidence that you have lawful authority to sell the car on their behalf, together with your photo ID and the registration details. If you are unsure what counts as authority, check with Transport and Main Roads before a pickup is booked.",
      },
    ],
    guides: [
      "deceased-estate-car-sale-queensland",
      "selling-car-personalised-plates-queensland",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "nerang",
    name: "Nerang",
    postcode: "4211",
    region: "Gold Coast",
    title: "Cash for Cars Nerang | Acreage, Shed and Yard Pickups",
    metaDescription:
      "Work utes, project cars and flood-affected vehicles quoted in Nerang, with removal planned for acreage tracks, sheds and industrial yards off the M1.",
    h1: "Cash for Cars Nerang",
    hook:
      "Nerang runs from industrial estates beside the M1 to acreage toward the hinterland, so the ground under the car matters.",
    accessNote:
      "Tell us the driveway surface and length, and whether the car is in a shed, a yard or a paddock.",
    localAngle: {
      heading: "Pickups from Nerang acreage, sheds and work yards",
      body: [
        "Nerang sits inland on the Nerang River, where the Pacific Motorway crosses it. The town centre and the railway station are close to the motorway, industrial estates run along Lawrence Drive and Spencer Road, and to the west the blocks get larger on the way to Advancetown and the hinterland.",
        "On acreage the question is the ground. A loaded tilt tray is heavy, and a long unsealed driveway can be too soft to carry one after rain. Tell us the length and surface of the track, whether it has been wet, and whether the car is on gravel, grass or a slab. If the truck cannot reach it safely, the car may need to be winched to firmer ground first.",
        "For a work ute, van or other business vehicle, tell us whether it is registered to a company or to an individual, because the ownership paperwork differs. Mention any forklift, pallet stack or other vehicle that would have to move before it can be loaded from a yard.",
        "Low-lying land near the Nerang River can flood. If the car has been through flood water, tell us how high the water reached inside it, because that changes what can be recovered. A flood-affected car may also have been recorded as a write-off, and the written-off vehicle rules can apply before it is sold.",
      ],
    },
    coverage: [
      "Nerang town centre and the railway station",
      "Industrial estates on Lawrence Drive and Spencer Road",
      "Southport–Nerang Road",
      "Acreage toward Advancetown",
      "Homes near the Nerang River",
    ],
    nearbyPlaces: ["Highland Park", "Carrara", "Gaven", "Pacific Pines"],
    neighbours: ["southport", "robina", "helensvale"],
    faqs: [
      {
        question: "The car is on acreage down a dirt track. Can it be collected?",
        answer:
          "Tell us the length and surface of the track and whether it has been wet. A loaded truck can bog where an empty one drove in, so how the car will be reached is confirmed before booking. It may need to be winched to a sealed or firmer spot for loading.",
      },
      {
        question: "Do you buy work utes and vans owned by a business?",
        answer:
          "We assess utes, vans and light commercial vehicles. If the vehicle is registered to a company, tell us when you ask for a quote so we can confirm what ownership paperwork and authority are needed for the sale.",
      },
      {
        question: "My car went through flood water. Will you still make an offer?",
        answer:
          "We assess flood-affected vehicles. How high the water reached matters most, because water through the cabin and electrics leaves less to recover than a wet floor. Tell us what happened and whether an insurer has assessed the car.",
      },
      {
        question: "Can you take a half-finished project car that is in pieces?",
        answer:
          "We assess incomplete projects and vehicles with missing parts. Tell us what is on the car and what is loose, because a stripped car is worth less than a complete one and loose parts change how it is loaded. That is worth knowing before you sell parts from it separately.",
      },
    ],
    guides: [
      "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
      "unregistered-vehicle-permit-queensland",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "helensvale",
    name: "Helensvale",
    postcode: "4212",
    region: "Gold Coast",
    title: "Cash for Cars Helensvale | Gated Estate Car Pickup",
    metaDescription:
      "A quote for your car in Helensvale from a licensed Queensland buyer, with removal planned around gated estates, body corporate rules and the station.",
    h1: "Cash for Cars Helensvale",
    hook:
      "Helensvale is mostly estate housing around the rail interchange, and a gate or a body corporate rule can decide how a pickup works.",
    accessNote:
      "Tell us the estate name and how visitors and trucks get through the gate.",
    localAngle: {
      heading: "Selling a car from a Helensvale estate",
      body: [
        "Helensvale is where the Gold Coast train line meets the northern end of the light rail, beside Westfield Helensvale. Around the station the suburb is largely estate housing, reached from roads such as Helensvale Road, Lindfield Road and Discovery Drive, with canal-front homes at Monterey Keys.",
        "Inside an estate, a driveway makes for a simple load. Getting inside is the part to plan. Some estates have a boom gate or a resident code, and some body corporates set times or conditions for trucks. Tell us the estate name and how visitors get in when you ask for a quote.",
        "If the household now has a car nobody uses, be realistic about the best way to sell it. A registered, roadworthy, reasonably modern car may return more in a private sale. A direct sale suits a car that needs repairs, has not been driven for a long time, or has to be gone by a date.",
        "Money still owing on the car has to be dealt with as part of the sale. Ask the lender for a payout letter before you request a pickup, and tell us finance is involved so the handover can be planned around it.",
      ],
    },
    coverage: [
      "Estates off Helensvale Road, Lindfield Road and Discovery Drive",
      "The Helensvale station and Westfield side",
      "Canal-front homes at Monterey Keys",
      "The Hope Island Road side",
    ],
    nearbyPlaces: ["Oxenford", "Coomera", "Hope Island", "Arundel", "Pacific Pines"],
    neighbours: ["labrador", "southport", "nerang"],
    faqs: [
      {
        question: "My estate has a security gate. How does a pickup work?",
        answer:
          "Tell us the estate name and how visitors normally get in. Some estates need a resident to let the truck through, and others want the body corporate told beforehand. The access arrangement is confirmed with you before the collection is booked.",
      },
      {
        question: "We no longer need a second car. Is selling to you the best option?",
        answer:
          "Not always. A registered, roadworthy, reasonably modern car may return more in a private sale if you are willing to list it and meet buyers. We suit you better when you want a confirmed offer and a pickup date without running a listing, or when the car needs work.",
      },
      {
        question: "There is still finance owing on the car. Can it be sold?",
        answer:
          "Yes, but the debt has to be dealt with in the sale. Ask your lender for a payout letter and tell us finance is involved when you ask for a quote. Our finance guide explains how the payout figure and the lender's registered interest are handled.",
      },
      {
        question: "Do you also collect from Oxenford, Coomera or Hope Island?",
        answer:
          "Those suburbs are close to Helensvale, but coverage is confirmed for the exact pickup address. Tell us the suburb and street when you ask for a quote and we will confirm whether it is inside the service area before you accept.",
      },
    ],
    guides: [
      "selling-a-car-with-finance-owing-queensland",
      "dead-hybrid-battery-repair-or-sell",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "mermaid-waters",
    name: "Mermaid Waters",
    postcode: "4218",
    region: "Gold Coast",
    title: "Cash for Cars Mermaid Waters | Canal Street Car Pickup",
    metaDescription:
      "Canal cul-de-sac, narrow frontage or a boat in the driveway? We quote your Mermaid Waters car and plan the removal around the street it is parked in.",
    h1: "Cash for Cars Mermaid Waters",
    hook:
      "In the canal streets of Mermaid Waters, getting a truck to the car can take more planning than the car itself.",
    accessNote:
      "Tell us the street, whether it ends in a cul-de-sac, and what is parked around the car.",
    localAngle: {
      heading: "In the canal streets, access is the main question",
      body: [
        "Mermaid Waters is built around canals and lakes, including Lake Hugh Muntz, between Mermaid Beach and Bermuda Street. Away from through roads such as Sunshine Boulevard and Markeri Street, many streets are short waterfront fingers that end in a cul-de-sac, with narrow frontages and little room to turn a large vehicle.",
        "So the first thing to describe is the approach. A tilt tray needs somewhere to stop, load and drive out again, and a cul-de-sac with cars parked on both sides may not offer that. Give us the street name and tell us what the turning area is like, and how the car would be loaded is confirmed before booking. It may need to be winched to a wider part of the street.",
        "On a waterfront block the driveway may also hold a boat, a trailer or a caravan. If the car is parked behind something that has to move first, say so and tell us whether it can be moved on the day. If the car has sat long enough for the brakes to seize or the tyres to go flat, mention that too, because a car that will not roll may need skates or different loading equipment.",
      ],
    },
    coverage: [
      "Canal and lakefront cul-de-sacs off Sunshine Boulevard",
      "Markeri Street and the Q Super Centre side",
      "Streets around Lake Hugh Muntz",
      "The Bermuda Street side",
      "The Mermaid Beach side, toward the Gold Coast Highway",
    ],
    nearbyPlaces: ["Broadbeach Waters", "Clear Island Waters", "Mermaid Beach", "Miami"],
    neighbours: ["robina", "burleigh-heads", "surfers-paradise"],
    faqs: [
      {
        question: "My street is a narrow cul-de-sac. Can a truck get in?",
        answer:
          "Tell us the street when you ask for a quote. Some canal streets have little room to turn or to stop and load, particularly with cars parked on both sides. The loading plan is confirmed before booking, and the car may need to be winched to a wider spot.",
      },
      {
        question: "The car is blocked in behind a boat and trailer. Is that a problem?",
        answer:
          "It is something to tell us before the pickup. If the boat or trailer can be moved on the day, the collection is planned around that. If it cannot, tell us how much room there is beside it so we can confirm whether the car can still be brought out.",
      },
      {
        question: "The brakes have seized and the car will not roll. Can it still be collected?",
        answer:
          "A car does not need to roll for us to assess it. Seized brakes, flat tyres or locked steering change the loading equipment needed, so describe them when you ask for a quote and the recovery requirements can be confirmed before a truck is sent.",
      },
      {
        question: "Can the pickup be timed for when the street is clear?",
        answer:
          "Tell us when the street is usually clear of parked cars, or when a neighbour's vehicle will be out of the way. We confirm an available pickup window with you, and the timing also depends on the route and the paperwork.",
      },
    ],
    guides: [
      "where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
      "how-much-is-my-scrap-car-worth-gold-coast",
    ],
    updated: "2026-11-26",
  },

  {
    slug: "ipswich",
    name: "Ipswich",
    postcode: "4305",
    region: "Ipswich",
    title: "Cash for Cars Ipswich | Bremer River and Backyard Cars",
    metaDescription:
      "Car beside an Ipswich Queenslander, or on a steep street toward Queens Park? Describe the access with the vehicle and we will quote it.",
    h1: "Cash for Cars Ipswich",
    hook:
      "Ipswich is an older river city, and the car is often down the side of a Queenslander, behind a second vehicle, or on a street that climbs toward Limestone Hill.",
    accessNote:
      "Say whether the car is at the kerb, down the side of the house, or inside a fenced yard, and whether another vehicle blocks it.",
    localAngle: {
      heading: "Reaching a car on an Ipswich block",
      body: [
        "Ipswich stands on the Bremer River, west of Brisbane. Brisbane Street and Limestone Street make the old centre, and the railway station sits just to their north. Postcode 4305 takes in that centre plus East Ipswich along Brisbane Road, West Ipswich and Woodend, Brassall across the river, and North Ipswich beside the former railway workshops.",
        "The houses are often Queenslanders or low-set timber homes. The car lives down the side, under the house, or in a backyard behind a gate. A tilt tray wants a straight line to the vehicle. A fence, a retaining wall or a second car in front changes that line. Describe the side passage, say how wide it is, and say whether the blocking car can be shifted on the day.",
        "The hill and the river flats are different ground. Streets rising toward Queens Park are short and steep, with cars nosed hard into the kerb. Around North Ipswich and the workshops precinct the land is flatter, and some sites are industrial: a gate, a sign-in, and other vehicles sharing the yard. Name the street and the kind of property so the loading place can be agreed before the drive inland is booked.",
        "If the registration is still in another person's name after a move out from Brisbane, authority to sell has to be sorted before the day. The Queensland transfer guide is the reference for that paperwork. A car that failed its safety inspection can still be quoted as it stands. Read the roadworthy guide before paying for repairs only to obtain a certificate.",
      ],
    },
    coverage: [
      "Brisbane Street, Limestone Street and the railway station",
      "East Ipswich along Brisbane Road",
      "West Ipswich and Woodend",
      "Brassall, on the far side of the Bremer",
      "North Ipswich and the workshops precinct",
      "Streets climbing toward Queens Park",
    ],
    nearbyPlaces: ["Goodna", "Redbank", "Booval", "Ripley"],
    neighbours: ["logan"],
    faqs: [
      {
        question: "The car is down the side of a Queenslander and another car is parked in front. Can it be loaded from there?",
        answer:
          "Describe the side passage, including its width and any gate, and say whether the front car can be moved on the day. A narrow gap or a car that stays put changes how the vehicle is brought out to the street, and that is settled before the drive to Ipswich is booked.",
      },
      {
        question: "My street near Queens Park is steep and already lined with parked cars. Where would a truck stop?",
        answer:
          "Give the street name and point out the nearest driveway or wider stretch of kerb. Steep parking on that hill leaves little room to line a tray up, so the stopping place is part of the booking, not something left until arrival.",
      },
      {
        question: "The registration is still in a relative's name after the car came to Ipswich. Can the sale go ahead?",
        answer:
          "Only with authority to sell. A registration record in someone else's name does not, by itself, give you that authority. Use the Queensland transfer guide to see what Transport and Main Roads asks for, then include the ownership papers with the enquiry.",
      },
      {
        question: "Goodna, Redbank and Ripley are close. Are they covered by this page?",
        answer:
          "They are named so you can place Ipswich on the map. Naming them is not a promise that those suburbs are covered. The enquiry needs its own suburb and street, and that address is confirmed before you accept an offer.",
      },
    ],
    guides: ["transferring-car-registration-in-queensland", "sell-car-without-roadworthy-qld"],
    updated: "2026-11-19",
  },

  {
    slug: "logan",
    name: "Logan",
    // 4114 is Logan Central, the civic centre. Logan City uses many postcodes,
    // so the eyebrow is "Logan City" rather than any one of them.
    postcode: "4114",
    region: "Logan",
    placeLabel: "Logan City",
    title: "Cash for Cars Logan | Houses, Stations and Sheds",
    metaDescription:
      "Logan stretches from the Beenleigh railway to the Pacific Motorway. Say if the car is at a house, a unit near a station, or a commercial shed.",
    h1: "Cash for Cars Logan",
    hook:
      "Logan is a city between Brisbane and the northern Gold Coast, cut by a motorway and a railway, so which side the car is on decides the pickup.",
    accessNote:
      "Name the suburb inside Logan, the street, and whether the car is at a house, in a unit carpark, or on a commercial lot.",
    localAngle: {
      heading: "House, station precinct, or shed",
      body: [
        "Logan City runs from Brisbane's southern edge down toward the coast. The Pacific Motorway is one spine and the Beenleigh railway is the other. Logan Central, around Wembley Road and the civic precinct, is a different collection from Woodridge or Kingston beside the stations, and different again from Springwood, where the bulky-goods buildings sit against the motorway.",
        "A house in Shailer Park, Browns Plains or the residential streets off Wembley Road usually means a driveway question. Is the car nose-in under a carport? Is a trailer in front of it? Is the crossover wide enough for a tray to square up? A unit near Woodridge or Kingston station is the other case: a building name, a parking level, and any height bar over the entry, plus a street that fills on weekdays. Send the details that match the property you actually have.",
        "Commercial lots add a third case. A van or ute at a shed in Springwood or Slacks Creek may be behind a roller door, inside a locked compound, or hemmed in by stock. Say whether the registration is in a company name or a person's name, because the authority to sell is different, and mention anything that has to move before the vehicle can come forward.",
        "Helensvale, on the northern Gold Coast, has its own page for cars on that side of the motorway. Yatala, Rochedale, Underwood and Redbank Plains appear here only as landmarks. Put the real suburb on the enquiry. An address outside Logan is confirmed on its own, and a shared boundary is not coverage.",
      ],
    },
    coverage: [
      "Logan Central and Wembley Road",
      "Woodridge and Kingston beside the Beenleigh line",
      "Springwood and Slacks Creek along the motorway",
      "Browns Plains",
      "Shailer Park",
    ],
    nearbyPlaces: ["Yatala", "Rochedale", "Underwood", "Redbank Plains"],
    neighbours: ["ipswich", "helensvale"],
    faqs: [
      {
        question: "The car is in a unit carpark near Woodridge station. What should the enquiry include?",
        answer:
          "The building name, the level the car is on, and the signed clearance if a bar hangs over the entry. Weekday parking around the station can also block a truck, so mention a visitor bay or a quieter side street if one exists.",
      },
      {
        question: "It is a work van in a company name, parked at a shed in Springwood. Who is allowed to sell it?",
        answer:
          "The seller has to be able to act for the registered holder. A company registration usually means a director or a person the company has authorised, which is a different set of papers from a car in someone's own name. Say which it is, and say if stock or another vehicle is in front of the van.",
      },
      {
        question: "We are in Shailer Park and the car sits under a carport behind a boat trailer. Does the trailer matter?",
        answer:
          "It matters for the loading plan. Say whether the trailer can be rolled clear on the day, and how much width the driveway keeps beside it. A low carport beam can stop a tray in the driveway, in which case the car has to be brought to the street first.",
      },
      {
        question: "Yatala and Redbank Plains share a boundary with Logan. Does this page cover them?",
        answer:
          "No. They are on this page so the map makes sense, not because a boundary equals coverage. The street address on the enquiry is what gets confirmed, including when that address is outside Logan.",
      },
    ],
    guides: [
      "cancel-car-registration-queensland-after-sale",
      "statutory-vs-repairable-write-off-queensland",
    ],
    updated: "2026-11-19",
  },

  {
    slug: "toowoomba",
    name: "Toowoomba",
    postcode: "4350",
    region: "Toowoomba",
    title: "Cash for Cars Toowoomba | A Pickup Over the Range",
    metaDescription:
      "A Toowoomba collection is a booked trip over the range to the address you name. Describe the street, the slope and whether the car rolls.",
    h1: "Cash for Cars Toowoomba",
    hook:
      "Toowoomba sits on the range, a long way west of the coast, so a collection here is a trip to one address rather than a stop around the corner.",
    accessNote:
      "Include the street, whether it is on the escarpment or the flat city grid, and whether the car rolls and steers.",
    localAngle: {
      heading: "One trip up the range, so the first description has to be right",
      body: [
        "Toowoomba's centre, postcode 4350, is the grid of Ruthven Street and Margaret Street, with the railway station on Railway Street and Queens Park a few blocks east. East Toowoomba climbs the escarpment toward Picnic Point. South Toowoomba, North Toowoomba, Newtown and Harristown sit on the flatter top of the range. A truck reaches them from the coast by the Warrego Highway and the Toowoomba bypass, coming through Ipswich on the way.",
        "The drive is long enough that the booking should be loadable in a single visit. A car nose-in on a sloping East Toowoomba driveway, a car in a laneway off Ruthven Street, and a car in a shed near the railway are three different approaches. The escarpment may need a level patch of street to work from. The city grid may only need a gap at the kerb. Say which one you have, so the trip is planned around it.",
        "Also say whether the wheels turn and the steering is free. A vehicle that has stood since last winter can have flat tyres or brakes that will not release, and the gear for that has to ride up the range with the truck. If you still have the keys, say so. If you do not, say that too, in the same note.",
        "Highfields, Withcott and Oakey are nearby towns, and this page does not cover them by mentioning them. An address outside 4350 is confirmed on its own merits. There is no handover point in Toowoomba for you to deliver the car to. The booking is a pickup at the address that was agreed, done by travelling there.",
        "Do not drive a failed car down the range to chase a safety certificate. Queensland gives other paths for an unregistered car and for a registered car sold for parts, and the roadworthy guide sets them out. If the engine itself is the reason the car cannot make a trip, the blown-engine guide is the one to read before you spend money on a repair the car may not be worth.",
      ],
    },
    coverage: [
      "Ruthven Street, Margaret Street and the city grid",
      "The Toowoomba railway station",
      "East Toowoomba and the streets toward Picnic Point",
      "South Toowoomba",
      "North Toowoomba and Newtown",
      "Harristown",
    ],
    nearbyPlaces: ["Highfields", "Withcott", "Oakey"],
    neighbours: ["ipswich"],
    faqs: [
      {
        question: "Why does a Toowoomba enquiry need the slope and the street up front?",
        answer:
          "The truck travels from the coast, over the range, for the address you name. A wrong description, or a car that will not roll, only becomes obvious after that drive. The street, the slope and whether the car moves are part of arranging the trip.",
      },
      {
        question: "The driveway in East Toowoomba is steep and the car has not moved for months. What should I describe?",
        answer:
          "How steep the drive is, whether another vehicle sits below it, and whether the tyres hold air and the wheels turn. A steep escarpment drive can mean moving the car to a level section of street before it is loaded, and that belongs in the plan for the trip.",
      },
      {
        question: "Can I leave the car at a drop-off point in Toowoomba instead?",
        answer:
          "No. There is nowhere in Toowoomba to hand the car over. The arrangement is a pickup at the address you give, reached by travelling there.",
      },
      {
        question: "I live on the coast and the car is at a relative's place in Toowoomba. Who needs to be present?",
        answer:
          "The person selling needs authority to sell, and someone who can show identity and the ownership papers usually needs to be with the car. If you will not be in Toowoomba that day, say so, and name the person who will meet the truck.",
      },
    ],
    guides: ["sell-car-without-roadworthy-qld", "blown-engine-repair-or-sell"],
    updated: "2026-11-19",
  },
];

export function getSuburb(slug: string): Suburb | undefined {
  return suburbs.find((suburb) => suburb.slug === slug);
}

/** Site-relative URL of a suburb page. Slashless, matching its canonical. */
export function suburbPath(slug: string): string {
  return `/cash-for-cars/${slug}`;
}

/**
 * Location URLs that stay retired. Each redirects straight to the homepage.
 *
 * Nine location URLs stay here. Seven are Gold Coast places that still have no
 * page of their own. The other two are Adelaide: that city is in South
 * Australia, not a service area, and publishing a page for it would be a
 * doorway page. Ipswich, Logan and Toowoomba moved out of this list once each
 * had something true to say. Every remaining slug reaches the homepage in a
 * single permanent redirect, in both slash forms, on the apex and on www
 * (see next.config.ts).
 *
 * A slug must not appear both here and in `suburbs` above: the redirect would
 * win and the page could never be reached. check:urls fails on exactly that.
 */
export const retiredSuburbRedirects: Record<string, string> = {
  ashmore: "/",
  "pacific-pines": "/",
  "upper-coomera": "/",
  carrara: "/",
  mudgeeraba: "/",
  "varsity-lakes": "/",
  "palm-beach": "/",
  "cash-for-cars-adelaide": "/",
  adelaide: "/",
};
