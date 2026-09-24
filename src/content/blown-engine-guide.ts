import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const blownEngineFaqs = [
  {
    question: "Is it worth fixing a car with a blown engine?",
    answer:
      "Only when a written repair quote leaves a clear margin below what the car would be worth running, and you intend to keep it or can sell it for that figure. If the repair cost is close to the car's repaired value, or the quote depends on what is found once the engine is opened, selling it as it is usually leaves you better off.",
  },
  {
    question: "Can I sell a car with a blown engine privately in Queensland?",
    answer:
      "Yes, but a private sale of a registered car generally needs a current safety certificate before disposal, which is awkward for a car that cannot be driven to an inspection station. Selling it unregistered, or trading it to a licensed motor dealer, avoids that requirement. Describe the engine fault plainly and in writing whichever way you sell.",
  },
  {
    question: "Do I need approval to put a replacement engine in my car in Queensland?",
    answer:
      "A like-for-like engine replacement is treated by Transport and Main Roads as a basic modification that does not need approval, provided the vehicle still meets the applicable standards. A different engine can need certification by an approved person. Check TMR's current vehicle modification guidance before buying an engine.",
  },
  {
    question: "Should I remove parts before selling a car with a failed engine?",
    answer:
      "Usually not. A buyer assessing a non-running car is often paying for the parts that still work — the gearbox, wheels, panels, glass, interior and catalytic converter — and each one removed comes off the offer. A complete car is also simpler to load and collect.",
  },
  {
    question: "Can I drive a car with a blown engine to the buyer?",
    answer:
      "Do not try. An engine that has failed can seize, lose oil or coolant onto the road, or stop in traffic. Arrange for the car to be towed or collected on a truck, and tell whoever is collecting it that it does not run.",
  },
] as const satisfies readonly Faq[];
