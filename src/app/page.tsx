import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { site } from "@/content/site";
import { suburbPath, suburbs } from "@/content/suburbs";
import { openingHoursPhrase } from "@/lib/hours";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HowItWorks } from "@/components/HowItWorks";
import { FurtherReading } from "@/components/FurtherReading";
import {
  CallButton,
  Card,
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

/*
 * This page owns "cash for cars gold coast" (docs/two-keyword-seo-map.md).
 *
 * It speaks as the buyer: who is buying, what is bought, how the quote and the
 * payment confirmation work, that removal is included, and where on the Gold
 * Coast the truck goes. Collection detail belongs to /car-removal-gold-coast
 * and the seller's paperwork to /sell-my-car-gold-coast, so those are linked
 * from here, not repeated. No section heading may repeat the removal pillar's
 * exact phrase.
 *
 * Keep service-area wording precise: the registered entity is Queensland-based
 * and serves the Gold Coast; the site does not claim a Gold Coast storefront.
 * Prices, payment and timing say only what site.ts supports: one published
 * cap, a payment method that is confirmed before pickup and never named, and
 * same-day collection that may be available and is never promised.
 */

/** "8am to 5pm, seven days", from site.openingHours. */
const hours = openingHoursPhrase();

const heroPoints = [
  `Offers up to ${site.maxPayout}, based on the specific vehicle`,
  "Any make, model or condition, running or not",
  "Free removal for vehicles we buy, with no towing fee deducted",
  `QLD motor dealer licence ${site.licenceNumber} · ABN ${site.abn}`,
  "Offer and payment method confirmed before pickup",
  `Phone and online quotes, open ${hours}`,
] as const;

/*
 * Each card links to the page that answers the question the card raises. The
 * alt text describes the photograph. These are legacy images with no
 * documented job provenance, so none is captioned as a car we collected.
 */
const services = [
  {
    title: "Cash for Scrap Cars",
    href: "/how-much-is-my-scrap-car-worth-gold-coast",
    image: "/img/old-car-gold-coast.jpg",
    alt: "Partly dismantled cars lined up in a vehicle recycling yard",
    body: "Past repair is not the same as worthless. A scrap car is valued on what can still be recovered from it: the drivetrain, catalytic converter, panels, glass and wheels, plus the steel that is left.",
    cta: "See how a scrap car is valued",
  },
  {
    title: "Cash for Unwanted Cars",
    href: "/car-removal-gold-coast",
    image: "/img/car-abandoned.jpg",
    alt: "A white station wagon hitched behind a tow truck at the kerb",
    body: "The car nobody drives any more, the unfinished project, the one that has to leave before a move. It does not need to start or be registered. Tell us where it is parked and what is in the way.",
    cta: "See how free removal works",
  },
  {
    title: "Cash for Accident-Damaged Cars",
    href: "/statutory-vs-repairable-write-off-queensland",
    image: "/img/unwanted-car-gold-coast.jpg",
    alt: "A green coupe with a crushed front end in front of Australian banknotes",
    body: "Still at the smash repairer, or sitting where it stopped. Tell us whether an insurer has assessed it, because a car recorded as a write-off comes with its own Queensland rules.",
    cta: "Understand write-off types",
  },
  {
    title: "Cash for Damaged Cars",
    href: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
    image: "/img/car-front-damaged.jpg",
    alt: "Close view of collision damage to a car's front guard and headlight",
    body: "Body damage, missing parts, electrical faults, a failed engine or gearbox, flood or hail. Describe what is wrong before we quote, so the offer is for the car as it actually is.",
    cta: "Compare repair and sale options",
  },
  {
    title: "Cash for Old Cars",
    href: "/sell-car-without-roadworthy-qld",
    image: "/wp-content/uploads/2020/01/Abandonedvehicles.jpg",
    alt: "An old pickup truck with faded paint and surface rust, parked on a dirt track",
    body: "Rust, high kilometres or a failed safety inspection. An old car does not need a roadworthy to be sold to a licensed motor dealer, and it does not need to start for us to assess it.",
    cta: "See when a roadworthy is needed",
  },
  {
    title: "Cash for Used Cars",
    href: "/sell-my-car-gold-coast",
    image: "/img/used-car-gold-coast.jpg",
    // The file is a blog banner with a caption strip along the bottom. Scaling
    // from the top-left corner keeps the car in frame and the strip out of it.
    imageClass: "origin-top-left scale-[1.4]",
    alt: "The rear quarter of a sedan parked beside the beach",
    body: "A car that still runs but is no longer worth listing, repairing or re-registering. We buy any make, model or year. If it is registered and roadworthy, compare a private sale first.",
    cta: "Work through the seller checklist",
  },
] as const;

const quoteDetails = [
  "Make, model and year",
  "Whether it starts and drives, and any known damage",
  "Whether the engine, gearbox, wheels, catalytic converter and keys are all there",
  "The suburb, the street and how a truck would reach the car",
  "Registration status, whose name it is in and whether finance is owing",
  "Whether an insurer has assessed it or recorded it as a write-off",
] as const;

/* Three ways to sell, described by what each asks of the seller. No business
 * is named and nothing here is a claim about anyone else's prices. */
const saleRoutes = [
  {
    title: "Selling it privately",
    body: "A registered, roadworthy, reasonably modern car may return more in a private sale. You write the listing, answer the enquiries and meet the buyers, and a registered car sold privately in Queensland generally needs a current safety certificate before it changes hands.",
  },
  {
    title: "Selling it to a parts wrecker",
    body: "A traditional wrecker, or auto dismantler, buys vehicles to strip and resell as used parts. Queensland requires a registered vehicle sold for parts to be de-registered first. Collection terms vary, so ask whether towing is included or comes off the price. A business that calls itself a wrecker or recycler is not automatically a licensed motor dealer.",
  },
  {
    title: "Selling it to us",
    body: "We quote the whole vehicle as it stands, confirm the offer and the payment method before pickup, and include the removal. You deal with one licensed buyer for the offer, the paperwork and the collection.",
  },
] as const;

const recyclingSteps = [
  "Rusted and unusable components are stripped out",
  "All fluids are safely drained and contained",
  "Working parts are salvaged for reuse",
  "The remaining shell is baled and recycled as steel",
] as const;

const coastalSuburbs = suburbs.filter((suburb) => suburb.region === "Gold Coast");
const furtherSuburbs = suburbs.filter((suburb) => suburb.region !== "Gold Coast");

/** "A, B and C" for the suburb names in the coverage answer. */
function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/*
 * Shown in the accordion and marked up as FAQPage from the same array, so the
 * visible answers and the structured data cannot drift apart. Plain strings
 * only: an answer with a link in it would not match its schema text.
 */
const faqs = [
  {
    question: "How does cash for cars work on the Gold Coast?",
    answer:
      "Tell us the make, model, year, condition and pickup address by phone or through the quote form, and we quote that vehicle. If you accept, we confirm the offer, the payment method and a pickup window before a truck is sent. At collection we check identity and ownership, complete the paperwork and remove the car.",
  },
  {
    question: "Who is buying my car?",
    answer: `${site.name} is operated by ${site.registeredEntityName}, ABN ${site.abn}, under Queensland motor dealer licence ${site.licenceNumber}. You can search that licence number on the Queensland Fair Trading licence register, and the ABN on ABN Lookup, before you accept an offer.`,
  },
  {
    question: "How is the offer for my car worked out?",
    answer: `We quote the specific vehicle. The offer reflects the make, model, year, condition and how complete the car is, because its value to us is what can be recovered from it plus the steel that is left. Offers go up to ${site.maxPayout}. A complete car is worth more than one that has had parts removed, so describe it accurately.`,
  },
  {
    question: "What vehicles do you buy?",
    answer:
      "Sedans, hatchbacks, wagons, utes, vans, 4WDs, SUVs, trucks and buses, in petrol, diesel, hybrid or electric. Registered or unregistered, running or not, including accident-damaged, hail-damaged, flood-affected and written-off vehicles. Tell us if an insurer has assessed the car, because a recorded write-off has its own Queensland rules.",
  },
  {
    question: "Is the removal free, or is towing taken out of the offer?",
    answer:
      "For a vehicle we agree to buy inside the confirmed service area, removal is included. There is no separate callout fee or towing charge, and no towing cost is deducted from the offer at pickup.",
  },
  {
    question: "When is the payment confirmed?",
    answer:
      "Before pickup. We confirm the offer and the payment method with you before a truck is sent. The offer applies when the vehicle, its condition and completeness, the pickup location and the access match the details you gave us. If something material is different, we discuss it with you before the sale proceeds.",
  },
  {
    question: "Which parts of the Gold Coast do you collect from?",
    answer: `We collect across the Gold Coast, including ${listOf(
      coastalSuburbs.map((suburb) => suburb.name),
    )}. Give us the suburb and street when you ask for a quote and we confirm coverage for that address before you accept. ${listOf(
      furtherSuburbs.map((suburb) => suburb.name),
    )} are outside the Gold Coast and have their own pages.`,
  },
  {
    question: "Can you collect my car today?",
    answer: `Same-day collection may be available when the route, the access and the paperwork allow it. Truck availability, distance, how the car has to be loaded and whether the ownership paperwork is ready all affect the timing. We are open ${hours}, and confirm the pickup window with you before collection.`,
  },
  {
    question: "Do I need a roadworthy certificate to sell you my car?",
    answer:
      "Queensland generally does not require a safety certificate when a registered vehicle is traded to a licensed motor dealer, or when the vehicle is already unregistered. A registered vehicle sold for parts must be de-registered first. Tell us the registration status when you ask for a quote, and check the current Transport and Main Roads rules for your situation.",
  },
  {
    question: "What paperwork do I need?",
    answer:
      "Photo ID and proof that you own the vehicle or have lawful authority to sell it. If finance is owing, ask the lender for a payout letter. Registration, estate and abandoned-vehicle situations follow their own processes, so settle the relevant Transport and Main Roads, PPSR, RTA or QCAT requirements before collection.",
  },
  {
    question: "Is selling to you better than a private sale?",
    answer:
      "Not always. A registered, roadworthy, reasonably modern car may return more in a private sale if you have the time to list it and meet buyers. Selling to us suits a car that does not run, has failed a safety inspection, would cost more to repair than it is worth, or has to be gone by a set date.",
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
          empty alt. Preloaded rather than lazy since it is above the fold, and
          fetchPriority high because it is the measured LCP element: `preload`
          alone (and the deprecated `priority`) emits the <link> but leaves the
          <img> itself at default priority.
        */}
        <div className="relative aspect-[1920/620] w-full lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto">
          <Image
            src="/img/Best-Cash-for-Cars-Gold-Coast.jpg"
            alt=""
            fill
            preload
            fetchPriority="high"
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
              <h1 className="heading-xl mb-4">Cash For Cars Gold Coast</h1>
              <p className="mb-6 text-lg">
                We buy cars, utes, vans and 4WDs across the Gold Coast, in any
                condition, and collect them at no charge.
              </p>

              <CheckList items={heroPoints} />

              <p className="mt-6 mb-5 text-lg">
                <span className="font-bold text-ink-heading">Call now</span> with the
                make, model, year and condition for a quote on your vehicle.
              </p>

              <CallButton className="text-xl" />
            </div>

            <div>
              <QuoteForm id="quote" />
            </div>
          </div>
        </Container>
      </section>

      {/* Intro: who buys, how it works, and where the detail lives */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading>
            Cash for cars on the Gold Coast, from a licensed Queensland buyer
          </SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              <strong>{site.name}</strong> buys vehicles directly from their owners
              across the Gold Coast. The service is operated by{" "}
              {site.registeredEntityName} under Queensland motor dealer licence{" "}
              {site.licenceNumber}, so you are selling to a named, licensed business
              and can check it on the public registers before you call.
            </p>
            <p>
              The process is short. Tell us the make, model, year, condition and
              where the car is parked, by phone or through the quote form, and we
              quote that vehicle. If you accept, we confirm the offer, the payment
              method and a pickup window before a truck is sent. Identity and
              ownership are checked at collection.
            </p>
            <p>
              Removal is part of the purchase. For a vehicle we agree to buy inside
              the confirmed service area there is no callout fee, and no towing
              charge comes out of the offer. Our{" "}
              <Link href="/car-removal-gold-coast" className="font-bold text-brand hover:underline">
                Car Removal Gold Coast
              </Link>{" "}
              page covers the collection itself: basements, driveways and
              roadsides, cars that do not start, and what to have ready for the
              truck.
            </p>
            <p>
              Not sure yet about the registration, the plates or money still owing
              on the car? Start with{" "}
              <Link
                href="/sell-my-car-gold-coast"
                className="font-bold text-brand hover:underline"
              >
                sell my car Gold Coast
              </Link>
              , the seller&apos;s checklist for papers, plates and the choice between
              a private sale and a licensed buyer.
            </p>
            <p>
              We are open {hours}. Call{" "}
              <a href={site.phone.href} className="font-bold text-brand hover:underline">
                {site.phone.display}
              </a>
              , or{" "}
              <a
                href="#quote"
                data-cta="quote-home-intro"
                className="font-bold text-brand hover:underline"
              >
                fill in the quote form
              </a>{" "}
              and we will call you back.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        {/*
          Credential proof is intentionally separate from customer proof.
          Legacy photos and old copy have no documented customer consent or
          job provenance, so they must not be presented as reviews or case studies.
        */}
        <section id="business-proof" className="mx-auto max-w-4xl">
          <div>
            <p className="mb-2 text-sm font-extrabold tracking-widest text-brand uppercase">
              Proof you can check
            </p>
            <SectionHeading align="left">Know who is buying your car</SectionHeading>
            <p className="mb-6 text-lg">
              Before you hand over a vehicle and its paperwork, confirm the company
              and the licence behind the offer. {site.name} is operated by{" "}
              <strong>{site.registeredEntityName}</strong>, and the public-register
              links below let you check the details yourself.
            </p>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-hairline bg-surface-alt p-4">
                <dt className="mb-1 text-sm font-bold text-ink-muted">Registered entity</dt>
                <dd className="font-bold text-ink-heading">{site.registeredEntityName}</dd>
              </div>
              <div className="rounded border border-hairline bg-surface-alt p-4">
                <dt className="mb-1 text-sm font-bold text-ink-muted">Service model</dt>
                <dd className="font-bold text-ink-heading">Gold Coast service-area operator</dd>
              </div>
              <div className="rounded border border-hairline bg-surface-alt p-4">
                <dt className="mb-1 text-sm font-bold text-ink-muted">Australian Business Number</dt>
                <dd>
                  <a
                    href="https://abr.business.gov.au/ABN/View?id=39627952916"
                    className="font-bold text-brand underline underline-offset-2"
                  >
                    ABN {site.abn}
                  </a>
                </dd>
              </div>
              <div className="rounded border border-hairline bg-surface-alt p-4">
                <dt className="mb-1 text-sm font-bold text-ink-muted">QLD motor dealer licence</dt>
                <dd>
                  <a
                    href={site.licenceRegisterUrl}
                    className="font-bold text-brand underline underline-offset-2"
                  >
                    Licence {site.licenceNumber}
                  </a>
                  <p className="mt-1 text-sm text-ink-muted">
                    Opens the Fair Trading register. Search for this licence number.
                  </p>
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-lg">
              The licence has a practical effect on the sale. Queensland does not
              require a safety certificate when a registered vehicle is traded to a
              licensed motor dealer. A business that describes itself as a wrecker,
              a recycler or a cash-for-cars buyer is not automatically one, so
              search the register for whichever buyer you choose.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/about" className="font-bold text-brand hover:underline">
                See operator and licence details
              </Link>
              <Link
                href="/car-removal-gold-coast"
                className="font-bold text-brand hover:underline"
              >
                See the collection process
              </Link>
            </div>
          </div>
        </section>
      </Section>

      {/* What we buy */}
      <Section tone="alt">
        <SectionHeading>Vehicles we buy on the Gold Coast</SectionHeading>
        <p className="mx-auto mb-8 max-w-3xl text-center text-lg">
          Sedans, hatchbacks, wagons, utes, vans, 4WDs, SUVs, trucks and buses.
          Petrol, diesel, hybrid and electric. Registered or unregistered, running
          or not. Offers go up to {site.maxPayout} and depend on the vehicle, so
          describe yours as it is.
        </p>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.title}>
              <Link
                href={service.href}
                className="group flex h-full flex-col overflow-hidden rounded border border-hairline bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-surface-alt">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 24rem"
                    className={`object-cover ${"imageClass" in service ? service.imageClass : ""}`}
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

      {/* The quote and the payment confirmation */}
      <Section tone="alt">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left">What your offer is based on</SectionHeading>
            <div className="space-y-4 text-lg">
              <p>
                There is no flat rate. A car&apos;s value to us is the sum of what can
                be recovered from it: the engine and gearbox, the catalytic
                converter, reusable panels, glass, wheels and lights, plus the
                weight of steel left over. That is why a complete car that will not
                start can be worth more than the same model with parts already sold
                off.
              </p>
              <p>
                Offers go up to {site.maxPayout}. Where yours sits depends on the
                make, model, year, condition and completeness, so we quote the
                specific vehicle. Our guide to{" "}
                <Link
                  href="/how-much-is-my-scrap-car-worth-gold-coast"
                  className="font-bold text-brand hover:underline"
                >
                  what sets the value of a scrap car
                </Link>{" "}
                goes through each factor.
              </p>
              <p>
                We confirm the offer and the payment method before pickup. The offer
                applies when the vehicle, its condition and completeness, the pickup
                location and the access match what you told us. If something
                material is different on the day, we talk it through with you before
                the sale goes ahead.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading align="left">What to tell us for an accurate quote</SectionHeading>
            <CheckList items={quoteDetails} />
          </div>
        </div>
      </Section>

      {/* Removal: stated here, detailed on the removal pillar */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">Removal is included when we buy your car</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              You do not bring the car to us. We collect it from the home,
              workplace, repairer, storage yard or roadside where it is parked. For
              a vehicle we agree to buy inside the confirmed service area there is
              no callout fee and no towing charge, and nothing is taken off the
              offer for the tow.
            </p>
            <p>
              The car does not need to start. A non-runner can usually be winched
              onto the truck, and one with seized brakes or missing wheels may need
              skates or other loading equipment, so tell us what moves and what does
              not. Because it travels on a truck, an unregistered car is not driven
              on the road to reach us. Our guide to{" "}
              <Link
                href="/unregistered-vehicle-permit-queensland"
                className="font-bold text-brand hover:underline"
              >
                unregistered vehicle permits in Queensland
              </Link>{" "}
              explains when a permit is needed and when towing is the simpler path.
            </p>
            <p>
              Same-day collection may be available when the route, the access and
              the paperwork allow it. We confirm a pickup window with you before the
              truck is sent.
            </p>
            <p>
              Basement height limits, gated estates, narrow streets and soft ground
              all change how a car is loaded. See{" "}
              <Link
                href="/car-removal-gold-coast"
                className="font-bold text-brand hover:underline"
              >
                how free car removal works on the Gold Coast
              </Link>{" "}
              for what to tell us about each kind of access.
            </p>
          </div>
        </div>
      </Section>

      {/* Locations */}
      <Section tone="alt">
        <SectionHeading>Where we buy cars on the Gold Coast</SectionHeading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          The truck comes to the car. The eight suburb pages below run from
          Helensvale and Labrador in the north, through Southport, Surfers Paradise
          and Mermaid Waters, to Robina and Burleigh Heads in the south, with Nerang
          inland. Each one explains what to tell us about access there. Elsewhere on
          the Gold Coast, give us the suburb and street when you ask for a quote and
          we confirm coverage for that address before you accept.
        </p>
        {/*
          One link per suburb page, in the order of site.areaServed. The anchor
          names the suburb so it never reads as a second link to this page's own
          "cash for cars gold coast" query.
        */}
        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {coastalSuburbs.map((suburb) => (
            <li key={suburb.slug}>
              <Link
                href={suburbPath(suburb.slug)}
                className="block h-full rounded border border-hairline bg-surface px-4 py-3 text-center font-semibold text-ink-heading transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Cash for cars {suburb.name}
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="heading-md mx-auto mt-12 mb-3 max-w-2xl text-center">
          Ipswich, Logan and Toowoomba
        </h3>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          These three are outside the Gold Coast. Ipswich and Logan are trips
          inland, and Toowoomba is a pickup we travel over the range for, to the
          address you give us. Each page says what to tell us about access there.
        </p>
        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
          {furtherSuburbs.map((suburb) => (
            <li key={suburb.slug}>
              <Link
                href={suburbPath(suburb.slug)}
                className="block h-full rounded border border-hairline bg-surface px-4 py-3 text-center font-semibold text-ink-heading transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Cash for cars {suburb.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* How this compares with the other ways to sell */}
      <Section>
        <div className="mx-auto max-w-5xl">
          <SectionHeading>Private sale, wrecker or licensed buyer</SectionHeading>
          <p className="mx-auto mb-8 max-w-3xl text-center text-lg">
            There is more than one way to sell a car on the Gold Coast, and we are
            not the right answer for every car. The three common routes ask
            different things of the seller.
          </p>
          <ul className="grid gap-6 lg:grid-cols-3">
            {saleRoutes.map((route) => (
              <li key={route.title}>
                <Card className="h-full">
                  <h3 className="heading-md mb-2">{route.title}</h3>
                  <p>{route.body}</p>
                </Card>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-10 max-w-3xl space-y-4 text-lg">
            <p>
              A direct sale suits non-runners, cars that have failed a safety
              inspection, repair bills higher than the car is worth, write-offs,
              unfinished projects and vehicles that must leave a property by a set
              date.
            </p>
            <p>
              If the car is unregistered or unlikely to pass an inspection, our
              guide to{" "}
              <Link
                href="/sell-car-without-roadworthy-qld"
                className="font-bold text-brand hover:underline"
              >
                selling a car without a roadworthy in Queensland
              </Link>{" "}
              explains when a safety certificate is required and when it is not. If
              the registration is being ended as part of the sale, follow the steps
              for{" "}
              <Link
                href="/cancel-car-registration-queensland-after-sale"
                className="font-bold text-brand hover:underline"
              >
                cancelling Queensland registration after a sale
              </Link>
              . Still weighing up a repair? Our guide on{" "}
              <Link
                href="/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide"
                className="font-bold text-brand hover:underline"
              >
                what to do with a damaged car
              </Link>{" "}
              compares fixing, claiming and selling.
            </p>
          </div>
        </div>
      </Section>

      {/* Recycling */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading>What happens to your car afterwards</SectionHeading>
          <p className="mb-6 text-lg">
            Vehicles we buy go through dismantling and recycling. Reusable parts
            are assessed first, and the fluids, the battery and the remaining shell
            are each handled as their material requires.
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
          <SectionHeading>Cash for cars Gold Coast: common questions</SectionHeading>
          <FaqAccordion faqs={faqs} />
        </div>
      </Section>

      {/*
        The four guides a seller here most often needs next. FurtherReading
        uses each guide's own title as the anchor, so none of these links
        carries this page's query.
      */}
      <FurtherReading
        slugs={[
          "how-much-is-my-scrap-car-worth-gold-coast",
          "what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
          "cancel-car-registration-queensland-after-sale",
          "unregistered-vehicle-permit-queensland",
        ]}
      />

      {/* Closing CTA */}
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">
            Get a quote for your car
          </h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            Tell us the make, model, year, condition and the Gold Coast address.
            There is no obligation, and removal is included for a vehicle we agree
            to buy.
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
