import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { Card, Container, Section, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Contact Unique Cash For Cars — Gold Coast, Logan & Ipswich",
  description:
    "Call 042 347 6111 for a free car quote, or send us your details and we'll ring you back. Depot in Runcorn, servicing the Gold Coast, Logan and Ipswich.",
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
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h1 className="heading-xl mb-4">Contact us</h1>
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
                <h2 className="heading-md mb-3">Depot</h2>
                <address className="not-italic">
                  {site.address.street}
                  <br />
                  {site.address.suburb} {site.address.state} {site.address.postcode}
                </address>
                <p className="mt-3 text-sm text-ink-muted">
                  We come to you — you don&apos;t need to bring the car here.
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
        <SectionHeading>Where we come from</SectionHeading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg">
          Our yard is in Runcorn on Brisbane&apos;s southside, which puts Logan
          minutes away and the Gold Coast a straight run down the M1.
        </p>
        <Container>
          <div className="overflow-hidden rounded border border-hairline">
            <iframe
              title="Map showing our depot in Runcorn, Queensland"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`,
              )}&output=embed`}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block border-0"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
