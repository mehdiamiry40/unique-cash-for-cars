import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSuburb, suburbs } from "@/content/suburbs";
import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  serviceSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CallButton, Card, Container, Section, SectionHeading } from "@/components/ui";
import { HowItWorks } from "@/components/HowItWorks";

type Props = { params: Promise<{ suburb: string }> };

/** Pre-renders all location pages at build time. */
export function generateStaticParams() {
  return suburbs.map((s) => ({ suburb: s.slug }));
}

/**
 * The four slugs above are the only ones that exist. Without this, an unknown
 * slug is rendered on demand just to reach notFound() — so every crawler
 * probing /cash-for-cars/<anything> costs a server invocation. Retired suburbs
 * are handled earlier, by the 301s in next.config.ts.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { suburb: slug } = await params;
  const suburb = getSuburb(slug);
  if (!suburb) return {};

  return pageMeta({
    title: suburb.title,
    description: suburb.metaDescription,
    path: `/cash-for-cars/${suburb.slug}`,
  });
}

export default async function SuburbPage({ params }: Props) {
  const { suburb: slug } = await params;
  const suburb = getSuburb(slug);
  if (!suburb) notFound();

  const others = suburbs.filter((s) => s.slug !== suburb.slug);

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cash For Cars", path: "/cash-for-cars" },
            { name: suburb.name, path: `/cash-for-cars/${suburb.slug}` },
          ]),
          serviceSchema({
            name: `Cash for cars ${suburb.name}`,
            description: suburb.metaDescription,
            areaServed: suburb.name,
          }),
          faqSchema(suburb.faqs),
        )}
      />

      {/* Hero */}
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
                <li>
                  <Link href="/cash-for-cars" className="hover:text-brand">
                    Cash For Cars
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-ink-heading">{suburb.name}</li>
              </ol>
            </nav>

            <p className="mb-2 text-lg text-brand">
              {suburb.region} · {suburb.postcode}
            </p>
            <h1 className="heading-xl mb-4">{suburb.h1}</h1>
            <p className="mb-6 text-xl text-ink">{suburb.hook}</p>

            <Card className="mb-8 bg-surface-alt">
              <p className="text-base">
                <span className="font-bold text-ink-heading">
                  Pickup availability:
                </span>{" "}
                {suburb.pickupNote}. Removal is free and we pay cash on collection —
                up to {site.maxPayout} depending on the vehicle.
              </p>
            </Card>

            <div className="flex flex-wrap gap-4">
              <CallButton />
              <a
                href="#quote"
                className="inline-flex items-center justify-center rounded border-2 border-brand px-7 py-3.5 text-base font-bold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                Get a free quote
              </a>
            </div>
          </div>

          <QuoteForm id="quote" />
        </div>
      </Section>

      {/* The genuinely local section — this is what makes the page not a duplicate */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">{suburb.localAngle.heading}</SectionHeading>
          <div className="space-y-4 text-lg">
            {suburb.localAngle.body.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* Coverage */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" as="h2">
              Where we collect in {suburb.name}
            </SectionHeading>
            <ul className="space-y-2.5">
              {suburb.coverage.map((area) => (
                <li key={area} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading align="left" as="h2">
              Also collected on the same run
            </SectionHeading>
            <p className="mb-4">
              If you&apos;re just outside {suburb.name}, we&apos;re almost certainly
              already coming your way:
            </p>
            <ul className="flex flex-wrap gap-2">
              {suburb.nearby.map((area) => (
                <li
                  key={area}
                  className="rounded-full border border-hairline bg-surface-alt px-4 py-1.5 text-sm"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <HowItWorks tone="alt" />

      {/* FAQs */}
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>Questions we get about {suburb.name}</SectionHeading>
          <FaqAccordion faqs={suburb.faqs} />
        </div>
      </Section>

      {/* Other locations — real internal linking, not a footer dump */}
      <Section tone="alt">
        <SectionHeading>Other areas we cover</SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/cash-for-cars/${other.slug}`}
                className="group block h-full rounded border border-hairline bg-surface p-5 transition-colors hover:border-brand"
              >
                <span className="heading-md block group-hover:text-brand">
                  Cash for Cars {other.name}
                </span>
                <span className="mt-1 block text-sm text-ink-muted">{other.hook}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Closing CTA */}
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">
            Get a quote for your {suburb.name} car
          </h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            One phone call, a firm number in about a minute, and free removal.{" "}
            {suburb.pickupNote}.
          </p>
          <a
            href={site.phone.href}
            data-cta="call-suburb-footer"
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}
