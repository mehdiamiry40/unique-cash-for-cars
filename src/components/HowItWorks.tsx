import { Section, SectionHeading } from "@/components/ui";

const steps = [
  {
    n: "01",
    title: "Tell us about the car",
    body: "Call us or fill in the form. We need the make, model, year, rough condition and where it's parked. That's enough for a firm number — usually in about a minute.",
  },
  {
    n: "02",
    title: "We confirm and book a time",
    body: "If you're happy with the quote we lock in a pickup. We come to you: home, work, a carpark, the side of the road. Same day is often possible.",
  },
  {
    n: "03",
    title: "Paperwork, cash, gone",
    body: "We check ID and registration, you sign the transfer, we pay you on the spot and tow the car away free. The price we quoted is the price you get.",
  },
] as const;

/**
 * The three-step process block, shared across the homepage and every
 * location page. Deliberately one component rather than copies — the old
 * site had this text duplicated across 20 pages.
 */
export function HowItWorks({ tone = "default" }: { tone?: "default" | "alt" }) {
  return (
    <Section tone={tone}>
      <SectionHeading>How selling your car works</SectionHeading>
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
