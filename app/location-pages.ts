type LocalPage = {
  name: string;
  nearby: string[];
  intro: string;
  logistics: string;
  valuation: string;
  faqQuestion: string;
  faqAnswer: string;
};

export const localPages: Record<string, LocalPage> = {
  "/cash-for-cars/ashmore/": {
    name: "Ashmore",
    nearby: ["Southport", "Benowa", "Molendinar"],
    intro:
      "Ashmore owners often need a practical way to clear a second car, an unregistered vehicle or a damaged car without arranging transport themselves. Our team organises the quote and collection together, so you know the offer and pickup plan before accepting.",
    logistics:
      "Tell us whether the vehicle is in a driveway, garage, workplace or body-corporate parking area. That detail helps us send the right collection vehicle and plan access without unnecessary delays.",
    valuation:
      "The offer is based on the vehicle itself: make, model, age, condition, completeness and recoverable parts. Photos can help us confirm the details quickly, especially when a car has collision or mechanical damage.",
    faqQuestion: "Can you collect a car from an Ashmore unit complex?",
    faqAnswer:
      "Yes, subject to safe access and any body-corporate rules. Let us know about height limits, gates or restricted loading areas when requesting the quote.",
  },
  "/cash-for-cars/carrara/": {
    name: "Carrara",
    nearby: ["Nerang", "Merrimac", "Broadbeach Waters"],
    intro:
      "Whether the car stopped running at home or is taking up room at a Carrara workplace, the next step should be straightforward. We assess the vehicle from the information you provide and arrange removal after you accept the offer.",
    logistics:
      "Carrara pickups can involve residential driveways, commercial properties and shared parking. A short description of the vehicle’s location, steering and rolling condition lets the collection team prepare properly.",
    valuation:
      "Running cars, incomplete projects and vehicles with accident damage are assessed differently. Honest details about keys, wheels, major missing parts and registration status help produce a reliable quote rather than a vague estimate.",
    faqQuestion: "Does a Carrara vehicle need to be running?",
    faqAnswer:
      "No. Non-running vehicles can be collected when the site is safely accessible. Explain the condition and access when you contact us so suitable equipment can be arranged.",
  },
  "/cash-for-cars/helensvale/": {
    name: "Helensvale",
    nearby: ["Oxenford", "Arundel", "Pacific Pines"],
    intro:
      "A vehicle that is no longer worth repairing can quickly become a storage problem. Helensvale customers can request an upfront assessment for used, damaged, unwanted or scrap vehicles and organise collection without advertising to private buyers.",
    logistics:
      "Before pickup, remove personal belongings and gather any available ownership information and keys. If the car is parked behind another vehicle or in a restricted space, mention that early so the collection can be planned.",
    valuation:
      "Useful details include the exact model, build year, kilometres, visible damage and whether the engine and transmission are complete. These facts help us value reusable components and recyclable material consistently.",
    faqQuestion: "How quickly can collection be arranged in Helensvale?",
    faqAnswer:
      "Availability depends on the vehicle, access and the day’s collection schedule. Once the quote is accepted, we will offer the earliest suitable collection window.",
  },
  "/cash-for-cars/mermaid-waters/": {
    name: "Mermaid Waters",
    nearby: ["Broadbeach", "Miami", "Robina"],
    intro:
      "Selling an unwanted vehicle privately can mean repeated messages, inspections and uncertain offers. In Mermaid Waters, we provide a direct assessment and coordinate removal once the vehicle details and access are confirmed.",
    logistics:
      "Narrow driveways, underground parking and visitor-parking rules can affect collection. Share any access limitations and the approximate clearance before booking so we can confirm whether the pickup setup is suitable.",
    valuation:
      "A complete vehicle with keys may be valued differently from a dismantled or heavily damaged one. Photos of the exterior, interior and engine area are useful when the condition is difficult to describe by phone.",
    faqQuestion: "Can you remove a car from underground parking?",
    faqAnswer:
      "Sometimes, but clearance and access must be checked first. Provide the height limit, ramp conditions and whether the vehicle rolls so the team can assess the safest option.",
  },
  "/cash-for-cars/mudgeeraba/": {
    name: "Mudgeeraba",
    nearby: ["Worongary", "Tallai", "Robina"],
    intro:
      "Mudgeeraba properties can have sloping driveways, acreage access or vehicles parked away from the street. We ask about those conditions at the quote stage so collection is based on the real location, not assumptions.",
    logistics:
      "Firm ground, gate width and turning space are important for a safe pickup. If the vehicle is off the driveway, has locked wheels or cannot steer, describe that clearly before a collection time is agreed.",
    valuation:
      "We assess cars, four-wheel drives, utes and light commercial vehicles in many conditions. The offer reflects identifiable vehicle details, damage, missing components and the likely recovery value.",
    faqQuestion: "Can you collect from an acreage property near Mudgeeraba?",
    faqAnswer:
      "Potentially, when access and ground conditions are safe. Photos of the driveway and vehicle position can help us check the collection requirements before booking.",
  },
  "/cash-for-cars/nerang/": {
    name: "Nerang",
    nearby: ["Carrara", "Highland Park", "Molendinar"],
    intro:
      "From older commuter cars to damaged utes and work vehicles, Nerang owners need a clear offer and a collection plan that fits the vehicle’s condition. We handle both parts in one enquiry.",
    logistics:
      "Let us know if the vehicle is at a workshop, business yard or residential property. Site opening hours, key availability and whether the vehicle rolls can all influence the most practical pickup window.",
    valuation:
      "We do not value every vehicle by age alone. Model demand, overall condition, major mechanical components and recyclable material are considered together before an offer is confirmed.",
    faqQuestion: "Can you collect directly from a Nerang repair workshop?",
    faqAnswer:
      "Yes, with the workshop’s permission and a suitable collection arrangement. Provide the business contact and vehicle location when requesting the quote.",
  },
  "/cash-for-cars/pacific-pines/": {
    name: "Pacific Pines",
    nearby: ["Gaven", "Arundel", "Oxenford"],
    intro:
      "When a family vehicle is replaced or repair costs no longer make sense, keeping the old car in a Pacific Pines driveway is rarely useful. A direct quote and planned removal offer a simpler alternative to private advertising.",
    logistics:
      "Residential streets and sloped driveways require accurate access information. Tell us where the car is parked and whether it starts, steers and rolls so the collection can be scheduled safely.",
    valuation:
      "The quote considers the make, model, year, kilometres, damage and whether important parts remain with the car. Clear photographs reduce uncertainty and can speed up assessment.",
    faqQuestion: "What should I prepare before a Pacific Pines pickup?",
    faqAnswer:
      "Remove personal property, locate any keys and ownership documents, and make the vehicle accessible where possible. We will explain any additional requirements when confirming collection.",
  },
  "/cash-for-cars/palm-beach/": {
    name: "Palm Beach",
    nearby: ["Currumbin", "Elanora", "Burleigh Heads"],
    intro:
      "Limited parking can make an unused vehicle particularly inconvenient in Palm Beach. We help owners move on damaged, ageing and unwanted cars with a confirmed assessment and an agreed collection window.",
    logistics:
      "If the car is in a basement, narrow side access or a busy shared area, provide those details before booking. Safe loading space and clearance determine what collection approach is possible.",
    valuation:
      "Salt exposure, body damage, mechanical faults and incomplete service history do not automatically prevent an offer. Describe the actual condition so the assessment reflects the vehicle that will be collected.",
    faqQuestion: "Can you collect from a busy Palm Beach street?",
    faqAnswer:
      "Collection depends on having a legal and safe loading position. We may ask you to move the vehicle to a suitable accessible location before the scheduled pickup.",
  },
  "/cash-for-cars/robina/": {
    name: "Robina",
    nearby: ["Varsity Lakes", "Merrimac", "Mudgeeraba"],
    intro:
      "Robina customers often contact us after upgrading a vehicle, receiving a costly repair estimate or needing to clear parking quickly. We provide a direct path from vehicle assessment to organised removal.",
    logistics:
      "Apartment parking and managed commercial sites may require access approval. Share gate, clearance and loading information with us in advance rather than waiting until the collection vehicle arrives.",
    valuation:
      "Accurate make, model, year and condition information produces the most useful quote. We also consider whether the car is complete, has keys and can be moved safely.",
    faqQuestion: "Do I need body-corporate approval for collection in Robina?",
    faqAnswer:
      "That depends on the property’s rules. The vehicle owner is responsible for arranging site permission and a safe collection area before pickup.",
  },
  "/cash-for-cars/southport/": {
    name: "Southport",
    nearby: ["Labrador", "Ashmore", "Main Beach"],
    intro:
      "Southport’s mix of apartments, workshops and commercial parking means every vehicle collection has different access requirements. We confirm those details before booking, alongside the vehicle offer.",
    logistics:
      "For basement or multistorey parking, measure the clearance and describe the route to the vehicle. For workshop pickups, provide the site contact and opening hours so collection does not interrupt the business.",
    valuation:
      "We assess registered and unregistered vehicles, including cars with mechanical or collision damage. Model, age, completeness and recoverable value all contribute to the final offer.",
    faqQuestion: "Can you collect an unregistered car in Southport?",
    faqAnswer:
      "Yes, an unregistered vehicle may be collected from private property when ownership and safe access can be confirmed. It should not be driven on public roads without appropriate permission.",
  },
  "/cash-for-cars/surfers-paradise/": {
    name: "Surfers Paradise",
    nearby: ["Broadbeach", "Main Beach", "Bundall"],
    intro:
      "High-rise parking and limited loading space make Surfers Paradise vehicle removals different from a standard driveway pickup. We check access before confirming the collection rather than sending unsuitable equipment.",
    logistics:
      "Provide parking level, height clearance, ramp details and information about whether the car rolls. Building management may also need to approve a loading time or allocate a suitable area.",
    valuation:
      "A vehicle can still have value when it is damaged or not economical to repair. The assessment considers its specifications, condition, completeness and available reusable material.",
    faqQuestion: "Can a vehicle be collected from high-rise parking?",
    faqAnswer:
      "Only when access, clearance and safe recovery are confirmed. In some buildings the vehicle may need to be moved to street level before collection.",
  },
  "/cash-for-cars/upper-coomera/": {
    name: "Upper Coomera",
    nearby: ["Coomera", "Oxenford", "Pimpama"],
    intro:
      "Growing households and vehicle upgrades can leave an older car occupying valuable space in Upper Coomera. We quote from the vehicle details and arrange removal after the offer and access plan are accepted.",
    logistics:
      "Driveway slope, gated access and school-hour traffic can affect collection timing. Explain the parking position and any access restrictions when you first contact us.",
    valuation:
      "Cars, SUVs, utes and vans are assessed using their identity, condition and completeness. A clear description of faults and damage helps avoid changes caused by missing information.",
    faqQuestion: "Can you collect a vehicle that has been parked for years?",
    faqAnswer:
      "Often, yes. Tell us whether the tyres hold air, the wheels turn and keys are available so the recovery requirements can be checked.",
  },
  "/cash-for-cars/varsity-lakes/": {
    name: "Varsity Lakes",
    nearby: ["Robina", "Burleigh Waters", "Reedy Creek"],
    intro:
      "An unused car can be difficult to keep around shared housing, student accommodation or a managed complex in Varsity Lakes. We combine the vehicle assessment with practical collection planning.",
    logistics:
      "Confirm who controls the parking area and whether there are gates, time restrictions or clearance limits. The pickup must be authorised by the property and completed from a safe loading position.",
    valuation:
      "The offer reflects more than whether the engine starts. We consider the exact variant, age, visible condition, missing parts and likely demand for reusable components.",
    faqQuestion: "Can someone else meet the driver for collection?",
    faqAnswer:
      "Usually, if ownership and collection authority are clear in advance. Tell us who will be present and make sure they can provide access and the agreed vehicle items.",
  },
  "/cash-for-cars/burleigh-heads/": {
    name: "Burleigh Heads",
    nearby: ["Burleigh Waters", "Miami", "Palm Beach"],
    intro:
      "Burleigh Heads vehicles may be parked at homes, industrial workshops or small business sites. A useful removal service must account for the condition of the car and the practical loading space at that location.",
    logistics:
      "For industrial-site collections, share opening hours and the site contact. For residential pickups, mention narrow access, parking restrictions or a vehicle that cannot roll or steer.",
    valuation:
      "We assess damaged, unwanted and end-of-life vehicles using their make, model, year, completeness and recoverable value. Supporting photos are particularly useful after an accident.",
    faqQuestion: "Can you collect from a Burleigh Heads business?",
    faqAnswer:
      "Yes, when the business authorises access and provides a safe loading location. We can coordinate the pickup window with the nominated site contact.",
  },
  "/cash-for-cars/labrador/": {
    name: "Labrador",
    nearby: ["Southport", "Biggera Waters", "Parkwood"],
    intro:
      "Labrador owners may need to remove a non-running car from a unit complex, driveway or rental property before it becomes a larger problem. We confirm the vehicle assessment and collection requirements in advance.",
    logistics:
      "Shared driveways and apartment parking need clear access arrangements. Check any property rules, identify height limits and tell us if keys are unavailable or the wheels are locked.",
    valuation:
      "Vehicle age, variant, kilometres, condition and major components all matter. Providing complete information at the beginning supports a firmer quote and a smoother handover.",
    faqQuestion: "What if I have lost the keys to my Labrador vehicle?",
    faqAnswer:
      "A collection may still be possible, but missing keys can change the recovery method. Mention this during the quote so the team can assess access and equipment needs.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function quoteFormFrom(html: string) {
  return (
    html.match(
      /<form\b(?=[^>]*\bwpcf7-form\b)[\s\S]*?<\/form>/i,
    )?.[0] ?? ""
  );
}

export function renderLocalMain(pathname: string, originalHtml: string) {
  const page = localPages[pathname];
  if (!page) return null;

  const name = escapeHtml(page.name);
  const nearby = page.nearby.map(escapeHtml);
  const form = quoteFormFrom(originalHtml);

  return `<main id="main" class="seo-location-page">
  <section class="local-hero" aria-labelledby="local-page-title">
    <div class="local-hero__content">
      <p class="local-eyebrow">Local vehicle buying and removal</p>
      <h1 id="local-page-title">Cash for Cars ${name}</h1>
      <p>${escapeHtml(page.intro)}</p>
      <div class="local-actions">
        <a class="button primary" href="tel:0423476111">Call 0423 476 111</a>
        <a class="button secondary" href="#free-quote">Request a free quote</a>
      </div>
      <ul class="local-benefits" aria-label="Service benefits">
        <li>Clear vehicle assessment</li>
        <li>Collection planned around access</li>
        <li>Cars, SUVs, utes and vans considered</li>
      </ul>
    </div>
    <aside class="local-quote" id="free-quote" aria-labelledby="quote-title">
      <h2 id="quote-title">Get a vehicle quote</h2>
      ${form}
    </aside>
  </section>

  <nav class="local-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a><span aria-hidden="true">›</span>
    <a href="/cash-for-cars/">Service areas</a><span aria-hidden="true">›</span>
    <span aria-current="page">${name}</span>
  </nav>

  <section class="local-content">
    <div>
      <p class="local-eyebrow">A pickup plan based on the real location</p>
      <h2>Vehicle removal in ${name} without the guesswork</h2>
      <p>${escapeHtml(page.logistics)}</p>
      <p>${escapeHtml(page.valuation)}</p>
    </div>
    <div class="local-process">
      <h2>How the ${name} service works</h2>
      <ol>
        <li><strong>Describe the vehicle.</strong> Share the registration or vehicle details, condition, keys and location.</li>
        <li><strong>Review the offer.</strong> Ask questions and accept only when the quote and collection terms are clear.</li>
        <li><strong>Confirm access.</strong> Tell us about gates, clearance, locked wheels or other recovery considerations.</li>
        <li><strong>Complete the handover.</strong> Remove personal items and have the agreed ownership information ready.</li>
      </ol>
    </div>
  </section>

  <section class="local-service-area" aria-labelledby="nearby-title">
    <div>
      <p class="local-eyebrow">Nearby coverage</p>
      <h2 id="nearby-title">Also servicing areas around ${name}</h2>
      <p>Collection enquiries are also welcome from ${nearby[0]}, ${nearby[1]} and ${nearby[2]}. Availability is confirmed from the vehicle details, exact location and access requirements.</p>
    </div>
    <a class="button primary" href="/cash-for-cars/">See every service area</a>
  </section>

  <section class="local-faq" aria-labelledby="faq-title">
    <h2 id="faq-title">${name} vehicle removal questions</h2>
    <details>
      <summary>${escapeHtml(page.faqQuestion)}</summary>
      <p>${escapeHtml(page.faqAnswer)}</p>
    </details>
    <details>
      <summary>What information is needed for a useful quote?</summary>
      <p>Provide the make, model, year, condition, location, key status and any major missing parts. Photos can help when the vehicle is damaged or difficult to access.</p>
    </details>
    <details>
      <summary>Is collection included after I accept?</summary>
      <p>The collection arrangement will be explained with the offer. Confirm the exact location and access before accepting so the agreed service matches the vehicle.</p>
    </details>
  </section>

  <section class="local-final-cta">
    <div>
      <p class="local-eyebrow">Ready when you are</p>
      <h2>Request a cash-for-cars quote in ${name}</h2>
      <p>Have the vehicle details nearby, then call or send the form. There is no obligation to accept an offer.</p>
    </div>
    <a class="button primary" href="tel:0423476111">Call 0423 476 111</a>
  </section>
</main>`;
}

export function localPageMetadata(pathname: string) {
  const page = localPages[pathname];
  if (!page) return null;
  const longName = page.name.length > 13;
  return {
    title: longName
      ? `Cash for Cars ${page.name} | Free Vehicle Removal`
      : `Cash for Cars ${page.name} Up to $9,999 | Free Removal`,
    description: `Sell an unwanted, damaged or old vehicle in ${page.name}. Get a clear cash offer and planned vehicle collection. Call 0423 476 111 for a free quote.`,
    faq: [
      { question: page.faqQuestion, answer: page.faqAnswer },
      {
        question: "What information is needed for a useful quote?",
        answer:
          "Provide the make, model, year, condition, location, key status and any major missing parts. Photos can help when the vehicle is damaged or difficult to access.",
      },
      {
        question: "Is collection included after I accept?",
        answer:
          "The collection arrangement will be explained with the offer. Confirm the exact location and access before accepting so the agreed service matches the vehicle.",
      },
    ],
  };
}
