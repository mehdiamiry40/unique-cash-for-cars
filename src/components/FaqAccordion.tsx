import type { Faq } from "@/lib/schema";

/**
 * FAQ list built on native <details>/<summary> — keyboard accessible and
 * works with JavaScript disabled, unlike the old theme's accordion.
 *
 * Pair with faqSchema() from @/lib/schema on the page so the same content
 * is marked up as FAQPage.
 */
export function FaqAccordion({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-ink-heading hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
            <span>{faq.question}</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="size-5 shrink-0 text-brand transition-transform group-open:rotate-180"
            >
              <path d="M5.5 7.5 10 12l4.5-4.5H5.5Z" />
            </svg>
          </summary>
          <div className="pb-4 pr-8 text-ink">{faq.answer}</div>
        </details>
      ))}
    </div>
  );
}
