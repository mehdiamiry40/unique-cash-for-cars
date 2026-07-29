import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { site } from "@/content/site";
import { suburbs } from "@/content/suburbs";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/schema";
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
  title: `Cash For Cars Gold Coast — Up to ${site.maxPayout}, Free Removal`,
  description: site.description,
  path: "/",
});

const heroPoints = [
  "A Gold Coast business — we quote it and we pay for it, in person",
  `Top cash for cars Gold Coast — up to ${site.maxPayout} for old and new cars`,
  "Free towing, always included in the price",
  "We handle the paperwork",
  "Any make, any model, any condition",
  "Free quote in about a minute",
] as const;

const services = [
  {
    title: "Cash for Old Cars",
    image: "/img/old-car-gold-coast-enhanced.jpg",
    alt: "A dirt-streaked old station wagon in an industrial yard",
    body: "An old car sitting in the driveway that nobody drives any more. It doesn't need to be roadworthy and it doesn't need to start — we pay a fair price and tow it away.",
  },
  {
    title: "Cash for Unwanted Cars",
    image: "/img/unwanted-car-gold-coast-enhanced.jpg",
    alt: "A red compact car stored in a covered vehicle yard",
    body: "Cars, utes, vans, buses, 4WDs, hatchbacks, hybrids and EVs. If it has four wheels and you want it gone, we'll quote on it, usually within a day.",
  },
  {
    title: "Cash for Scrap Cars",
    image: "/img/car-abandoned-enhanced.jpg",
    alt: "A damaged silver car with broken glass in an overgrown salvage yard",
    body: "Past the point of repair is not the same as worthless. We recover the drivetrain, panels, glass and catalytic converter, and dispose of the rest properly.",
  },
  {
    title: "Cash for Accident-Damaged Cars",
    image: "/img/accident-damaged-car-enhanced.jpg",
    alt: "A white car with severe roof and windscreen damage in a salvage yard",
    body: "Written off, still at the smash repairer, or sitting where it stopped. Wherever your damaged car is, we come to it and the removal costs you nothing.",
  },
  {
    title: "Cash for Used Cars",
    image: "/img/used-car-gold-coast-enhanced.jpg",
    alt: "A used Toyota four-wheel drive with a bull bar",
    body: "When the repair quote is higher than the car is worth, selling it whole is usually the better outcome. We buy any used car regardless of make, model or year.",
  },
  {
    title: "Cash for Damaged Cars",
    image: "/img/car-front-damaged-enhanced.jpg",
    alt: "A black sedan with severe damage to its front-right corner",
    body: "Body damage, missing parts, electrical faults, mechanical failure, flood or hail damage. Tell us what's wrong up front and we'll price it honestly.",
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
      "Three steps: you tell us about the car and we quote over the phone, we agree a pickup time, then we check the paperwork, pay you in cash and tow it away free. Most jobs are done within a day of the first call.",
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
      "Generally no. A safety certificate is required to sell a registered vehicle privately in Queensland, but not for an unregistered one, and not where the vehicle is being removed from the road rather than resold to a driver. Tell us the registration status when you call and we'll confirm what's needed for your car.",
  },
  {
    question: "What paperwork do I need?",
    answer:
      "Photo ID and proof you're the registered owner — normally the registration certificate. If the car was never transferred into your name, call us before booking so we can sort it out in advance.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graph(breadcrumbSchema([{ name: "Home", path: "/" }]), faqSchema(faqs))}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface">
        {/*
          The hero art is a 1920x800 banner: a pale Gold Coast skyline with
          cars and cash. It needs two different treatments, because
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
              <p className="mb-2 text-xl text-brand">Sell your car fast with</p>
              <h1 className="heading-xl mb-6">Get Cash For Cars Gold Coast</h1>

              <CheckList items={heroPoints} />

              <p className="mt-6 mb-5 text-lg">
                <span className="font-bold text-ink-heading">Call now</span> and get a
                firm number in about a minute.
              </p>

              <CallButton className="text-xl" />
            </div>

            <QuoteForm id="quote" />
          </div>
        </Container>
      </section>

      {/* Intro */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <div>
            <SectionHeading>Get Cash For Scrap Cars Gold Coast</SectionHeading>
            <p className="mb-4 text-lg">
              <strong>Unique Cash For Cars</strong> is a Queensland business buying
              vehicles across the Gold Coast. We give local residents
              a quick, straightforward way to get rid of a car they no longer want — a
              firm quote on the phone, cash on collection, and free towing built in.
            </p>
            <p className="mb-4 text-lg">
              Scrap, damaged, flood-affected, unregistered or simply unwanted: we buy
              it, we come to it, and we recycle it properly rather than leaving it to
              rust in a driveway.
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

      {/* Services */}
      <Section>
        <SectionHeading>What we buy</SectionHeading>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.title}
              className="flex flex-col overflow-hidden rounded border border-hairline bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
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
                <h3 className="heading-md mb-2">{service.title}</h3>
                <p>{service.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <HowItWorks tone="alt" />

      {/* Locations */}
      <Section>
        <SectionHeading>Areas we serve</SectionHeading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          We collect across the Gold Coast — from Helensvale and Labrador in the
          north down to Burleigh Heads, and inland through Nerang. Each area page
          covers the access, paperwork and vehicles we actually see there.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suburbs.map((suburb) => (
            <li key={suburb.slug}>
              <Link
                href={`/cash-for-cars/${suburb.slug}`}
                className="group flex h-full flex-col rounded border border-hairline bg-surface p-6 transition-colors hover:border-brand"
              >
                <span className="heading-md group-hover:text-brand">
                  Cash for Cars {suburb.name}
                </span>
                <span className="mt-2 text-ink">{suburb.hook}</span>
                <span className="mt-3 text-sm font-semibold text-brand">
                  {suburb.pickupNote}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Recycling */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading>What happens to your car afterwards</SectionHeading>
          <p className="mb-6 text-lg">
            Every vehicle we take is dismantled and recycled in line with Australian
            environmental guidelines. Nothing is dumped and nothing is left to leach
            into the ground.
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
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}
