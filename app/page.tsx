import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "./components/LeadForm";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { suburbs } from "./data/site";

export const metadata: Metadata = {
  title: "Cash for Cars Gold Coast | Free Same-Day Car Removal",
  description:
    "Sell your old, damaged or unwanted car on the Gold Coast. Get a fast quote, free towing and same-day pickup. Call or text 0423 476 111.",
  alternates: { canonical: "/" },
};

const services = [
  {
    title: "Unwanted cars",
    copy: "Clear the driveway without advertising, inspections or tyre-kickers. We buy running and non-running vehicles.",
    image: "/images/unwanted-car.jpg",
    alt: "Unwanted car ready for collection",
  },
  {
    title: "Damaged cars",
    copy: "Accident, hail, flood or mechanical damage? Tell us the condition and receive a straightforward offer.",
    image: "/images/damaged-car.jpg",
    alt: "Damaged vehicle assessed for sale",
  },
  {
    title: "Old & scrap cars",
    copy: "Get a quote for older vehicles and scrap cars, with free pickup available across the Gold Coast service area.",
    image: "/images/old-car.jpg",
    alt: "Older car available for removal",
  },
];

const faqs = [
  {
    q: "How much is my car worth?",
    a: "The offer depends on the make, model, year, condition, completeness and current demand. Send those details for a fast, no-obligation quote.",
  },
  {
    q: "Do I pay for towing?",
    a: "No. When we buy your vehicle within our Gold Coast service area, collection is included in the agreed offer.",
  },
  {
    q: "Do you buy cars that do not run?",
    a: "Yes. We consider running, non-running, damaged, unregistered, unwanted and older vehicles.",
  },
  {
    q: "What do I need at pickup?",
    a: "Have photo ID and proof that you are entitled to sell the vehicle. We will explain the required paperwork when your pickup is booked.",
  },
  {
    q: "Can you collect my car today?",
    a: "Same-day pickup is often available, depending on your suburb, the vehicle and the day’s schedule. Call early for the best availability.",
  },
];

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://uniquecashforcars.com.au/#organization",
        name: "Unique Cash for Cars",
        url: "https://uniquecashforcars.com.au/",
        telephone: "+61423476111",
        logo: "https://uniquecashforcars.com.au/images/logo.jpg",
        areaServed: {
          "@type": "City",
          name: "Gold Coast",
          containedInPlace: {
            "@type": "State",
            name: "Queensland",
          },
        },
      },
      {
        "@type": "Service",
        name: "Cash for Cars Gold Coast",
        provider: { "@id": "https://uniquecashforcars.com.au/#organization" },
        areaServed: "Gold Coast, Queensland",
        serviceType: [
          "Cash for cars",
          "Unwanted car buying",
          "Car removal",
          "Scrap car removal",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <Image
            className="hero-image"
            src="/images/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-shade" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow light">Gold Coast vehicle buyers</p>
              <h1>Sell your car without the runaround.</h1>
              <p className="hero-lead">
                Get a fast offer for any make, model or condition—with free
                collection across the Gold Coast service area.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="tel:0423476111">
                  Call 0423 476 111
                </a>
                <a className="text-link light-link" href="#quote">
                  Request a quote <span aria-hidden="true">→</span>
                </a>
              </div>
              <ul className="trust-list" aria-label="Service benefits">
                <li>Free removal</li>
                <li>Same-day options</li>
                <li>All conditions considered</li>
              </ul>
            </div>
            <div id="quote" className="quote-card">
              <div className="quote-heading">
                <p className="eyebrow">Free vehicle quote</p>
                <h2>Tell us about your car</h2>
                <p>We’ll use these details to start your valuation.</p>
              </div>
              <LeadForm compact />
            </div>
          </div>
        </section>

        <section className="promise-bar" aria-label="Why choose us">
          <div className="container promise-grid">
            <div><strong>Fast</strong><span>Phone & text quotes</span></div>
            <div><strong>Free</strong><span>Gold Coast collection</span></div>
            <div><strong>Simple</strong><span>Paperwork explained</span></div>
            <div><strong>Flexible</strong><span>Cars, utes, vans & 4WDs</span></div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Vehicles we buy</p>
                <h2>A practical way to sell any vehicle.</h2>
              </div>
              <p>
                Skip private listings and towing costs. We assess each vehicle
                on its real details, not just its age.
              </p>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <Image
                    src={service.image}
                    alt={service.alt}
                    width={300}
                    height={225}
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="container process-layout">
            <div className="process-intro">
              <p className="eyebrow light">How it works</p>
              <h2>From quote to collection in three clear steps.</h2>
              <p>
                No listing fees, no strangers visiting your home and no need to
                organise a tow truck.
              </p>
              <Link className="button button-outline" href="/sell-my-car-gold-coast/">
                See the selling process
              </Link>
            </div>
            <ol className="process-list">
              <li>
                <span>01</span>
                <div><h3>Share the details</h3><p>Tell us the year, make, model, condition and pickup suburb.</p></div>
              </li>
              <li>
                <span>02</span>
                <div><h3>Review your offer</h3><p>Receive a no-obligation offer and ask any questions before deciding.</p></div>
              </li>
              <li>
                <span>03</span>
                <div><h3>Book free pickup</h3><p>Choose an available time, complete the paperwork and hand over the vehicle.</p></div>
              </li>
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="container value-layout">
            <div className="value-image-wrap">
              <Image
                src="/images/recycling.jpg"
                alt="Vehicle prepared for responsible dismantling and recycling"
                width={1000}
                height={750}
                sizes="(max-width: 900px) 100vw, 46vw"
              />
              <div className="image-note">Every vehicle is valued individually.</div>
            </div>
            <div className="value-copy">
              <p className="eyebrow">A fairer valuation</p>
              <h2>What affects your offer?</h2>
              <p>
                A vehicle is more than its scrap weight. We consider the details
                that can change its resale, parts or recycling value.
              </p>
              <div className="factor-grid">
                <div><strong>Make, model & year</strong><span>Current market demand</span></div>
                <div><strong>Running condition</strong><span>Mechanical and body damage</span></div>
                <div><strong>Completeness</strong><span>Engine, wheels and major parts</span></div>
                <div><strong>Pickup location</strong><span>Access and collection timing</span></div>
              </div>
              <a className="text-link" href="tel:0423476111">
                Talk through your vehicle <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section section-mint">
          <div className="container area-layout">
            <div>
              <p className="eyebrow">Gold Coast coverage</p>
              <h2>Local pickup, suburb by suburb.</h2>
              <p>
                We collect across the northern, central and southern Gold Coast,
                subject to daily availability.
              </p>
            </div>
            <div className="suburb-list">
              {suburbs.map((suburb) => (
                <Link key={suburb.slug} href={`/cash-for-cars/#${suburb.slug}`}>
                  {suburb.name}<span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container faq-layout">
            <div>
              <p className="eyebrow">Common questions</p>
              <h2>Answers before you sell.</h2>
              <p>Need advice about a particular vehicle? Call or text us directly.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq) => (
                <details key={faq.q}>
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner">
            <div>
              <p className="eyebrow light">Ready when you are</p>
              <h2>Turn that unused car into a clear driveway.</h2>
            </div>
            <div className="cta-actions">
              <a className="button button-primary" href="tel:0423476111">Call 0423 476 111</a>
              <a className="button button-outline" href="sms:0423476111">Text vehicle details</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
