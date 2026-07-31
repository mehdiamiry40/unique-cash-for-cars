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
  {
    slug: "labrador",
    name: "Labrador",
    region: "Gold Coast",
    postcode: "4215",
    title: "Cash For Cars Labrador — Long-Held And Estate Cars",
    metaDescription:
      "Labrador's older housing means cars that have sat in one driveway for decades. We buy them as they are, work through estate paperwork, and tow free.",
    h1: "Cash for Cars Labrador",
    hook:
      "The Broadwater's older, more affordable side — and where the cars we buy have usually had one owner for a very long time.",
    pickupNote: "Driveway and kerbside collection across Labrador",
    localAngle: {
      heading: "Why Labrador cars have usually been there a while",
      body: [
        "Labrador is one of the older parts of the northern Gold Coast, and its housing shows it: post-war cottages and brick-and-tile from the 1960s and 70s along the streets running back from Marine Parade, with unit blocks and newer infill closer to Brisbane Road and Harbour Town. It has stayed more affordable than the beachfront suburbs south of it, which means a lot of long-term owners rather than short-term renters.",
        "That changes what turns up. Where a Surfers pickup is often a car someone owned for six months, a Labrador car has frequently been in the same driveway since it was new. It is complete, it has service history somewhere in a drawer, and it stopped being driven at a specific point — a licence surrendered, a move into care, a family member who died. Completeness is the single biggest factor in what a dismantler pays, so these cars are frequently worth more than their owners assume from the dust on them.",
        "The other consequence is paperwork. A disproportionate share of our Labrador work is estate and downsizing vehicles, where the registered owner is not the person arranging the sale. That is entirely workable, but it needs the right documents in hand before a truck is booked rather than discovered at the kerb.",
      ],
    },
    coverage: [
      "Marine Parade and the Broadwater foreshore",
      "Brisbane Road and the Harbour Town approach",
      "Frank Street and the older residential grid",
      "Turpin Road and Muriel Avenue",
      "Labrador State School precinct",
      "Billabirra and the Biggera Creek end",
    ],
    nearby: ["Biggera Waters", "Southport", "Runaway Bay", "Arundel", "Parkwood"],
    faqs: [
      {
        question: "The car belonged to a relative who has died. Can I sell it?",
        answer:
          "Yes, with the right documentation — normally the death certificate plus evidence you are the executor or administrator, along with your own photo ID. Requirements vary with how the estate is structured. Ring us before booking a collection and we will tell you exactly what to have ready.",
      },
      {
        question: "It hasn't been driven in eight years. Is it worth anything?",
        answer:
          "Almost certainly. Time off the road affects tyres, fluids and the battery, none of which drive the value much. What matters is whether the engine, transmission, panels and catalytic converter are still on it. A complete car that has sat is worth considerably more than a running car that has been stripped.",
      },
      {
        question: "Do you collect from the older streets near the Broadwater?",
        answer:
          "Yes. The residential grid running back from Marine Parade is straightforward for a tilt tray — narrower than the newer estates, but with room to work. If your car is on a tight corner block or boxed in behind another vehicle, mention it when you book so we bring skates.",
      },
      {
        question: "Can you take a car that is registered to someone else?",
        answer:
          "Not as it stands. If a previous owner never completed the transfer, the registration record still points at them and there is nothing for you to sign. It is usually fixable, but it has to be sorted before collection day rather than at the roadside.",
      },
    ],
    // testimonial: NEEDS OWNER INPUT
  },

  {
    slug: "nerang",
    name: "Nerang",
    region: "Gold Coast",
    postcode: "4211",
    title: "Cash For Cars Nerang — Acreage And Yard Pickups",
    metaDescription:
      "Nerang runs from light industry to hinterland acreage. We collect from unsealed driveways, sheds and work yards, pay cash on the spot and tow it free.",
    h1: "Cash for Cars Nerang",
    hook:
      "Inland and industrial — the part of the Gold Coast where the car is more often behind a shed than in a driveway.",
    pickupNote: "Acreage and unsealed access is routine in Nerang",
    localAngle: {
      heading: "Off the coast strip, the job changes",
      body: [
        "Nerang sits inland at the M1 interchange, and it is the point where the Gold Coast stops being a beach city. East of the highway it is established residential; west of it the blocks get larger and run up toward the hinterland at Advancetown and Beechmont. In between are the light industrial estates along Nerang-Southport Road and Lawrence Drive.",
        "Each of those produces a different kind of vehicle. The industrial estates give us trade utes, vans and fleet vehicles at end of life, often unregistered and parked behind a workshop for a year. The acreage blocks give us project cars, second and third vehicles, farm-use utes and the occasional trailer, usually on grass or gravel rather than concrete. Neither is a problem, but both need the right truck.",
        "Access is the thing worth mentioning when you call. A loaded tilt tray is heavy, and a long unsealed driveway that has just had rain will not always hold one — we would rather winch from the road than sink a truck on your property. Nerang also has genuine flood history along the river, so if a car has been through water, say so up front: it changes what is recoverable and we would rather price it accurately than revise on arrival.",
      ],
    },
    coverage: [
      "Nerang-Southport Road and the industrial estates",
      "Lawrence Drive and Spencer Road",
      "Nerang town centre and the railway station",
      "Highland Park and Pacific Pines side",
      "Acreage toward Advancetown and the hinterland",
      "Carrara and the Nerang River flats",
    ],
    nearby: ["Carrara", "Highland Park", "Pacific Pines", "Ashmore", "Molendinar"],
    faqs: [
      {
        question: "The car is on acreage down a dirt track. Can you still get it?",
        answer:
          "Usually, yes — it is routine out this way. What we need to know is the length and surface of the track and whether it has been wet, because a loaded truck can bog where an empty one drives out fine. If in doubt we winch from the sealed road instead, which costs you nothing extra.",
      },
      {
        question: "Do you buy work utes and vans from a business?",
        answer:
          "Yes. End-of-life trade vehicles and light commercials are a steady part of what we collect around the Nerang industrial estates. If the vehicle is owned by a company rather than an individual, tell us when you call — the paperwork differs slightly and we will confirm what is needed.",
      },
      {
        question: "My car went through the flood. Is it a write-off to you?",
        answer:
          "Not automatically, but water changes the maths. Depth and duration matter more than anything: a car that took water through the interior and electrics is worth less than one that had a wet floor pan. Tell us honestly how deep it got and we will price it on that rather than guessing.",
      },
      {
        question: "Can you take a half-finished project car and its parts?",
        answer:
          "The car, yes — including one that has been apart for years. Loose parts we will discuss when you call, because a shed full of components is a different job from a rolling shell. Be aware that a stripped car is worth substantially less than a complete one, which is worth knowing before you sell anything off it separately.",
      },
    ],
    // testimonial: NEEDS OWNER INPUT
  },

  {
    slug: "helensvale",
    name: "Helensvale",
    region: "Gold Coast",
    postcode: "4212",
    title: "Cash For Cars Helensvale — Free Pickup, Cash Paid",
    metaDescription:
      "Helensvale is the northern transport interchange, and a household's second car goes redundant fast once the commute moves to rail. We buy it and tow free.",
    h1: "Cash for Cars Helensvale",
    hook:
      "Where the heavy rail and the light rail meet — and where a second car quietly stops earning its keep.",
    pickupNote: "Estate and body-corporate access arranged in Helensvale",
    localAngle: {
      heading: "The suburb where a second car stops being necessary",
      body: [
        "Helensvale is the northern Gold Coast's transport hub. The heavy rail line to Brisbane, the northern terminus of the G:link light rail and a large park-and-ride all meet here, alongside Westfield Helensvale and the corridor running out to the theme parks at Oxenford and Coomera.",
        "That produces a specific kind of sale. Households here often ran two cars because both adults drove to work; once one of them switches to the train, the second car does progressively less until it is doing nothing but depreciating and costing registration. It is usually mechanically fine and cosmetically tidy, which is exactly the case where we will tell you to sell privately if you have the patience for it — you will get more. Where we are the better answer is when you want it gone this month without listings and no-shows.",
        "Practically, Helensvale is mostly 1990s and 2000s estate housing, which means wide streets and real driveways — easy collections. The wrinkle is that a fair number of those estates are gated or under body corporate management, and visitor access is not always automatic. If your street has a boom gate or a resident code, tell us when you book and we will sort access before the truck is on its way rather than sitting outside it.",
      ],
    },
    coverage: [
      "Helensvale station and the park-and-ride precinct",
      "Westfield Helensvale and Hope Island Road",
      "Lindfield Road and the surrounding estates",
      "Monterey Keys and Sanctuary Cove approach",
      "Gated estates off Discovery Drive",
      "Oxenford and the theme park corridor",
    ],
    nearby: ["Oxenford", "Coomera", "Hope Island", "Pacific Pines", "Upper Coomera"],
    faqs: [
      {
        question: "My estate has a security gate. How does that work?",
        answer:
          "Tell us the estate name and how visitors normally get in when you book. Some need a resident to call the truck through, others need the body corporate notified in advance. It takes one phone call to arrange and it saves a wasted trip, which is the whole reason we ask.",
      },
      {
        question: "The car runs fine, we just don't need two any more. Should I sell it to you?",
        answer:
          "Honestly, maybe not. A registered, roadworthy, reasonably modern car will fetch more in a private sale if you are willing to photograph it, list it and deal with buyers for a few weeks. We are the better option when you want certainty and speed instead — a firm number now and the car gone on a date you choose.",
      },
      {
        question: "Do you collect from the theme park corridor and Oxenford?",
        answer:
          "Yes, that whole northern corridor is on our regular run, along with Coomera and Upper Coomera. If you are just outside Helensvale it makes no difference to the price and the removal is still free.",
      },
      {
        question: "Can I sell a car registered in another state?",
        answer:
          "Yes. Interstate registration is common in this part of the coast and it does not stop the sale. We need the registration certificate and photo ID matching the registered owner, and we will walk you through the transfer paperwork at collection.",
      },
    ],
    // testimonial: NEEDS OWNER INPUT
  },

  {
    slug: "mermaid-waters",
    name: "Mermaid Waters",
    region: "Gold Coast",
    postcode: "4218",
    title: "Cash For Cars Mermaid Waters — Canal Estate Pickup",
    metaDescription:
      "Canal cul-de-sacs, narrow frontages and a boat trailer in the way. We size the truck to the street in Mermaid Waters, and the removal is always free.",
    h1: "Cash for Cars Mermaid Waters",
    hook:
      "Canal estates where getting the truck to the car is more of a puzzle than the car itself.",
    pickupNote: "We match the truck to the street in Mermaid Waters",
    localAngle: {
      heading: "In the canal streets, access is the whole job",
      body: [
        "Mermaid Waters was cut and filled as canal estate through the 1970s and 80s, and the street pattern still reflects it: long fingers of waterfront blocks ending in cul-de-sacs, with narrow frontages and not much room to turn anything large around. It sits between the Gold Coast Highway and Nerang Road, close to Q Super Centre and a short run from Mermaid Beach and Nobby Beach.",
        "For us that means the constraint here is rarely the vehicle. It is the approach. A full-size tilt tray needs somewhere to stop, load and get out again, and a waterfront cul-de-sac with cars parked both sides does not always offer that. It is solvable — a smaller truck, or winching the car out to a wider street — but only if we know before we set off.",
        "The other Mermaid Waters constant is that driveways here are busy. Boats, trailers, caravans and jet skis occupy a lot of the off-street space, and the car we are collecting is frequently the thing parked behind all of them. If yours needs something moved first, or has not turned a wheel in long enough that the brakes have seized, mention it — we bring skates for exactly that and it is a five-minute problem rather than a wasted booking.",
      ],
    },
    coverage: [
      "The canal cul-de-sacs off Sunshine Boulevard",
      "Markeri Street and Bermuda Street",
      "Q Super Centre and Hooker Boulevard",
      "Clear Island Waters border",
      "Mermaid Beach and Nobby Beach side",
      "Nerang Road and the Gold Coast Highway approach",
    ],
    nearby: ["Broadbeach Waters", "Clear Island Waters", "Mermaid Beach", "Miami", "Robina"],
    faqs: [
      {
        question: "My street is a narrow cul-de-sac. Can a tow truck actually get in?",
        answer:
          "Usually yes, but tell us the street when you book. Some of the canal fingers here have no room to turn a full-size tilt tray, particularly with cars parked both sides. We either send something smaller or winch the car out to a wider road — either way it is free and it is our problem, not yours.",
      },
      {
        question: "The car is blocked in behind a boat and a trailer. Is that a problem?",
        answer:
          "Only if we find out on arrival. If the boat can be moved on the day, say so and we will time it. If it cannot, we will usually still get the car out with skates, but we need to bring them. It is a two-minute conversation when you book and it saves a repeat visit.",
      },
      {
        question: "Do you buy boat trailers or camper trailers as well?",
        answer:
          "Trailers, yes. Boats and jet skis we assess case by case rather than quoting blind — send a photo and tell us roughly what condition it is in, and we will give you a straight answer about whether it is worth us collecting.",
      },
      {
        question: "The brakes have seized and it will not roll. Now what?",
        answer:
          "Completely routine, particularly for a car that has sat on a driveway for a few years. We use skates to get a non-rolling car onto the truck. It does not need to start, steer or roll, and there is no extra charge for any of that.",
      },
    ],
    // testimonial: NEEDS OWNER INPUT
  },
];

export function getSuburb(slug: string): Suburb | undefined {
  return suburbs.find((s) => s.slug === slug);
}

/** Slugify a place name the same way our suburb URLs are formed. */
function placeSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Best internal URL for a place name used in nearby/coverage copy.
 *
 * Live suburbs win; retired suburb redirects are next (so Ashmore etc. still
 * pass equity to a surviving page); unknown places return null and stay text.
 */
export function hrefForPlace(name: string): string | null {
  const slug = placeSlug(name);
  if (!slug) return null;

  const live = suburbs.find((s) => s.slug === slug || placeSlug(s.name) === slug);
  if (live) return `/cash-for-cars/${live.slug}`;

  return retiredSuburbRedirects[slug] ?? null;
}

/**
 * Retired location pages → where each one now redirects.
 *
 * These URLs existed on WordPress and were near-duplicates of the pages above.
 * Each gets a 301 to the nearest surviving page (see next.config.ts) so the
 * little link equity they had is preserved rather than 404'd.
 *
 * Removing an entry here is how a retired suburb is promoted back to a real
 * page: write it into `suburbs` above, delete its redirect, and check:urls
 * will confirm the URL now resolves instead of bouncing. Leaving both in place
 * builds a page nobody can reach — the redirect wins — and check:urls fails on
 * exactly that.
 */
export const retiredSuburbRedirects: Record<string, string> = {
  ashmore: "/cash-for-cars/southport",
  "pacific-pines": "/cash-for-cars/southport",
  "upper-coomera": "/cash-for-cars/southport",
  carrara: "/cash-for-cars/robina",
  mudgeeraba: "/cash-for-cars/robina",
  "varsity-lakes": "/cash-for-cars/robina",
  "palm-beach": "/cash-for-cars/burleigh-heads",
  logan: "/cash-for-cars",
  ipswich: "/cash-for-cars",
  toowoomba: "/cash-for-cars",
  "cash-for-cars-adelaide": "/",
  // Short form people (and some crawlers) guess; the WP slug was the longer one.
  adelaide: "/",
};
