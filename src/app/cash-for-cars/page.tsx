import Link from "next/link";
import type { Metadata } from "next";

import { site } from "@/content/site";
import { suburbs } from "@/content/suburbs";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { QuoteForm } from "@/components/QuoteForm";
import { CallButton, Section, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Cash For Cars Gold Coast | Free Vehicle Removal",
  description:
    "We buy cars across Southport, Surfers Paradise, Robina and Burleigh Heads. Get cash on collection, free towing and a fast quote.",
  path: "/cash-for-cars",
});

export default function CashForCarsHub() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cash For Cars", path: "/cash-for-cars" },
          ]),
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h1 className="heading-xl mb-4">Where we buy cars</h1>
            <p className="mb-4 text-xl">
              We collect across the Gold Coast. Each service area is
              worth a look — the access, the paperwork and the kinds of cars we see
              differ more than you&apos;d expect from suburb to suburb.
            </p>
            <p className="mb-7 text-lg">
              Not on the list? Call anyway. If you&apos;re near one of these areas
              we&apos;re probably already coming your way, and the tow is free either
              way.
            </p>
            <CallButton className="text-xl" />
          </div>
          <QuoteForm id="quote" />
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading>Our service areas</SectionHeading>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suburbs.map((suburb) => (
            <li key={suburb.slug}>
              <Link
                href={`/cash-for-cars/${suburb.slug}`}
                className="group flex h-full flex-col rounded border border-hairline bg-surface p-6 transition-colors hover:border-brand"
              >
                <span className="text-sm uppercase tracking-wide text-ink-muted">
                  {suburb.region} · {suburb.postcode}
                </span>
                <span className="heading-md mt-1 group-hover:text-brand">
                  Cash for Cars {suburb.name}
                </span>
                <span className="mt-2 flex-1 text-ink">{suburb.hook}</span>
                <span className="mt-4 text-sm font-semibold text-brand">
                  Free removal · {suburb.pickupNote}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <HowItWorks />

      <Section tone="alt">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Outside these areas?</SectionHeading>
          <p className="mb-7 text-lg">
            If your Gold Coast suburb is not listed above, ring us on{" "}
            {site.phone.display}. We service Gold Coast residents and will tell you
            straight away when we can collect your vehicle.
          </p>
          <CallButton className="text-xl" />
        </div>
      </Section>
    </>
  );
}
