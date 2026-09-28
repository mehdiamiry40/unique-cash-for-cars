import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const blownEngineFaqs = [
  {
    question: "Is a blown engine worth fixing?",
    answer:
      "It is worth fixing when the car will be worth clearly more after the repair than the repair costs, and the rest of the car is sound. Compare a written quote with the car's value once repaired and its value as it stands now. What you paid for the car, or have spent on it since, does not change that comparison.",
  },
  {
    question: "Can I claim for a blown engine under the consumer guarantees?",
    answer:
      "Possibly, if you bought the car from a business such as a dealer, or the engine failed after a repair or service. The ACCC says the consumer guarantees apply separately from any warranty. They do not cover one-off private sales. Raise the claim in writing with the business before you sell the car or have the engine replaced.",
  },
  {
    question: "Do I need approval to put a different engine in my car in Queensland?",
    answer:
      "TMR treats a like-for-like engine replacement as a basic modification, which does not need approval or certification as long as the vehicle still meets the applicable standards. An engine upgrade is a complex modification that must be certified by an approved person. Check TMR's current vehicle modification guidance before the work starts.",
  },
  {
    question: "Can I sell a car with a blown engine in Queensland?",
    answer:
      "Yes. A registered car sold privately generally needs a current safety certificate, which is hard to arrange for a car that will not drive. The usual alternatives are cancelling the registration and selling it unregistered, or trading it to a licensed motor dealer. Check the current TMR rules before you sell.",
  },
  {
    question: "Should I remove parts before selling a car with a blown engine?",
    answer:
      "Usually not. A buyer who dismantles cars values the gearbox, wheels, panels, glass, interior and catalytic converter as part of a complete car. Each part removed comes off the offer, and it is rarely worth the time to sell them separately. Leave the car as it is and describe the fault honestly.",
  },
] as const satisfies readonly Faq[];
