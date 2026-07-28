/**
 * Location pages.
 *
 * The WordPress site had 19 of these and they were spun from one template —
 * median 45% of sentences identical between any two pages once the suburb name
 * was swapped out, worst pair 93%. Google treats that as doorway pages and
 * suppresses the whole domain.
 *
 * The rule for this file: if a paragraph could be copy-pasted to another
 * suburb by changing the place name, it does not belong here. Every page below
 * leads with something that is only true of that location.
 *
 * Anything marked NEEDS OWNER INPUT is a placeholder that must be replaced
 * with something real before launch. Don't invent these — a fabricated
 * testimonial is worse than no testimonial.
 */

export type SuburbFaq = { question: string; answer: string };

export type Suburb = {
  slug: string;
  name: string;
  /** Region label used in breadcrumbs and copy. */
  region: string;
  postcode: string;
  /** Unique <title>. Keep under 60 chars where possible. */
  title: string;
  /** Unique meta description. Never reuse across pages. */
  metaDescription: string;
  h1: string;
  /** One-sentence hook shown under the H1. Must be location-specific. */
  hook: string;
  /** Public pickup-availability note; do not imply a fixed depot location. */
  pickupNote: string;
  /** The genuinely local angle. This is what stops the page being a duplicate. */
  localAngle: { heading: string; body: string[] };
  /** Streets and landmarks we actually cover. Signals real local knowledge. */
  coverage: string[];
  /** Neighbouring suburbs handled from the same run. */
  nearby: string[];
  /** At least two of these must be unique to the suburb. */
  faqs: SuburbFaq[];
  /** NEEDS OWNER INPUT — real customer, first name and suburb only. */
  testimonial?: { quote: string; author: string };
};

export const suburbs: Suburb[] = [
  {
    slug: "southport",
    name: "Southport",
    region: "Gold Coast",
    postcode: "4215",
    title: "Cash For Cars Southport — Same-Day Pickup, Free Removal",
    metaDescription:
      "Selling a car in Southport? We pay cash on the spot and tow it free — from Australia Fair carparks to Ferry Road units. Call for a quote in a minute.",
    h1: "Cash for Cars Southport",
    hook:
      "The Gold Coast's busiest suburb, and the one where we do the most high-rise and rental-property pickups.",
    pickupNote: "Same-day pickup is often available in Southport",
    localAngle: {
      heading: "Why Southport pickups are different",
      body: [
        "Southport is the Gold Coast's civic and commercial centre, and its housing is a mix that shows up in the cars we buy — older post-war homes around Nerang Street and Scarborough Street, dense unit blocks off Ferry Road, and student and hospital-worker rentals near the Gold Coast University Hospital and Griffith campuses.",
        "That mix means a lot of our Southport jobs are cars left behind at rental changeovers: a tenant moves out, the car doesn't start, and the agent or the next tenant needs it gone. We handle those regularly, and we can work with a property manager rather than the registered owner as long as the ownership paperwork stacks up.",
        "The other Southport quirk is access. Plenty of unit blocks here have basement carparks with clearance bars, and the G:link light rail down the Gold Coast Highway makes some kerbside pickups tight. Tell us where the car actually sits when you call — basement, visitor bay, on-street — and we'll send the right truck rather than turning up with the wrong one.",
      ],
    },
    coverage: [
      "Ferry Road and the surrounding unit blocks",
      "Nerang Street and Scarborough Street",
      "Australia Fair and the CBD carparks",
      "Broadwater Parklands and the Spit end",
      "Gold Coast University Hospital precinct",
      "Southport Central and the light rail corridor",
    ],
    nearby: ["Labrador", "Ashmore", "Main Beach", "Molendinar", "Parkwood"],
    faqs: [
      {
        question: "Can you get a car out of a basement carpark in Southport?",
        answer:
          "Usually, yes. Most Southport unit blocks have a clearance bar around 2.1 metres, which rules out a conventional tilt tray. We use a low-profile trolley to winch the car out to street level and load it there. Let us know the building and the level when you book so we bring the right gear.",
      },
      {
        question: "I'm a property manager with a car abandoned at a Southport rental. Can you take it?",
        answer:
          "We can, but not on the spot. Queensland has a defined process for goods left behind at the end of a tenancy, and we need to see that it's been followed before we can remove and pay for a vehicle. Call us and we'll tell you exactly what we need — it's usually straightforward.",
      },
      {
        question: "Do you buy cars from the hospital and university precinct?",
        answer:
          "Often. A lot of our Southport pickups are staff and students leaving at the end of a contract or semester who need the car gone before they fly out. If you're on a deadline, say so when you call — we can usually get to Southport the same day.",
      },
      {
        question: "How much will you pay for my car in Southport?",
        answer:
          "It depends on the make, model, year, condition and whether it's complete. We quote over the phone in about a minute and the number we give you is the number you get — we don't drop the price when the truck arrives.",
      },
    ],
    // testimonial: NEEDS OWNER INPUT
  },

  {
    slug: "surfers-paradise",
    name: "Surfers Paradise",
    region: "Gold Coast",
    postcode: "4217",
    title: "Cash For Cars Surfers Paradise — We Come To Your Building",
    metaDescription:
      "Leaving the country or moving out of a Surfers high-rise? We buy your car, pay cash and handle the tow from basement carparks. Fast quotes, same-day pickup.",
    h1: "Cash for Cars Surfers Paradise",
    hook:
      "Where most of our sellers are on a deadline — a flight, a lease ending, or a car they can't take with them.",
    pickupNote: "Timed pickup can be arranged around your move or flight",
    localAngle: {
      heading: "Selling a car when you're on a deadline",
      body: [
        "Surfers Paradise runs on short stays. Working-holiday visas, seasonal hospitality contracts, six-month leases in the towers along the Esplanade and Orchid Avenue. The result is a steady supply of cars that need to be gone by a specific date, often before a flight.",
        "That changes what matters. In most suburbs people want the highest possible price. Here, more often, people want certainty — a firm number and a confirmed pickup time so they can plan around it. We'll give you both on the phone, and if your date is tight, tell us up front and we'll book it in rather than leaving it open.",
        "Practically, almost every pickup in Surfers is a building pickup. Cavill Avenue and the Esplanade towers have basement parking with height restrictions and, in some buildings, a booking system for the loading dock. If you can tell us the building name and whether visitors need a pass, we'll sort access before we arrive instead of sitting in the driveway calling building management.",
      ],
    },
    coverage: [
      "Esplanade and Northcliffe towers",
      "Cavill Avenue and Orchid Avenue",
      "Ferny Avenue and the Chevron Island approach",
      "Surfers Paradise Boulevard",
      "Budds Beach and the river side",
      "Chevron Island and Cypress Avenue",
    ],
    nearby: ["Main Beach", "Broadbeach", "Chevron Island", "Bundall", "Isle of Capri"],
    faqs: [
      {
        question: "I'm flying out next week. How fast can you pick the car up?",
        answer:
          "Tell us the date when you call and we'll lock in a time before it. Same-day is often possible in Surfers if you ring in the morning. Bring your ID and the registration papers to the pickup and you'll be paid before we load.",
      },
      {
        question: "My car is in a building basement with a height limit. Is that a problem?",
        answer:
          "No, it's routine here. Most Surfers towers have clearance bars under 2.2 metres. We winch the car up to street level on a low trolley and load it on the road. If your building requires a loading-dock booking, let us know the building name and we'll arrange it.",
      },
      {
        question: "Can I sell a car that's registered in another state?",
        answer:
          "Yes. Interstate registration is common here and it doesn't stop the sale — we just need the registration certificate and photo ID matching the registered owner. We'll walk you through the transfer paperwork at pickup.",
      },
      {
        question: "Do you buy cars that have been sitting unregistered in a carpark?",
        answer:
          "Yes. Unregistered, flat battery, four flat tyres, hasn't moved in a year — none of that stops us buying it. We tow it either way, so it doesn't need to start or drive.",
      },
    ],
  },

  {
    slug: "robina",
    name: "Robina",
    region: "Gold Coast",
    postcode: "4226",
    title: "Cash For Cars Robina — Free Pickup From Your Driveway",
    metaDescription:
      "Cash for cars in Robina with free removal from your driveway or garage. Family second cars, student cars, unregistered runabouts — we buy them all.",
    h1: "Cash for Cars Robina",
    hook:
      "A newer, planned suburb — which means most of our Robina pickups are straightforward driveway jobs.",
    pickupNote: "Driveway pickups are often available the same day",
    localAngle: {
      heading: "The easiest pickups on the Gold Coast",
      body: [
        "Robina was master-planned from the 1980s onward, and it shows in the jobs we do here. Wide streets, off-street parking, double garages, generous driveways. Compared with a basement pickup in Surfers or a kerbside job on a light-rail corridor in Southport, a Robina removal is usually the simplest kind — reverse the truck up the driveway, winch, done.",
        "The cars themselves skew a particular way too. Robina is a family suburb built around Robina Town Centre, Robina Hospital and the train station, so a lot of what we buy is the third car: the one that was going to be fixed, or the one a kid drove until they moved out. Often it's mechanically dead but cosmetically fine, which people assume is worthless. It usually isn't — a complete car with good panels and glass is worth more than most owners expect.",
        "We also see a seasonal pattern around Bond University in neighbouring Varsity Lakes. Semester endings bring a run of students selling cheap runabouts before leaving the country, and we handle those the same day where we can.",
      ],
    },
    coverage: [
      "Robina Town Centre and surrounds",
      "Robina Hospital precinct",
      "Cheltenham Drive and Robina Parkway",
      "Clear Island Waters and Merrimac side",
      "Robina train station area",
      "Easy T Centre and Scottsdale Drive",
    ],
    nearby: ["Varsity Lakes", "Mudgeeraba", "Merrimac", "Clear Island Waters", "Carrara"],
    faqs: [
      {
        question: "My car runs fine, I just don't need it. Is it worth selling to you?",
        answer:
          "It might be, and it might not — we'll tell you honestly. A running, registered car in good order will usually fetch more through a private sale if you have the time and patience for it. Where we're the better option is when you want it gone this week without inspections, tyre-kickers and no-shows.",
      },
      {
        question: "The car is in my garage and hasn't started in years. Can you still get it?",
        answer:
          "Yes. Robina garages are generally easy access. We winch non-runners out with a cable — you don't need to move it, start it, or even find the keys, though the keys do help.",
      },
      {
        question: "I'm a Bond University student leaving the country. What do I need?",
        answer:
          "Photo ID and the registration certificate, and you need to be the registered owner. If the car is registered to a friend or a previous owner never transferred it, call us before booking — it's fixable, but not at the roadside.",
      },
      {
        question: "Do you buy cars with a hail-damaged roof and bonnet?",
        answer:
          "Yes. Hail write-offs are common across the southern Gold Coast and we buy them regularly. Panel damage lowers the price but rarely to zero, because the drivetrain and interior are usually untouched.",
      },
    ],
  },

  {
    slug: "burleigh-heads",
    name: "Burleigh Heads",
    region: "Gold Coast",
    postcode: "4220",
    title: "Cash For Cars Burleigh Heads — Salt-Damaged Cars Welcome",
    metaDescription:
      "Beachside cars rust from underneath. We buy corroded, salt-damaged and unroadworthy cars in Burleigh Heads for cash, with free same-day removal.",
    h1: "Cash for Cars Burleigh Heads",
    hook:
      "Where the salt air does more damage than the odometer — and where most owners don't realise until the roadworthy fails.",
    pickupNote: "Same-day pickup is often available when you call early",
    localAngle: {
      heading: "What living near the beach does to a car",
      body: [
        "Burleigh Heads is a few hundred metres of sand and headland away from constant salt spray, and cars parked outside here age differently from cars parked five kilometres inland. Corrosion starts underneath — subframes, brake and fuel lines, suspension mounts, the seams under the sills — long before anything shows on the paint.",
        "The practical consequence is that a lot of Burleigh cars fail a roadworthy inspection on structural rust, and the repair quote comes back higher than the car is worth. That's the point at which most people call us. If a mechanic has just told you the chassis rails are gone, the car is not worthless — the engine, transmission, panels, glass and catalytic converter still have value, and we price on that.",
        "It's a mixed housing area too, from original beach shacks in the older streets off James Street to newer apartments along the Gold Coast Highway, so we do both driveway pickups and unit-block removals here. Either way, the tow is free and we don't charge extra for a car that can't roll.",
      ],
    },
    coverage: [
      "James Street and the village centre",
      "Gold Coast Highway apartments",
      "Burleigh Heads National Park side streets",
      "West Burleigh and Reedy Creek Road",
      "Tallebudgera Creek end",
      "Miami and North Burleigh border",
    ],
    nearby: ["Miami", "Palm Beach", "Varsity Lakes", "Mermaid Waters", "Tallebudgera"],
    faqs: [
      {
        question: "My car just failed a roadworthy on rust. Is it still worth anything?",
        answer:
          "Almost always. Structural rust ends a car's road life but doesn't touch the parts that hold most of the value — engine, gearbox, catalytic converter, panels, glass, wheels and battery. Tell us what the inspector wrote and we'll give you a number over the phone.",
      },
      {
        question: "Do you pay less for a beachside car because of corrosion?",
        answer:
          "It's one factor among several, and we'd rather be upfront than surprise you. Heavy underbody corrosion reduces what the shell is worth as recoverable steel and can make some parts harder to remove. It rarely changes the value of the drivetrain, which is usually the biggest single component of the quote.",
      },
      {
        question: "Can you pick up from a narrow street near the national park?",
        answer:
          "Yes, but tell us when you book. Some of the older streets on the headland side are tight and a few have no room to turn a full-size tilt tray. We'll send a smaller truck or arrange to winch the car to a wider street.",
      },
      {
        question: "Will you buy a surf-worn ute or van full of sand and gear?",
        answer:
          "Yes. You don't need to detail it. Clear out anything you want to keep — check under seats and in door pockets — and we'll take it as it sits.",
      },
    ],
  },
];

export function getSuburb(slug: string): Suburb | undefined {
  return suburbs.find((s) => s.slug === slug);
}

/**
 * Retired location pages → where each one now redirects.
 *
 * These 13 URLs existed on WordPress and were near-duplicates of the pages
 * above. Every one gets a 301 to the nearest surviving page (see next.config.ts)
 * so the little link equity they had is preserved rather than 404'd.
 */
export const retiredSuburbRedirects: Record<string, string> = {
  ashmore: "/cash-for-cars/southport",
  labrador: "/cash-for-cars/southport",
  "pacific-pines": "/cash-for-cars/southport",
  "upper-coomera": "/cash-for-cars/southport",
  helensvale: "/cash-for-cars/southport",
  carrara: "/cash-for-cars/robina",
  nerang: "/cash-for-cars/robina",
  mudgeeraba: "/cash-for-cars/robina",
  "varsity-lakes": "/cash-for-cars/robina",
  "mermaid-waters": "/cash-for-cars/burleigh-heads",
  "palm-beach": "/cash-for-cars/burleigh-heads",
  logan: "/cash-for-cars",
  ipswich: "/cash-for-cars",
  toowoomba: "/cash-for-cars",
  "cash-for-cars-adelaide": "/",
};
