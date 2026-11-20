import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSuburb, suburbPath, suburbs } from "@/content/suburbs";
import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, graph, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FurtherReading } from "@/components/FurtherReading";
import { HowItWorks } from "@/components/HowItWorks";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";
import { CallButton, Card, CheckList, Container, Section, SectionHeading } from "@/components/ui";

type Props = { params: Promise<{ suburb: string }> };

/** Prerenders the suburb pages at build time. */
export function generateStaticParams() {
  return suburbs.map((suburb) => ({ suburb: suburb.slug }));
}

/**
 * Only the slugs in `suburbs` exist. An unknown slug answers 404 from the
 * static route table instead of being rendered on demand, so a crawler probing
 * /cash-for-cars/<anything> costs nothing. The retired location slugs never
 * reach this route: next.config.ts redirects them first.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { suburb: slug } = await params;
  const suburb = getSuburb(slug);
  if (!suburb) return {};

  return pageMeta({
    title: suburb.title,
    description: suburb.metaDescription,
    path: suburbPath(suburb.slug),
  });
}

/**
 * A suburb page.
 *
 * The site's two keyword pillars stay the homepage and /car-removal-gold-coast.
 * These pages target the suburb name only, and everything that is the same in
 * every suburb (how a sale works, what removal includes) is left to the shared
 * components and the pillar pages. What is written per suburb lives in
 * src/content/suburbs.ts and has to be specific to that place.
 */
export default async function SuburbPage({ params }: Props) {
  const { suburb: slug } = await params;
  const suburb = getSuburb(slug);
  if (!suburb) notFound();

  const path = suburbPath(suburb.slug);
  const neighbours = suburb.neighbours
    .map(getSuburb)
    .filter((neighbour) => neighbour !== undefined);

  return (
    <>
      <JsonLd
        data={graph(
          // No hub level: /cash-for-cars redirects to the homepage, which owns
          // the Gold Coast query, so the trail is Home → this suburb.
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: suburb.h1, path },
          ]),
          serviceSchema({
            name: suburb.h1,
            description: suburb.metaDescription,
            areaServed: suburb.name,
            areaType: "Place",
            path,
            serviceType: `Cash for cars ${suburb.name}`,
          }),
          faqSchema(suburb.faqs),
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-ink-heading">{suburb.name}</li>
              </ol>
            </nav>

            <p className="mb-2 text-lg text-brand">
              {suburb.placeLabel ?? `${suburb.region} · ${suburb.postcode}`}
            </p>
            <h1 className="heading-xl mb-4">{suburb.h1}</h1>
            <p className="mb-6 text-xl">{suburb.hook}</p>

            <Card className="mb-8 bg-surface-alt">
              <p>
                <span className="font-bold text-ink-heading">Before you call:</span>{" "}
                {suburb.accessNote} Removal is included for a vehicle we agree to buy
                within the confirmed service area, and the offer and payment method
                are confirmed before pickup.
              </p>
            </Card>

            <div className="flex flex-wrap gap-4">
              <CallButton className="text-xl" />
              <a
                href="#quote"
                data-cta="quote-suburb-hero"
                className="inline-flex items-center justify-center rounded border-2 border-brand px-7 py-3.5 text-lg font-bold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Request a quote
              </a>
            </div>
          </div>

          <QuoteForm id="quote" />
        </div>
      </Section>

      {/* The local section. This is what makes the page worth having. */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">{suburb.localAngle.heading}</SectionHeading>
          <div className="space-y-4 text-lg">
            {suburb.localAngle.body.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            {suburb.region === "Gold Coast" ? (
              <p>
                Deciding whether to sell, and what to have ready, is set out on{" "}
                <Link
                  href="/sell-my-car-gold-coast"
                  className="font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  sell my car Gold Coast
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left">Around {suburb.name}</SectionHeading>
            <p className="mb-4">
              Tell us which part of {suburb.name} the car is in, for example:
            </p>
            <CheckList items={suburb.coverage} />
          </div>
          <div>
            <SectionHeading align="left">Nearby suburbs</SectionHeading>
            <p className="mb-4">
              {suburb.name} is close to {listOf(suburb.nearbyPlaces)}. Coverage
              outside {suburb.name} is confirmed for the exact pickup address when
              you request a quote.
            </p>
            {neighbours.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {neighbours.map((neighbour) => (
                  <li key={neighbour.slug}>
                    <Link
                      href={suburbPath(neighbour.slug)}
                      className="inline-block rounded-full border border-hairline bg-surface-alt px-4 py-1.5 text-sm font-semibold transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Cash for cars {neighbour.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      <HowItWorks tone="alt" />

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>Questions about selling a car in {suburb.name}</SectionHeading>
          <FaqAccordion faqs={suburb.faqs} />
        </div>
      </Section>

      <FurtherReading slugs={suburb.guides} />

      <PrimaryServiceLinks tone="default" />

      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">
            Get a quote for a car in {suburb.name}
          </h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            Tell us the make, model, year, condition and where in {suburb.name} the
            car is parked. We confirm the offer, the payment method and the pickup
            window before collection.
          </p>
          <a
            href={site.phone.href}
            data-cta="call-suburb-footer"
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}

/** "A, B and C" for a short list of place names. */
function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
