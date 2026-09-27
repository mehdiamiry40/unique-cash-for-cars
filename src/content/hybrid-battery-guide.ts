import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const hybridBatteryFaqs = [
  {
    question: "Is a dead hybrid battery worth replacing?",
    answer:
      "It depends on three things: whether a warranty or the consumer guarantees still cover the fault, the written repair quote, and what the car is worth with and without a working battery. A younger car with a sound body and drivetrain is usually worth repairing. An older car with other faults building up often is not.",
  },
  {
    question: "Can I still claim if my hybrid battery warranty has expired?",
    answer:
      "Possibly. The ACCC says the consumer guarantees under the Australian Consumer Law are separate from any warranty and may still apply after it expires, if the car was not reasonably durable. They cover cars bought from a business, not one-off private sales. Raise it with the dealer that sold you the car or with the manufacturer.",
  },
  {
    question: "Can I sell a hybrid with a failed battery in Queensland?",
    answer:
      "Yes. A registered car sold privately generally needs a current safety certificate, which is difficult for a car that will not drive. The usual alternatives are to cancel the registration and sell the car unregistered, which does not need a safety certificate, or to trade it to a licensed motor dealer. Check the current TMR rules before you sell.",
  },
  {
    question: "Can a hybrid that will not start be towed?",
    answer:
      "Yes, but check the owner's manual first. Many hybrid manuals say the car must be moved with the drive wheels off the ground, or on a flatbed, because turning the wheels can damage the drivetrain or generate electricity. Tell whoever collects the car that it is a hybrid so they bring the right equipment.",
  },
  {
    question: "What happens to the old hybrid battery?",
    answer:
      "It must not go in household rubbish or a kerbside bin. If the pack is replaced, the workshop should handle it. Toyota dealers accept Toyota hybrid batteries through Toyota's recycling program. If the whole car is sold for dismantling, leave the pack installed so it goes with the car.",
  },
] as const satisfies readonly Faq[];
