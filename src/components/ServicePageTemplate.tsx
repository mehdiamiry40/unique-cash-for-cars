import type { ServicePage } from "@/content/services";
import { site } from "@/content/site";
import { breadcrumbSchema, faqSchema, graph, serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HowItWorks } from "@/components/HowItWorks";
import { FurtherReading } from "@/components/FurtherReading";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";
import { CallButton, Container, Section, SectionHeading } from "@/components/ui";

export function ServicePageTemplate({ page }: { page: ServicePage }) {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: page.h1, path: `/${page.slug}` },
          ]),
          // Stable page-specific Service identity, matching the same service
          // advertised in the site-wide offer catalog.
          serviceSchema({
            name: page.h1,
            description: page.metaDescription,
            areaServed: "Gold Coast",
            path: `/${page.slug}`,
            serviceType: page.serviceType,
          }),
          faqSchema(page.faqs),
        )}
      />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h1 className="heading-xl mb-4">{page.h1}</h1>
            <p className="mb-7 text-xl">{page.intro}</p>
            <CallButton className="text-xl" />
          </div>
          <QuoteForm id="quote" />
        </div>
      </Section>

      {page.sections.map((section, i) => (
        <Section key={section.heading} tone={i % 2 === 0 ? "alt" : "default"}>
          <div className="mx-auto max-w-3xl">
            <SectionHeading align="left">{section.heading}</SectionHeading>
            <div className="space-y-4 text-lg">
              {section.body.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
            {section.list && (
              <ul className="mt-5 space-y-2.5">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      ))}

      <HowItWorks tone={page.sections.length % 2 === 0 ? "alt" : "default"} />

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHeading>Frequently asked questions</SectionHeading>
          <FaqAccordion faqs={page.faqs} />
        </div>
      </Section>

      {page.related && <FurtherReading slugs={page.related} />}

      <PrimaryServiceLinks current="removal" tone="default" />

      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h2 className="mb-3 text-3xl font-extrabold">Book Car Removal Gold Coast</h2>
          <p className="mx-auto mb-7 max-w-2xl text-lg text-white">
            Tell us the make, model, year, condition and exact pickup location. We&apos;ll
            quote the vehicle and confirm the removal window before dispatch.
          </p>
          <a
            href={site.phone.href}
            data-cta="call-service-footer"
            className="inline-flex items-center gap-2 rounded bg-white px-8 py-4 text-xl font-extrabold text-brand transition-colors hover:bg-surface-alt"
          >
            {site.phone.display}
          </a>
        </Container>
      </section>
    </>
  );
}
