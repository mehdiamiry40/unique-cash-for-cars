import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const defectNoticeFaqs = [
  {
    question: "Can I sell a car with a defect notice in Queensland?",
    answer:
      "Yes, but not by ignoring the notice. Queensland Transport and Main Roads lists repairing the defects as the standard path, and selling the vehicle to a licensed motor dealer or cancelling its registration as the alternatives. Which one suits you depends on the repair cost and whether the car is staying on the road.",
  },
  {
    question: "Can I drive a car that has a defect notice?",
    answer:
      "Only if the notice allows it. The police officer or transport inspector who issued it decides whether the vehicle may be driven before the notice is cleared, and the notice states any conditions. A car with a defect label attached for a dangerous defect is not allowed to be driven on the road, so it has to be towed or carried.",
  },
  {
    question: "Can I remove the defect label before selling the car?",
    answer:
      "No. Removing a defect label without authorisation is an offence and can attract an on-the-spot fine. The label comes off when the notice is cleared by someone authorised to clear it, not when the car changes hands.",
  },
  {
    question: "What happens if I don't clear a defect notice?",
    answer:
      "Failing to comply with a defect notice is an offence, and Queensland's guidance says it may lead to action to cancel the vehicle's registration. If you do not intend to repair the car, choose a lawful alternative early rather than letting the time the notice allows run out.",
  },
  {
    question: "Do I need a safety certificate as well as clearing the defect notice?",
    answer:
      "For an ordinary private sale of a registered light vehicle, yes. The seller generally needs a current safety certificate, and a car with an uncleared safety defect is unlikely to pass that inspection. A sale to a licensed motor dealer, or an unregistered sale after the registration is cancelled, does not use the private-sale safety certificate path.",
  },
] as const satisfies readonly Faq[];
