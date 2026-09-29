import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const interstateRegoFaqs = [
  {
    question: "Can I sell a NSW registered car in Queensland?",
    answer:
      "Yes. Selling the car is not the problem; the paperwork just follows the state that registered it. The sale of a NSW registered car is recorded with Service NSW, not TMR, even when the seller and buyer are both on the Gold Coast. The buyer then transfers the NSW registration or, if the car will be kept in Queensland, registers it here.",
  },
  {
    question: "How do I lodge a NSW notice of disposal if I live in Queensland?",
    answer:
      "Service NSW asks for the notice of disposal within 14 days of the sale. Service NSW says a sale to a person or dealership located interstate cannot go through the online notice, and it offers a paper Notice of Disposal form. The form can be posted to Transport for NSW or lodged at a Service NSW centre, and none of those centres is in Queensland.",
  },
  {
    question: "Does a Queensland buyer have to re-register a NSW car?",
    answer:
      "If the car will be garaged at a Queensland address, TMR says it must be registered in Queensland within 14 days and the owner may be fined if it is not. Registering it means handing in the NSW plates and providing a current Queensland safety certificate. That is the buyer's obligation, but it affects what a private buyer will pay.",
  },
  {
    question: "How do I cancel NSW registration from the Gold Coast?",
    answer:
      "Transport for NSW has a process for cancelling registration from interstate. You complete its refund form and either email it with a receipt for plates already surrendered, or post the form, documents and NSW plates to the address on the form. Any refund covers the unused motor vehicle tax from the date the plates are surrendered, and only if you cancel before the registration expires.",
  },
  {
    question: "Is a NSW pink slip the same as a Queensland safety certificate?",
    answer:
      "No. A NSW safety inspection report, or pink slip, is a NSW registration document. Registering a car in Queensland requires a current Queensland safety certificate from an approved inspection station. Do not tell a buyer that a pink slip will cover a Queensland registration.",
  },
] as const satisfies readonly Faq[];
