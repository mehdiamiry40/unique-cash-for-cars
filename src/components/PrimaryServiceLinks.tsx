import Link from "next/link";

import { CallButton, Section, SectionHeading } from "@/components/ui";

type ServiceKey = "cash" | "removal";

const services = [
  {
    key: "cash" as const,
    name: "Cash For Cars Gold Coast",
    href: "/",
    description:
      "Get an offer for your vehicle based on its make, model, year, condition and completeness.",
  },
  {
    key: "removal" as const,
    name: "Car Removal Gold Coast",
    href: "/car-removal-gold-coast",
    description:
      "See how free collection works for non-running, damaged, unregistered and end-of-life vehicles.",
  },
] as const;

/**
 * Contextual links back to the site's two commercial pillars.
 *
 * Supporting pages use this instead of competing for either exact query in
 * their own title or H1. On a pillar page the current service is rendered as
 * text, avoiding a pointless self-link while still presenting the two choices.
 */
export function PrimaryServiceLinks({
  current,
  tone = "alt",
}: {
  current?: ServiceKey;
  tone?: "default" | "alt";
}) {
  return (
    <Section tone={tone}>
      <div className="mx-auto max-w-4xl">
        <SectionHeading>Choose the service you need</SectionHeading>
        <ul className="grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <li
              key={service.key}
              className="rounded border border-hairline bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <h3 className="heading-md mb-2">
                {service.key === current ? (
                  service.name
                ) : (
                  <Link
                    href={service.href}
                    className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {service.name}
                  </Link>
                )}
              </h3>
              <p>{service.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <CallButton />
        </div>
      </div>
    </Section>
  );
}
