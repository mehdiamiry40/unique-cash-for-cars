import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const blownEngineFaqs = [
  {
    question: "Can I sell a car with a blown engine in Queensland?",
    answer:
      "Yes. A car does not need to run to be sold. What decides the sale path is its registration status and the buyer: a registered private sale generally needs a current safety certificate, a trade to a licensed motor dealer does not, an unregistered car can be sold without one, and a registered car sold for parts must be de-registered first. Check the current TMR guidance for your circumstances.",
  },
  {
    question: "Is it worth replacing a blown engine?",
    answer:
      "Only when the car's realistic value once running, less the full written quote for the replacement engine and the labour, still leaves you ahead of selling it as it is. Get a written diagnosis first, because a failed head gasket, a seized engine and a hole in the block are very different repairs. Also count the other ageing parts the new engine will not fix.",
  },
  {
    question: "Do I need approval to put a different engine in my car in Queensland?",
    answer:
      "TMR treats a like-for-like engine replacement as a basic modification, which does not need approval or certification by an approved person as long as the vehicle still meets the applicable standards. An engine upgrade is a complex modification that must be certified by an approved person under a Queensland-approved modification code. Confirm the category with TMR or an approved person before the work starts.",
  },
  {
    question: "Should I tell a buyer the engine is blown?",
    answer:
      "Yes. Describe the fault as you understand it and include any diagnosis you have. An accurate description means the offer is based on the car that is actually there, rather than being revised when the buyer or the collection driver finds the problem.",
  },
  {
    question: "Can I drive a car with a blown engine to the buyer?",
    answer:
      "No. A car with a failed engine should be transported, not driven. Tell the buyer or towing operator whether the car rolls, steers and brakes, and describe the access, so suitable recovery equipment is arranged before anyone arrives.",
  },
] as const satisfies readonly Faq[];
