import { localPages } from "./location-pages";

function quoteFormFrom(html: string) {
  return (
    html.match(/<form\b(?=[^>]*\bwpcf7-form\b)[\s\S]*?<\/form>/i)?.[0] ?? ""
  );
}

function serviceAreaCards() {
  return Object.entries(localPages)
    .map(
      ([route, area]) => `<a class="area-card" href="${route}">
        <span>${area.name}</span>
        <span aria-hidden="true">→</span>
      </a>`,
    )
    .join("\n");
}

export function renderHomeMain(originalHtml: string) {
  const form = quoteFormFrom(originalHtml);

  return `<main id="main" class="marketing-page home-page">
  <section class="marketing-hero" aria-labelledby="home-title">
    <div class="marketing-hero__content">
      <p class="local-eyebrow">Gold Coast car buyers</p>
      <h1 id="home-title">Sell your car on the Gold Coast without the runaround</h1>
      <p class="marketing-hero__lead">Get a no-obligation offer for an unwanted, damaged, old or non-running vehicle. If you accept, we will confirm a collection plan for your Gold Coast location.</p>
      <div class="local-actions">
        <a class="button primary" href="tel:0423476111">Call 0423 476 111</a>
        <a class="button secondary" href="#free-quote">Get my free quote</a>
      </div>
      <ul class="local-benefits" aria-label="Service benefits">
        <li>Offers up to $9,999, based on the vehicle</li>
        <li>Vehicle collection arranged with your quote</li>
        <li>Gold Coast suburbs only</li>
      </ul>
      <p class="business-hours-inline"><strong>Open Monday–Friday, 9:00 am–5:00 pm</strong></p>
    </div>
    <aside class="local-quote marketing-hero__quote" id="free-quote" aria-labelledby="home-quote-title">
      <p class="local-eyebrow">No-obligation assessment</p>
      <h2 id="home-quote-title">Tell us about your vehicle</h2>
      <p>Share the make, model, condition and Gold Coast location. We will contact you about the offer and collection options.</p>
      ${form}
    </aside>
  </section>

  <section class="trust-strip" aria-label="Service summary">
    <div><strong>Gold Coast only</strong><span>Local suburb coverage</span></div>
    <div><strong>All conditions</strong><span>Running, damaged or unwanted</span></div>
    <div><strong>Clear process</strong><span>Quote, confirm, collect</span></div>
    <div><strong>No obligation</strong><span>You decide whether to accept</span></div>
  </section>

  <section class="marketing-section split-section">
    <div>
      <p class="local-eyebrow">A simpler way to sell</p>
      <h2>One enquiry. One clear plan.</h2>
      <p>Private listings can mean weeks of messages, inspections and uncertain buyers. Our process starts with the facts about your vehicle and finishes with an agreed handover—without asking you to organise transport separately.</p>
      <div class="vehicle-tags" aria-label="Vehicles considered">
        <span>Cars</span><span>SUVs</span><span>Utes</span><span>Vans</span><span>4WDs</span><span>Light commercial</span>
      </div>
    </div>
    <figure class="marketing-media">
      <picture>
        <source media="(max-width: 700px)" srcset="/assets/hero-cash-for-cars-mobile.webp">
        <img src="/assets/hero-cash-for-cars.webp" width="960" height="540" loading="lazy" alt="Vehicle ready for collection on the Gold Coast">
      </picture>
    </figure>
  </section>

  <section class="marketing-section process-section" aria-labelledby="process-title">
    <div class="section-heading">
      <p class="local-eyebrow">How it works</p>
      <h2 id="process-title">From vehicle details to collection in three steps</h2>
    </div>
    <ol class="process-grid">
      <li><span>1</span><h3>Request an offer</h3><p>Call or send the form with the make, model, year, condition and Gold Coast location.</p></li>
      <li><span>2</span><h3>Review the details</h3><p>We assess the information, explain the offer and confirm what is included before you decide.</p></li>
      <li><span>3</span><h3>Arrange the handover</h3><p>If you accept, we agree on safe access, collection timing and the ownership information needed.</p></li>
    </ol>
  </section>

  <section class="marketing-section area-section" aria-labelledby="areas-title">
    <div class="section-heading section-heading--split">
      <div><p class="local-eyebrow">Gold Coast service area</p><h2 id="areas-title">Find your local cash-for-cars page</h2></div>
      <p>We focus exclusively on Gold Coast residents and plan each pickup around the suburb, site access and vehicle condition.</p>
    </div>
    <div class="area-grid">${serviceAreaCards()}</div>
  </section>

  <section class="marketing-section split-section faq-media-section">
    <div>
      <p class="local-eyebrow">See the process</p>
      <h2>What happens to an unwanted vehicle?</h2>
      <p>Watch our short overview, then contact us if you would like a vehicle-specific quote.</p>
      <button class="video-lite" type="button" data-youtube-id="sRYwSL4YKj4" aria-label="Play our vehicle removal video"><img src="/assets/video-poster.webp" width="400" height="225" loading="lazy" alt=""><span class="video-lite__play" aria-hidden="true">▶</span><span class="video-lite__label">Play our vehicle removal video</span></button>
    </div>
    <div class="home-faq">
      <p class="local-eyebrow">Common questions</p>
      <h2>Before you request a quote</h2>
      <details><summary>What vehicles do you consider?</summary><p>We consider cars, SUVs, utes, vans, 4WDs and light commercial vehicles in many conditions, including damaged and non-running vehicles.</p></details>
      <details><summary>Is vehicle collection included?</summary><p>Collection arrangements are explained with the offer. The exact location and access must be confirmed before a pickup time is agreed.</p></details>
      <details><summary>Which areas do you service?</summary><p>Our service is for Gold Coast residents. Choose your suburb above or contact us to confirm coverage for your exact location.</p></details>
      <details><summary>When can I contact you?</summary><p>Our business hours are Monday to Friday, 9:00 am to 5:00 pm.</p></details>
    </div>
  </section>

  <section class="marketing-final-cta">
    <div><p class="local-eyebrow">Ready for a straightforward answer?</p><h2>Request your Gold Coast vehicle quote</h2><p>Call during business hours or send the form at any time.</p></div>
    <div class="local-actions"><a class="button primary" href="tel:0423476111">Call 0423 476 111</a><a class="button secondary" href="#free-quote">Use the quote form</a></div>
  </section>
</main>`;
}

export function renderServiceAreasMain() {
  return `<main id="main" class="marketing-page service-areas-page">
  <section class="page-hero">
    <nav class="local-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">›</span><span aria-current="page">Service areas</span></nav>
    <p class="local-eyebrow">Gold Coast residents only</p>
    <h1>Cash for Cars Across the Gold Coast</h1>
    <p>Choose your suburb for local vehicle assessment and collection information. We consider unwanted, old, damaged and non-running vehicles across the Gold Coast.</p>
    <div class="local-actions"><a class="button primary" href="/#free-quote">Request a free quote</a><a class="button secondary" href="tel:0423476111">Call 0423 476 111</a></div>
  </section>
  <section class="marketing-section area-section" aria-labelledby="all-areas-title">
    <div class="section-heading section-heading--split">
      <div><p class="local-eyebrow">Local coverage</p><h2 id="all-areas-title">Gold Coast service areas</h2></div>
      <p>If your suburb is not listed, contact us with the exact Gold Coast location and we will confirm whether collection can be arranged.</p>
    </div>
    <div class="area-grid">${serviceAreaCards()}</div>
  </section>
  <section class="marketing-section process-section" aria-labelledby="area-process-title">
    <div class="section-heading"><p class="local-eyebrow">What to expect</p><h2 id="area-process-title">A collection plan built around your vehicle</h2></div>
    <ol class="process-grid">
      <li><span>1</span><h3>Share the details</h3><p>Provide the make, model, year, condition, keys and exact Gold Coast location.</p></li>
      <li><span>2</span><h3>Confirm the offer</h3><p>Review the amount and collection terms before deciding whether to accept.</p></li>
      <li><span>3</span><h3>Prepare access</h3><p>Tell us about gates, underground parking, locked wheels or other access restrictions.</p></li>
    </ol>
  </section>
  <section class="marketing-final-cta">
    <div><p class="local-eyebrow">Monday–Friday, 9:00 am–5:00 pm</p><h2>Start with a free Gold Coast quote</h2><p>There is no obligation to accept an offer.</p></div>
    <div class="local-actions"><a class="button primary" href="/#free-quote">Get a quote</a><a class="button secondary" href="tel:0423476111">Call 0423 476 111</a></div>
  </section>
</main>`;
}

export function renderContactMain(originalHtml: string) {
  const form = quoteFormFrom(originalHtml);

  return `<main id="main" class="marketing-page contact-page">
  <section class="page-hero">
    <nav class="local-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">›</span><span aria-current="page">Contact</span></nav>
    <p class="local-eyebrow">Gold Coast vehicle enquiries</p>
    <h1>Contact Unique Cash for Cars</h1>
    <p>Tell us about the vehicle and where it is located on the Gold Coast. We will respond with the next steps for an offer and collection plan.</p>
  </section>
  <section class="marketing-section contact-grid">
    <div class="contact-details">
      <p class="local-eyebrow">Talk to our team</p>
      <h2>Call during business hours</h2>
      <a class="contact-phone" href="tel:0423476111">0423 476 111</a>
      <dl>
        <div><dt>Service area</dt><dd>Gold Coast residents only</dd></div>
        <div><dt>Business hours</dt><dd>Monday–Friday<br>9:00 am–5:00 pm</dd></div>
        <div><dt>Quote</dt><dd>No obligation to accept</dd></div>
      </dl>
      <p>For a useful first assessment, have the make, model, year, condition, key status and exact vehicle location ready.</p>
    </div>
    <div class="local-quote" id="contact-quote">
      <p class="local-eyebrow">Online enquiry</p>
      <h2>Request a vehicle quote</h2>
      <p>You can send the form at any time. We handle enquiries during business hours.</p>
      ${form}
    </div>
  </section>
</main>`;
}

const coreServices: Record<
  string,
  {
    eyebrow: string;
    title: string;
    lead: string;
    sectionTitle: string;
    paragraphs: string[];
    benefits: string[];
  }
> = {
  "/sell-my-car-gold-coast/": {
    eyebrow: "A direct alternative to private listings",
    title: "Sell My Car on the Gold Coast",
    lead:
      "Request a clear offer for your vehicle without managing ads, repeated messages or uncertain inspections. We assess the details and organise the next step for your Gold Coast location.",
    sectionTitle: "A practical way to move on from your vehicle",
    paragraphs: [
      "Start by sharing the make, model, year, kilometres and condition. Tell us about mechanical faults, accident damage, missing parts and whether the vehicle starts, steers and rolls. Accurate information supports a more useful assessment.",
      "If you choose to accept the offer, we will confirm the handover requirements and a collection plan. You remain free to ask questions and decline before an arrangement is finalised.",
    ],
    benefits: [
      "No private advertising",
      "No-obligation vehicle assessment",
      "Gold Coast collection planning",
    ],
  },
  "/unwanted-car-buyer/": {
    eyebrow: "Cars in many conditions considered",
    title: "Unwanted Car Buyer Gold Coast",
    lead:
      "Turn an unused, damaged or non-running vehicle into a straightforward enquiry. We consider cars, SUVs, utes, vans, 4WDs and light commercial vehicles for Gold Coast residents.",
    sectionTitle: "Clear the vehicle without arranging transport alone",
    paragraphs: [
      "An unwanted vehicle can take up valuable space and become harder to move over time. Tell us where it is parked, whether keys are available and if access is limited by gates, underground clearance or locked wheels.",
      "The offer reflects the exact vehicle and its condition. Make, model, age, completeness, reusable components and recyclable material can all affect the assessment.",
    ],
    benefits: [
      "Damaged and non-running vehicles",
      "Access checked before collection",
      "Offer explained before you accept",
    ],
  },
  "/car-removal-gold-coast/": {
    eyebrow: "Planned vehicle collection",
    title: "Car Removal Gold Coast",
    lead:
      "Arrange collection for an unwanted, damaged, old or non-running vehicle. We confirm the Gold Coast location, access and vehicle condition before agreeing on a pickup window.",
    sectionTitle: "The right collection plan starts with access",
    paragraphs: [
      "A driveway pickup is different from a basement, workshop or body-corporate car park. Share gate widths, height restrictions, surface conditions and whether the vehicle can steer or roll so appropriate collection arrangements can be discussed.",
      "Before the handover, remove personal belongings and prepare the agreed ownership information and keys. We will explain any vehicle-specific requirements when collection is confirmed.",
    ],
    benefits: [
      "Gold Coast suburb coverage",
      "Collection details confirmed upfront",
      "Residential and business enquiries",
    ],
  },
  "/company-info-cash-for-cars-gold-coast-and-free-car-removal/": {
    eyebrow: "About Unique Cash for Cars",
    title: "Gold Coast Vehicle Buyers Focused on a Clear Process",
    lead:
      "Unique Cash for Cars helps Gold Coast residents request offers and organise collection for unwanted, damaged, old and non-running vehicles.",
    sectionTitle: "Vehicle details first, collection plan second",
    paragraphs: [
      "We begin with the facts that affect the assessment: vehicle identity, age, condition, completeness, keys, location and access. This creates a better starting point than a generic estimate that ignores the vehicle in front of us.",
      "Our service is designed around a simple principle: you should understand the offer and collection terms before deciding. Ask questions, check what is included and accept only when the arrangement suits you.",
    ],
    benefits: [
      "Gold Coast residents only",
      "No-obligation enquiries",
      "Monday–Friday support",
    ],
  },
};

function renderCoreServiceMain(
  pathname: string,
  originalHtml: string,
) {
  const service = coreServices[pathname];
  if (!service) return null;
  const form = quoteFormFrom(originalHtml);

  return `<main id="main" class="marketing-page core-service-page">
  <section class="marketing-hero" aria-labelledby="core-service-title">
    <div class="marketing-hero__content">
      <p class="local-eyebrow">${service.eyebrow}</p>
      <h1 id="core-service-title">${service.title}</h1>
      <p class="marketing-hero__lead">${service.lead}</p>
      <div class="local-actions"><a class="button primary" href="tel:0423476111">Call 0423 476 111</a><a class="button secondary" href="#service-quote">Request a free quote</a></div>
      <ul class="local-benefits">${service.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}</ul>
      <p class="business-hours-inline"><strong>Monday–Friday, 9:00 am–5:00 pm</strong></p>
    </div>
    <aside class="local-quote marketing-hero__quote" id="service-quote" aria-labelledby="service-quote-title">
      <p class="local-eyebrow">Gold Coast enquiries</p>
      <h2 id="service-quote-title">Get a vehicle quote</h2>
      <p>Send the form at any time. We respond during business hours.</p>
      ${form}
    </aside>
  </section>
  <section class="marketing-section split-section">
    <div>
      <p class="local-eyebrow">What to expect</p>
      <h2>${service.sectionTitle}</h2>
      ${service.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
    </div>
    <div class="service-checklist">
      <h2>Information to have ready</h2>
      <ul>
        <li><strong>Vehicle:</strong> make, model, year and kilometres</li>
        <li><strong>Condition:</strong> damage, faults and missing parts</li>
        <li><strong>Access:</strong> exact Gold Coast location and parking position</li>
        <li><strong>Handover:</strong> keys and available ownership information</li>
      </ul>
    </div>
  </section>
  <section class="marketing-section process-section" aria-labelledby="core-process-title">
    <div class="section-heading"><p class="local-eyebrow">Three straightforward stages</p><h2 id="core-process-title">Quote, confirm and collect</h2></div>
    <ol class="process-grid">
      <li><span>1</span><h3>Describe the vehicle</h3><p>Call or use the form with accurate vehicle, condition and location details.</p></li>
      <li><span>2</span><h3>Review the offer</h3><p>Confirm the amount, collection arrangement and any handover requirements.</p></li>
      <li><span>3</span><h3>Choose what happens next</h3><p>Accept if it suits you, then prepare the vehicle for the agreed collection window.</p></li>
    </ol>
  </section>
  <section class="marketing-final-cta">
    <div><p class="local-eyebrow">Gold Coast vehicle enquiries</p><h2>Get a no-obligation assessment</h2><p>Speak with us Monday to Friday, 9:00 am to 5:00 pm.</p></div>
    <div class="local-actions"><a class="button primary" href="tel:0423476111">Call 0423 476 111</a><a class="button secondary" href="#service-quote">Use the quote form</a></div>
  </section>
</main>`;
}

function renderBlogMain() {
  const articles = [
    {
      href: "/5-best-luxury-eco-friendly-cars-in-australia-2020/",
      image: "/wp-content/uploads/2020/09/Luxury-cars-Australia-768x544.jpeg",
      title: "5 Eco-Friendly Luxury Cars in Australia",
      text: "A look at comfort, technology and lower-emission options for Australian drivers.",
    },
    {
      href: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/",
      image: "/wp-content/uploads/2023/09/damaged-car-768x512.jpg",
      title: "What to Do With a Damaged Car on the Gold Coast",
      text: "Compare repair, insurance, private-sale and direct vehicle-buyer options.",
    },
    {
      href: "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld/",
      image:
        "/wp-content/uploads/2023/09/Car-Selling-Optionn-in-Gold-Coast-QLD-768x505.jpg",
      title: "Where Do Old Cars Go on the Gold Coast?",
      text: "Understand resale, recycling, trade-in and vehicle-removal pathways.",
    },
  ];

  return `<main id="main" class="marketing-page blog-page">
  <section class="page-hero">
    <p class="local-eyebrow">Helpful vehicle advice</p>
    <h1>Car Selling &amp; Removal Advice</h1>
    <p>Practical information to help Gold Coast vehicle owners compare their options and prepare for a safer, clearer handover.</p>
  </section>
  <section class="marketing-section article-grid" aria-label="Latest articles">
    ${articles
      .map(
        (article) => `<article class="article-card">
      <a href="${article.href}" aria-label="Read ${article.title}"><img src="${article.image}" width="768" height="512" loading="lazy" alt=""></a>
      <div><p class="local-eyebrow">Vehicle advice</p><h2><a href="${article.href}">${article.title}</a></h2><p>${article.text}</p><a class="article-card__link" href="${article.href}">Read article <span aria-hidden="true">→</span></a></div>
    </article>`,
      )
      .join("")}
  </section>
</main>`;
}

export function renderMarketingMain(pathname: string, originalHtml: string) {
  if (pathname === "/") return renderHomeMain(originalHtml);
  if (pathname === "/cash-for-cars/") return renderServiceAreasMain();
  if (pathname === "/contact-us/") return renderContactMain(originalHtml);
  if (pathname === "/blog/") return renderBlogMain();
  return renderCoreServiceMain(pathname, originalHtml);
}
