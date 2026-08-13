import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HowItWorks } from "@/components/HowItWorks";
import {
  CallButton,
  CheckList,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Cash For Cars Gold Coast | Licensed Buyer, Free Removal",
  description: site.description,
  path: "/",
});

/* Keep service-area wording precise: the registered entity is Queensland-based
 * and serves the Gold Coast; the site does not claim a Gold Coast storefront. */
const heroPoints = [
  "Serving homes, workplaces and vehicle yards across the Gold Coast",
  `Offers up to ${site.maxPayout}, based on the specific vehicle`,
  "Free car removal with no separate towing deduction",
  `QLD motor dealer licence ${site.licenceNumber} · ABN ${site.abn}`,
  "Any make, any model, any condition",
  "Quick phone or online quote",
] as const;

const services = [
  {
    title: "Cash for Old Cars",
    href: "/how-much-is-my-scrap-car-worth-gold-coast",
    image: "/img/old-car-gold-coast.jpg",
    alt: "An old sedan parked in a Gold Coast driveway, ready for removal",
    body: "An old car sitting in the driveway that nobody drives any more. It doesn't need to be roadworthy and it doesn't need to start — we pay a fair price and tow it away.",
    cta: "See how cars are valued",
  },
  {
    title: "Cash for Unwanted Cars",
    href: "/car-removal-gold-coast",
    image: "/img/unwanted-car-gold-coast.jpg",
    alt: "An unwanted car left on a Gold Coast property",
    body: "Cars, utes, vans, buses, 4WDs, hatchbacks, hybrids and EVs. If you want the vehicle gone, tell us its condition and we will assess it for an offer.",
    cta: "See free car removal",
  },
  {
    title: "Cash for Scrap Cars",
    href: "/car-removal-gold-coast",
    image: "/img/car-abandoned.jpg",
    alt: "An abandoned scrap car with flat tyres awaiting collection",
    body: "Past the point of repair is not the same as worthless. We recover the drivetrain, panels, glass and catalytic converter, and dispose of the rest properly.",
    cta: "See free car removal",
  },
  {
    title: "Cash for Accident-Damaged Cars",
    href: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    image: "/img/accident-damaged-car.jpg",
    alt: "A car with accident damage to the front quarter panel",
    body: "Written off, still at the smash repairer, or sitting where it stopped. Wherever your damaged car is, we come to it and the removal costs you nothing.",
    cta: "Compare your options",
  },
  {
    title: "Cash for Used Cars",
    href: "/how-much-is-my-scrap-car-worth-gold-coast",
    image: "/img/used-car-gold-coast.jpg",
    alt: "A used hatchback of the kind we buy across the Gold Coast",
    body: "When the repair quote is higher than the car is worth, selling it whole is usually the better outcome. We buy any used car regardless of make, model or year.",
    cta: "See how cars are valued",
  },
  {
    title: "Cash for Damaged Cars",
    href: "/car-removal-gold-coast",
    image: "/img/car-front-damaged.jpg",
    alt: "A car with a crumpled front end after a collision",
    body: "Body damage, missing parts, electrical faults, mechanical failure, flood or hail damage. Tell us what's wrong up front and we'll price it honestly.",
    cta: "See free car removal",
  },
] as const;

const recyclingSteps = [
  "Rusted and unusable components are stripped out",
  "All fluids are safely drained and contained",
  "Working parts are salvaged for reuse",
  "The remaining shell is baled and recycled as steel",
] as const;

const faqs = [
  {
    question: "How do you buy my car for cash on the Gold Coast?",
    answer:
      "Three steps: you tell us about the car and we quote over the phone, we agree a pickup time, then we check the paperwork, arrange payment and tow it away free. Same-day collection may be available when the route, access and paperwork allow it.",
  },
  {
    question: "What types of vehicle do you buy?",
    answer:
      "Sedans, hatchbacks, wagons, utes, vans, 4WDs, SUVs, trucks and buses. Petrol, diesel, hybrid and electric. Registered or unregistered, running or not.",
  },
  {
    question: "How much can I actually get for my car?",
    answer: `Anywhere from a few hundred dollars for a stripped scrap shell to ${site.maxPayout} for a late-model vehicle in good order. The honest answer is that it depends on make, model, year, condition and completeness — which is why we quote on the specific car rather than advertising one number.`,
  },
  {
    question: "Is the towing really free?",
    answer:
      "Yes. Removal is included in the price we quote, everywhere we service. There is no callout fee, no towing charge and nothing deducted at pickup.",
  },
  {
    question: "Do I need a roadworthy certificate to sell you my car?",
    answer:
      "Queensland generally does not require a safety certificate for an unregistered vehicle or when a registered vehicle is traded to a licensed motor dealer. A registered vehicle sold for parts must first be de-registered. Tell us the registration status and check the current TMR rules for your situation.",
  },
  {
    question: "What paperwork do I need?",
    answer:
      "Photo ID and proof that you own the vehicle or have lawful authority to sell it. Registration, finance, estate and abandoned-vehicle situations follow different processes, so resolve the relevant TMR, PPSR, RTA or QCAT requirements before collection.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([{ name: "Home", path: "/" }]),
          serviceSchema({
            name: "Cash For Cars Gold Coast",
            description: site.description,
            areaServed: "Gold Coast",
            path: "/",
            serviceType: "Cash For Cars Gold Coast",
          }),
          faqSchema(faqs),
        )}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface">
        {/*
          The hero art is a 3840×1600 (2.4:1) banner: a pale Gold Coast skyline
          with cars and cash. It needs two different treatments, because
          object-cover cropping a 2.4:1 image into a tall column turns it into
          a flat wash with no cars in frame.

          Narrow screens get it as a band across the top at close to its own
          aspect ratio, so the whole artwork stays visible. Wide screens, where
          the hero is roughly square, get it full-bleed behind the copy.

          Decorative in both cases — the h1 carries the message — hence the
          empty alt. Preloaded rather than lazy since it is above the fold.
        */}
        <div className="relative aspect-[1920/620] w-full lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto">
          <Image
            src="/img/Best-Cash-for-Cars-Gold-Coast.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        {/*
          Unusually, this artwork is a pale wash built to sit behind dark text,
          so it gets a white scrim instead of the usual dark one.

          It runs top-to-bottom, not left-to-right: the copy occupies the upper
          two thirds of the hero and needs the cover, while the cars and cash
          sit along the bottom edge where nothing overlaps them. Fading out
          downwards protects the text and still lets the artwork read.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden lg:block lg:bg-linear-to-b lg:from-white/95 lg:via-white/90 lg:via-60% lg:to-transparent"
        />

        <Container className="pt-10 pb-14 sm:pb-16 lg:pt-14 lg:pb-14 xl:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
            <div>
              <p className="mb-2 text-xl font-extrabold tracking-tight text-brand">
                {site.name}
              </p>
              <h1 className="heading-xl mb-6">Cash For Cars Gold Coast</h1>

              <CheckList items={heroPoints} />

              <p className="mt-6 mb-5 text-lg">
                <span className="font-bold text-ink-heading">Call now</span> for an
                offer based on the vehicle&apos;s details.
              </p>

              <CallButton className="text-xl" />
            </div>

            <div>
              <QuoteForm id="quote" />
            </div>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <div>
            <SectionHeading>A straightforward Cash For Cars Gold Coast service</SectionHeading>
            <p className="mb-4 text-lg">
              <strong>Unique Cash For Cars</strong> is operated by a Queensland company
              serving vehicle owners across the Gold Coast. We give local residents
              a quick, straightforward way to get rid of a car they no longer want — a
              vehicle-specific offer, payment on collection, and free towing built in.
            </p>
            <p className="mb-4 text-lg">
              Scrap, damaged, flood-affected, unregistered or simply unwanted: we buy
              it, we come to it, and we recycle it properly rather than leaving it to
              rust in a driveway. Free car removal is included on every job we quote.
            </p>
            <p className="mb-4 text-lg">
              Need the pickup details first? Our{" "}
              <Link href="/car-removal-gold-coast" className="font-bold text-brand hover:underline">
                Car Removal Gold Coast
              </Link>{" "}
              page explains access, timing, paperwork and what happens after collection.
            </p>
            <p className="text-lg">
              Reach us on{" "}
              <a href={site.phone.href} className="font-bold text-brand hover:underline">
                {site.phone.display}
              </a>{" "}
              or{" "}
              <a href="#quote" className="font-bold text-brand hover:underline">
                fill in the quote form
              </a>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left">When a direct cash sale makes sense</SectionHeading>
            <div className="space-y-4 text-lg">
              <p>
                If a car is registered, roadworthy, reasonably modern and you have time,
                a private sale may return more. Our service is designed for the cases where
                speed, certainty or vehicle condition matters more than running listings and
                arranging inspections.
              </p>
              <p>
                Non-runners, failed safety inspections, repair bills above the car&apos;s value,
                write-offs, unwanted projects and vehicles that must leave a property by a
                deadline are all suitable for a direct quote.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading align="left">What makes an accurate quote</SectionHeading>
            <CheckList
              items={[
                "Make, model and year",
                "Running condition and known damage",
                "Whether the engine, gearbox, wheels and key are present",
                "Exact Gold Coast pickup location and access",
                "Registration, ownership and finance status",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section tone="alt">
        <SectionHeading>What we buy</SectionHeading>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.title}>
              <Link
                href={service.href}
                className="group flex h-full flex-col overflow-hidden rounded border border-hairline bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <div className="relative aspect-4/3 bg-surface-alt">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 24rem"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="heading-md mb-2 group-hover:text-brand">{service.title}</h3>
                  <p>{service.body}</p>
                  <span className="mt-4 text-sm font-semibold text-brand">
                    {service.cta}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <HowItWorks />

      {/* Locations */}
      <Section tone="alt">
        <SectionHeading>Gold Coast car collection coverage</SectionHeading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          We serve the Gold Coast as a service-area operator. Confirm your exact
          suburb and access when you request a quote so we can give you an accurate
          collection window.
        </p>
        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {site.areaServed.slice(1).map((area) => (
            <li
              key={area}
              className="rounded border border-hairline bg-surface px-4 py-3 text-center font-semibold text-ink-heading"
            >
              {area}
            </li>
          ))}
        </ul>
      </Section>

      {/* Recycling */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>What happens to your car afterwards</SectionHeading>
          <p className="mb-6 text-lg">
            Vehicles we buy are routed through dismantling and recycling processes.
            Reusable components are assessed first, while fluids, batteries and the
            remaining shell require appropriate handling for their material type.
          </p>
          <ol className="space-y-3">
            {recyclingSteps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>Frequently asked questions</SectionHeading>
          <FaqAccordion faqs={faqs} />
        </div>
      </Section>

      {/* Closing CTA */}
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">
            Find out what your car is worth
          </h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            No obligation, no callout fee, and the number we quote is the number you
            get paid.
          </p>
          <a
            href={site.phone.href}
            data-cta="call-home-footer"
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}
