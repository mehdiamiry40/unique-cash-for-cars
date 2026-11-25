import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { site } from "@/content/site";
import { suburbPath, suburbs } from "@/content/suburbs";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HowItWorks } from "@/components/HowItWorks";
import { FurtherReading } from "@/components/FurtherReading";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";
import {
  CallButton,
  Card,
  CheckList,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui";

const PATH = "/sell-my-car-gold-coast";

/** At most 155 characters. Also the Service description in the schema. */
const DESCRIPTION =
  "Selling a car on the Gold Coast? Sort out registration, finance, plates and the sale path, then ask a licensed Queensland buyer to quote your vehicle.";

const linkClass =
  "font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const heroPoints = [
  "Pick the sale path: private buyer, licensed dealer, or unregistered and for parts",
  "Check whose name is on the registration",
  "Get a payout letter if finance is still owing",
  "Find out what happens to the plates",
  "Note the suburb, the street and how a truck reaches the car",
] as const;

/* Who can buy the car. Each answer changes what the seller has to do first. */
const buyers: { title: string; body: ReactNode }[] = [
  {
    title: "A private buyer",
    body: (
      <>
        Suits a car that is registered, starts and drives, when you have the time
        to list it and meet people. You can advertise the car straight away, but
        a registered car sold privately in Queensland generally needs a current
        safety certificate before it changes hands.
      </>
    ),
  },
  {
    title: "A licensed motor dealer",
    body: (
      <>
        Queensland does not require a safety certificate when a registered vehicle
        is traded to a licensed motor dealer. Check that the licence belongs to
        the business buying the car. {site.name} is operated by{" "}
        {site.registeredEntityName} under licence {site.licenceNumber}, which you
        can{" "}
        <a href={site.licenceRegisterUrl} className={linkClass}>
          search on the Queensland register
        </a>
        .
      </>
    ),
  },
  {
    title: "Unregistered, or for parts",
    body: (
      <>
        An unregistered car can be sold without a safety certificate, but it
        cannot simply be driven on the road, so plan for a permit or a tow. A
        registered car sold for parts has to be de-registered first.
      </>
    ),
  },
];

/* The checklist, in the order the questions come up when a quote is asked for. */
const checklist: { title: string; body: ReactNode }[] = [
  {
    title: "Whose name is on the registration",
    body: (
      <>
        The person selling has to be the registered operator or hold lawful
        authority to sell. If the record still shows a previous owner, fix that
        before a collection is booked. Our guide to{" "}
        <Link href="/transferring-car-registration-in-queensland" className={linkClass}>
          transferring car registration in Queensland
        </Link>{" "}
        covers the seller&apos;s side and the buyer&apos;s side. A car that someone
        else left on your property is a different problem, covered in{" "}
        <Link href="/abandoned-car-private-property-queensland" className={linkClass}>
          abandoned cars on private property in Queensland
        </Link>
        .
      </>
    ),
  },
  {
    title: "Finance still owing",
    body: (
      <>
        A sale does not by itself remove a lender&apos;s registered interest in the
        car. Ask the lender for a payout figure in writing, and say that finance
        is involved when you enquire. The steps are in{" "}
        <Link href="/selling-a-car-with-finance-owing-queensland" className={linkClass}>
          selling a car with finance owing in Queensland
        </Link>
        .
      </>
    ),
  },
  {
    title: "Safety certificate, or none",
    body: (
      <>
        Work out which kind of sale you are making before you pay for an
        inspection or repairs. A private sale of a registered car generally needs
        a certificate. A trade to a licensed dealer and a sale of an unregistered
        car do not.
      </>
    ),
  },
  {
    title: "The plates",
    body: (
      <>
        Leave them on until you know what Transport and Main Roads wants done.
        Ordinary plates are normally handed in when a registration is cancelled.
        Personalised plates belong to you, not the car, and have their own steps:
        see{" "}
        <Link href="/selling-car-personalised-plates-queensland" className={linkClass}>
          selling a car with personalised plates
        </Link>
        .
      </>
    ),
  },
  {
    title: "What is in the car",
    body: (
      <>
        Take out personal belongings, including anything under the seats, and
        remove any accessories you are keeping. Say so if something fitted to the
        car has come off since you described it.
      </>
    ),
  },
  {
    title: "An accurate description",
    body: (
      <>
        Make, model, year, whether it starts, what is damaged or missing, and
        whether an insurer has assessed it. A quote is for that car, not for a
        category.
      </>
    ),
  },
];

const faqs = [
  {
    question: "Do I need a safety certificate before I sell my car on the Gold Coast?",
    answer:
      "It depends on the path. A registered car sold privately in Queensland generally needs a current safety certificate. An unregistered car, and a registered car traded to a licensed motor dealer, follow different rules, and a registered car sold for parts has to be de-registered first. The roadworthy guide sets out each path so you can see which one applies before you pay for repairs.",
  },
  {
    question: "There is still finance owing. Can I sell the car?",
    answer:
      "Yes, once the amount owing is known. Ask the lender for a payout letter and say that finance is involved when you enquire. The finance guide explains how a payout figure and the lender's registered interest are handled in the sale.",
  },
  {
    question: "Can I sell a car that is not registered in my name?",
    answer:
      "Not until you can show you are entitled to sell it. The registered operator, or someone acting with proper authority, has to complete the sale. If a previous owner never finished their side of a transfer, sort that out with Transport and Main Roads before a collection is booked. Estate vehicles and cars left behind by a tenant each follow a process of their own.",
  },
  {
    question: "The car is registered in my name but parked at someone else's place. What should I say?",
    answer:
      "Say whose name is on the registration, who will be at the car, and the street it is parked in. The seller needs authority to sell, and the person meeting the truck needs photo identification and the ownership papers. If those are two different people, say so before a time is booked.",
  },
  {
    question: "Should I cancel the registration before I sell?",
    answer:
      "Not automatically. If the car is staying on the road with a new owner, the registration is transferred, not cancelled. Cancellation applies when the car will be unregistered, dismantled or sold for parts, and a registered car sold for parts must be de-registered first. Confirm which kind of sale it is before you cancel anything.",
  },
  {
    question: "Should I take the number plates off before collection?",
    answer:
      "Not until you know what Transport and Main Roads wants done with them. Plates can need to be returned, or they can stay with you, depending on the registration. The guide to cancelling registration after a sale is the place to check, and personalised plates have their own steps.",
  },
  {
    question: "Who will buy my car if it does not run or will not pass a roadworthy?",
    answer:
      "A private buyer usually wants a car to drive, so a non-runner is a harder listing. A registered car can be traded to a licensed motor dealer without a safety certificate, and an unregistered car can be sold without one. We quote cars that do not start, as they stand, and removal is included for a vehicle we agree to buy.",
  },
] as const;

export const metadata: Metadata = pageMeta({
  title: "Sell My Car Gold Coast | Checklist, Paperwork and a Quote",
  description: DESCRIPTION,
  path: PATH,
});

/**
 * Seller-side page for "sell my car Gold Coast".
 *
 * The homepage owns "cash for cars gold coast" and speaks as the buyer.
 * /car-removal-gold-coast owns the collection. This page speaks as the
 * checklist a seller works through before asking anyone for a quote: who can
 * buy the car, which papers matter, what happens to the registration
 * afterwards, and which Gold Coast street the car is actually on. It links to
 * both pillars and to the Queensland guides, and must not turn into a second
 * homepage: no offer copy, no list of vehicle types, no removal detail.
 */
export default function SellMyCarGoldCoastPage() {
  const coastal = suburbs.filter((suburb) => suburb.region === "Gold Coast");
  const further = suburbs.filter((suburb) => suburb.region !== "Gold Coast");

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Sell My Car Gold Coast", path: PATH },
          ]),
          serviceSchema({
            name: "Sell My Car Gold Coast",
            description: DESCRIPTION,
            areaServed: "Gold Coast",
            path: PATH,
            serviceType: "Sell my car Gold Coast",
          }),
          faqSchema(faqs),
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h1 className="heading-xl mb-4">Sell My Car Gold Coast</h1>
            <p className="mb-6 text-xl">
              Selling a car on the Gold Coast goes more smoothly when the papers
              are settled before anyone quotes it. This page is the checklist to
              work through first, whoever ends up buying the car.
            </p>
            <div className="mb-8">
              <CheckList items={heroPoints} />
            </div>
            <div className="flex flex-wrap gap-4">
              <CallButton className="text-xl" />
              <a
                href="#quote"
                data-cta="quote-sell-hero"
                className="inline-flex items-center justify-center rounded border-2 border-brand px-7 py-3.5 text-lg font-bold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Request a quote
              </a>
            </div>
          </div>
          <QuoteForm id="quote" />
        </div>
      </Section>

      {/* Who buys, and what each kind of buyer asks of the seller */}
      <Section tone="alt">
        <div className="mx-auto max-w-5xl">
          <SectionHeading>Who can buy my car on the Gold Coast?</SectionHeading>
          <p className="mx-auto mb-8 max-w-3xl text-center text-lg">
            There are three kinds of sale, and each one changes what you have to
            do first.
          </p>
          <ul className="grid gap-6 lg:grid-cols-3">
            {buyers.map((buyer) => (
              <li key={buyer.title}>
                <Card className="h-full">
                  <h3 className="heading-md mb-2">{buyer.title}</h3>
                  <p>{buyer.body}</p>
                </Card>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-10 max-w-3xl space-y-4 text-lg">
            <p>
              A private sale may return more for a car that is registered,
              roadworthy and reasonably modern, if you have the days to run a
              listing. A direct sale to a licensed buyer suits the car that does
              not start, the repair quote you would rather not pay, or the car
              that has to be gone by a date already on the calendar. Our guide to{" "}
              <Link href="/sell-car-without-roadworthy-qld" className={linkClass}>
                selling a car without a roadworthy in Queensland
              </Link>{" "}
              separates the paths, so you can see which inspection, if any,
              applies to the car you have.
            </p>
            <p>
              If a direct sale is the path, our{" "}
              <Link href="/" className={linkClass}>
                cash for cars Gold Coast
              </Link>{" "}
              page explains who the buyer is and how an offer is worked out, and{" "}
              <Link href="/car-removal-gold-coast" className={linkClass}>
                car removal Gold Coast
              </Link>{" "}
              explains how the car is collected, including one that does not run.
            </p>
          </div>
        </div>
      </Section>

      {/* The checklist itself */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">What to sort out before you sell</SectionHeading>
          <ol className="space-y-6">
            {checklist.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="heading-md mb-1">{item.title}</h3>
                  <p className="text-lg">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* What happens to the registration once the car has gone */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">
            After the sale: transfer the registration, or cancel it
          </SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              What happens to the registration depends on what happens to the car.
              If it stays on the road with a new owner, the registration is
              transferred, and the seller and the buyer each have their own part
              to lodge with Transport and Main Roads. Lodge your own notice and
              keep proof of it. Until the record changes, tolls and fines can
              still come to the seller.
            </p>
            <p>
              If the car is leaving the road, sold unregistered or for parts, the
              registration is cancelled instead, and cancelling is what releases
              any refund of the unused portion. Our checklist for{" "}
              <Link
                href="/cancel-car-registration-queensland-after-sale"
                className={linkClass}
              >
                cancelling car registration in Queensland after a sale
              </Link>{" "}
              covers the form, the plates and the refund.
            </p>
            <p>
              An unregistered car cannot be driven to its buyer without the right
              paperwork. Our guide to{" "}
              <Link href="/unregistered-vehicle-permit-queensland" className={linkClass}>
                unregistered vehicle permits in Queensland
              </Link>{" "}
              explains when a permit applies and when the car has to go on a
              truck.
            </p>
            <p>
              Whichever way it goes, keep a receipt that records the buyer, the
              seller, the date and the VIN, together with the transfer or
              cancellation confirmation.
            </p>
          </div>
        </div>
      </Section>

      {/* Where the car is */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">Name the street, not just the Gold Coast</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              A tower basement in Surfers Paradise, a canal cul-de-sac in Mermaid
              Waters and an acreage track in Nerang are three different
              collections. Each suburb page says what to include for that kind of
              street. Use the one that matches where the car is parked.
            </p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {coastal.map((suburb) => (
              <li key={suburb.slug}>
                <Link
                  href={suburbPath(suburb.slug)}
                  className="inline-block rounded-full border border-hairline bg-surface-alt px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Cash for cars {suburb.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-lg">
            Ipswich, Logan and Toowoomba are outside the Gold Coast and have their
            own pages. Toowoomba is a trip over the range to the address you name,
            not a local drop-off.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {further.map((suburb) => (
              <li key={suburb.slug}>
                <Link
                  href={suburbPath(suburb.slug)}
                  className="inline-block rounded-full border border-hairline bg-surface-alt px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Cash for cars {suburb.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <HowItWorks tone="alt" />

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>Questions before you sell</SectionHeading>
          <FaqAccordion faqs={[...faqs]} />
        </div>
      </Section>

      <FurtherReading
        slugs={[
          "sell-car-without-roadworthy-qld",
          "selling-a-car-with-finance-owing-queensland",
          "transferring-car-registration-in-queensland",
          "cancel-car-registration-queensland-after-sale",
          "selling-car-personalised-plates-queensland",
          "unregistered-vehicle-permit-queensland",
        ]}
      />

      <PrimaryServiceLinks tone="default" />

      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">Ask for a quote on your car</h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            Send the make, model, year, condition and the Gold Coast address. The
            offer, the payment method and the pickup window are confirmed before
            collection.
          </p>
          <a
            href={site.phone.href}
            data-cta="call-sell-footer"
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}
