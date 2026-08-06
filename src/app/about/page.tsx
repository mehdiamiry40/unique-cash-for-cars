import type { Metadata } from "next";

import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";
import { CallButton, Card, Section, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "About Unique Cash For Cars | Queensland Vehicle Buyer",
  description:
    "Learn who operates the Cash For Cars Gold Coast and Car Removal Gold Coast services, how vehicle offers are calculated, and which business details apply.",
  path: "/about",
});

export default function CompanyPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
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
              We keep the quote process direct. Describe the condition, missing parts,
              registration status and pickup access accurately so the offer and removal
              plan can be confirmed before a truck is dispatched.
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

      {(site.abn || site.licenceNumber) && (
        <Section>
          <div className="mx-auto max-w-3xl">
            <SectionHeading align="left">Operator and licence details</SectionHeading>
            <Card>
              <dl className="space-y-3">
                <div className="flex gap-3">
                  <dt className="font-bold text-ink-heading">Registered entity</dt>
                  <dd>{site.registeredEntityName}</dd>
                </div>
                {site.abn && (
                  <div className="flex gap-3">
                    <dt className="font-bold text-ink-heading">ABN</dt>
                    <dd>
                      <a
                        href="https://abr.business.gov.au/ABN/View?id=39627952916"
                        className="text-brand underline"
                      >
                        {site.abn}
                      </a>
                    </dd>
                  </div>
                )}
                {site.licenceNumber && (
                  <div className="flex gap-3">
                    <dt className="font-bold text-ink-heading">QLD licence</dt>
                    <dd>
                      {site.licenceNumber} ·{" "}
                      <a
                        href="https://ftlr.fairtrading.qld.gov.au/home/search?LicenceNumber=4253110&GivenName=&LastName=&CompanyName=&MasterType=MOTOR%20DEALING"
                        className="text-brand underline"
                      >
                        check the QLD register
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        </Section>
      )}

      <PrimaryServiceLinks tone="alt" />

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Get a number for your car</SectionHeading>
          <p className="mb-7 text-lg">
            One call, no obligation either way.
          </p>
          <CallButton className="text-xl" />
        </div>
      </Section>
    </>
  );
}
