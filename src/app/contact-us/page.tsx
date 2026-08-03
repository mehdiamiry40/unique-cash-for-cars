import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/content/site";
import { hrefForPlace } from "@/content/suburbs";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, contactPageSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { Card, Section, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Contact Unique Cash For Cars Gold Coast",
  description: `Call ${site.phone.display} for a free Gold Coast car quote, or send your vehicle details and we will call you back during business hours.`,
  path: "/contact-us",
});

const DAY_LABELS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact Us", path: "/contact-us" },
          ]),
          contactPageSchema(),
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h1 className="heading-xl mb-4">Contact Unique Cash For Cars Gold Coast</h1>
            <p className="mb-8 text-xl">
              The fastest way to get a number for your car is to ring us. If
              you&apos;d rather we called you, fill in the form and we&apos;ll get
              back to you.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <Card>
                <h2 className="heading-md mb-3">Phone</h2>
                <p className="mb-1">
                  <a
                    href={site.phone.href}
                    className="text-xl font-bold text-brand hover:underline"
                  >
                    {site.phone.display}
                  </a>
                </p>
                <p className="text-sm text-ink-muted">Mobile — best for quotes</p>
                <p className="mt-4 mb-1">
                  <a href={site.phoneAlt.href} className="font-bold hover:text-brand">
                    {site.phoneAlt.display}
                  </a>
                </p>
                <p className="text-sm text-ink-muted">Office landline</p>
              </Card>

              <Card>
                <h2 className="heading-md mb-3">Email</h2>
                <p className="mb-4">
                  <a href={`mailto:${site.email}`} className="font-bold text-brand hover:underline">
                    {site.email}
                  </a>
                </p>
                <p className="text-sm text-ink-muted">
                  Photos of the car help us quote accurately — attach a few if you can.
                </p>
              </Card>

              <Card>
                <h2 className="heading-md mb-3">Hours</h2>
                <ul className="space-y-1 text-sm">
                  {site.openingHours.map((slot) => (
                    <li key={slot.days.join()} className="flex justify-between gap-4">
                      <span>
                        {slot.days.length > 1
                          ? `${DAY_LABELS[slot.days[0]]}–${DAY_LABELS[slot.days[slot.days.length - 1]]}`
                          : DAY_LABELS[slot.days[0]]}
                      </span>
                      <span className="text-ink-muted">
                        {slot.opens} – {slot.closes}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <QuoteForm id="quote" />
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading>Gold Coast service area</SectionHeading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          We provide quotes and vehicle collection for Gold Coast residents.
          Call us to confirm availability in your suburb.
        </p>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.areaServed.slice(1).map((area) => {
            const href = hrefForPlace(area);
            const className =
              "block text-center font-bold text-ink-heading transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
            return href ? (
              <Link key={area} href={href} className={`rounded border border-hairline bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
                {area}
              </Link>
            ) : (
              <Card key={area} className="text-center font-bold text-ink-heading">
                {area}
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
