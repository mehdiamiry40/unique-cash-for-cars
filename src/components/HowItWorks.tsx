import { Section, SectionHeading } from "@/components/ui";

const steps = [
  {
    n: "01",
    title: "Tell us about the car",
    body: "Call us or fill in the form with the make, model, year, rough condition and pickup location. We use those details to assess the vehicle and explain the offer.",
  },
  {
    n: "02",
    title: "We confirm and book a time",
    body: "If you're happy with the quote, we confirm an available pickup window for the home, workplace, yard or breakdown location. Timing depends on the route, access and paperwork.",
  },
  {
    n: "03",
    title: "Paperwork, payment, gone",
    body: "We verify identity and ownership, then confirm the offer and payment method before pickup. When the vehicle, condition, completeness, location and access match the details supplied, the offer stands and no towing fee is deducted.",
  },
] as const;

/**
 * The three-step process block shared by the two commercial pillars.
 */
export function HowItWorks({ tone = "default" }: { tone?: "default" | "alt" }) {
  return (
    <Section tone={tone}>
      <SectionHeading>How cash for cars and car removal works</SectionHeading>
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className="rounded border border-hairline bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <span
              aria-hidden="true"
              className="mb-3 block text-4xl font-extrabold text-brand/25"
            >
              {step.n}
            </span>
            <h3 className="heading-md mb-2">{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
