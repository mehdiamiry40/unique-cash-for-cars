import type { Metadata } from "next";
import Link from "next/link";

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
import { CallButton, Container, Section, SectionHeading } from "@/components/ui";

const PATH = "/sell-my-car-gold-coast";

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
    question: "The car is registered in my name but parked at someone else's place. What should I say?",
    answer:
      "Say whose name is on the registration, who will be at the car, and the street it is parked in. The seller needs authority to sell, and the person meeting the truck needs photo identification and the ownership papers. If those are two different people, say so before a time is booked.",
  },
  {
    question: "Should I take the number plates off before collection?",
    answer:
      "Not until you know what Transport and Main Roads wants done with them. Plates can need to be returned, or they can stay with you, depending on the registration. The guide to cancelling registration after a sale is the place to check, and personalised plates have their own steps.",
  },
] as const;

export const metadata: Metadata = pageMeta({
  title: "Sell My Car Gold Coast | What to Sort Out First",
  description:
    "Selling a car on the Gold Coast starts with registration, finance and the street it is parked in. Then ask a licensed Queensland buyer to quote that vehicle.",
  path: PATH,
});

/**
 * Seller-side page for "sell my car Gold Coast".
 *
 * The homepage owns "cash for cars gold coast" and speaks as the buyer. This
 * page speaks as the checklist a seller works through before asking for a
 * quote: which sale path they are on, which papers matter, and which Gold
 * Coast street the car is actually on.
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
            description:
              "Preparation for selling a car on the Gold Coast: registration, finance, plates and the street the car is parked in.",
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
              Selling starts with the car&apos;s papers and the street it is parked
              on. This page is the list to work through before you ask for a quote.
            </p>
            <ul className="mb-8 space-y-2.5">
              {[
                "Which sale path you are on: private listing, licensed buyer, or parts",
                "Whose name the registration is in, and whether money is still owing",
                "What happens to the plates",
                "The Gold Coast suburb and the access at that address",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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

      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">A private listing and a direct sale are different jobs</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              Listing the car yourself means writing the ad, answering messages
              and keeping the car somewhere a buyer can inspect it. While it
              stays registered, that private sale generally needs a safety
              certificate. Selling to a licensed motor dealer, or selling a car
              that is already unregistered, follows a different Queensland rule.
              The roadworthy guide separates the three so you can see which
              inspection, if any, applies to the car you have.
            </p>
            <p>
              Choose the listing when the car starts, is registered, and you
              have the days to meet people. Choose a collected sale when it does
              not start, the repair quote is the thing you are trying to avoid,
              or the car has to be gone by a date that is already on the
              calendar. The papers in the next section are the ones either path
              asks you to find.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">What to have ready</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              Photo identification for the person selling, and proof they own the
              car or have authority to sell it. If the registration is in someone
              else&apos;s name, fix that before a collection is booked. The transfer
              guide is the Queensland reference.
            </p>
            <p>
              If money is still owing, ask the lender for a payout letter and
              mention the finance when you enquire. The offer and the payment
              method are confirmed before pickup.
            </p>
            <p>
              Plates, keys and anything fitted that you are keeping come off the
              list only once you know the rules. Personalised plates have their
              own transfer. Ordinary plates may need to go back to Transport and
              Main Roads when a registration is cancelled. Take out personal
              belongings, including anything under the seats, before the car
              leaves.
            </p>
            <p>
              Then describe the vehicle: make, model, year, whether it runs, what
              is damaged or missing, and whether an insurer has assessed it. A
              quote is for that car, not for a category.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">Name the street, not just the Gold Coast</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              A tower basement in Surfers Paradise, a canal cul-de-sac in Mermaid
              Waters and an acreage track in Nerang are not the same collection.
              Each Gold Coast suburb page says what to include for that kind of
              street. Use the one that matches where the car is parked.
            </p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {coastal.map((suburb) => (
              <li key={suburb.slug}>
                <Link
                  href={suburbPath(suburb.slug)}
                  className="inline-block rounded-full border border-hairline bg-surface px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                  className="inline-block rounded-full border border-hairline bg-surface px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Cash for cars {suburb.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <HowItWorks />

      <Section tone="alt">
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
