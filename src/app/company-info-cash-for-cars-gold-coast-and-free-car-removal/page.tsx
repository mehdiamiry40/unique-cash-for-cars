import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { CallButton, Card, Section, SectionHeading } from "@/components/ui";

/**
 * URL kept exactly as it was on WordPress. It's an ugly slug, but it's an
 * indexed one — renaming it would throw away whatever equity it has for no gain.
 */
export const metadata: Metadata = pageMeta({
  title: "About Unique Cash For Cars — Licensed QLD Vehicle Buyer",
  description:
    "Unique Cash For Cars buys unwanted vehicles from Gold Coast residents with free removal, straightforward quotes and cash on collection.",
  path: "/company-info-cash-for-cars-gold-coast-and-free-car-removal",
});

export default function CompanyPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            {
              name: "Company",
              path: "/company-info-cash-for-cars-gold-coast-and-free-car-removal",
            },
          ]),
        )}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <h1 className="heading-xl mb-5">About Unique Cash For Cars</h1>
          <div className="space-y-4 text-lg">
            <p>
              We buy cars nobody else wants. Scrap, damaged, flood-affected,
              unregistered, half-finished, or simply surplus to a household that has
              one car too many. We pay cash, we tow for free, and we recycle what&apos;s
              left properly.
            </p>
            <p>
              We service Gold Coast residents and arrange collection directly from
              homes, workplaces and other accessible locations across the city.
            </p>
            <p>
              We&apos;re a small operation, which we think works in your favour. The
              person who quotes your car is the person who authorises the payment, so
              the number doesn&apos;t change between the phone call and the driveway.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">How we price a car</SectionHeading>
          <div className="space-y-4 text-lg">
            <p>
              There&apos;s no mystery to it. A car&apos;s value to us is the sum of
              what can be recovered from it: the drivetrain, the catalytic converter,
              reusable panels, glass, wheels, lights and interior trim, plus the weight
              of steel left over.
            </p>
            <p>
              That&apos;s why we ask what looks like a lot of questions on the phone,
              and why we can&apos;t advertise one flat rate. A complete 2012 hatchback
              that won&apos;t start is worth considerably more than a stripped 2012
              hatchback with the engine already sold off, even though they look similar
              in a photo.
            </p>
            <p>
              It&apos;s also why we&apos;d rather you told us about the damage up
              front. A quote based on accurate information is one we can honour. A
              quote based on an optimistic description is one that gets revised in your
              driveway, which is a bad experience for everyone.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="left">Licensing and credentials</SectionHeading>

          {site.abn || site.licenceNumber ? (
            <Card>
              <dl className="space-y-3">
                {site.abn && (
                  <div className="flex gap-3">
                    <dt className="font-bold text-ink-heading">ABN</dt>
                    <dd>{site.abn}</dd>
                  </div>
                )}
                {site.licenceNumber && (
                  <div className="flex gap-3">
                    <dt className="font-bold text-ink-heading">QLD licence</dt>
                    <dd>{site.licenceNumber}</dd>
                  </div>
                )}
              </dl>
            </Card>
          ) : (
            /*
             * DEV NOTE — remove this block once site.abn and site.licenceNumber
             * are filled in. The old site claimed to be "a trustworthy and
             * licensed business" on nearly every page while displaying no ABN,
             * no licence number and no named staff. Unverifiable claims are
             * worth less than nothing on a page where the reader is deciding
             * whether to hand a stranger their car.
             */
            <Card className="border-brand bg-brand/5">
              <p className="font-bold text-brand-dark">Owner action required</p>
              <p className="mt-2">
                Add your ABN and QLD licence number to{" "}
                <code className="rounded bg-surface-alt px-1.5 py-0.5 text-sm">
                  src/content/site.ts
                </code>{" "}
                and this section fills itself in, here and in the footer. Photos of
                the yard and the name of whoever answers the phone belong here too —
                they do more for conversion than another paragraph of copy.
              </p>
            </Card>
          )}
        </div>
      </Section>

      <Section tone="alt">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Get a number for your car</SectionHeading>
          <p className="mb-7 text-lg">
            One call, about a minute, no obligation either way.
          </p>
          <CallButton className="text-xl" />
        </div>
      </Section>
    </>
  );
}
