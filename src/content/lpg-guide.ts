import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const lpgFaqs = [
  {
    question: "Do I need a gas certificate to sell a car with LPG in Queensland?",
    answer:
      "For an ordinary registered sale, yes. Queensland's used-vehicle selling rules require a gas certificate from an authorised gas installer for a vehicle fitted with a gas fuel system, and its issue date must be no more than three months old when the registration is transferred. It is separate from, and additional to, the safety certificate.",
  },
  {
    question: "Is a gas certificate the same as a safety certificate?",
    answer:
      "No. A safety certificate comes from an approved inspection station and covers items such as brakes, tyres, steering and lights. A gas certificate comes from an authorised gas installer and covers the gas installation itself. A vehicle can pass one and fail the other, and one document never substitutes for the other.",
  },
  {
    question: "What happens if the LPG cylinder is out of date?",
    answer:
      "Automotive LPG cylinders carry a stamped test date and a refuelling outlet will not fill a cylinder past it. The cylinder has to be retested or replaced by an authorised gas installer before the system can be used again. An out-of-date cylinder does not stop you selling the car, but it does change which sale path makes sense.",
  },
  {
    question: "Do I need a gas certificate if the car is unregistered?",
    answer:
      "The requirement in TMR's selling rules is tied to the registration transfer. Where the vehicle is sold unregistered, or the registration is cancelled before the sale, there is no transfer for the certificate to attach to. Confirm your specific circumstances with TMR rather than assuming the requirement disappears.",
  },
  {
    question: "Can I take the gas system out and sell the car on petrol only?",
    answer:
      "On a dual-fuel vehicle that is an option, and the work has to be done by someone holding the relevant gas work authorisation. Removing the system changes details recorded against the vehicle, so check the current TMR requirements for notifying a modification and for dealing with the gas compliance plate before you book the work.",
  },
  {
    question: "Is a car worth more with the LPG system fitted?",
    answer:
      "It depends on the vehicle and where it is going. A working, in-date system on a car someone intends to keep driving can be a selling point. On a car headed for dismantling, the value comes from the make, model, year, condition, completeness and demand for its salvageable parts, and the cylinder is handled as a pressure vessel rather than counted as a bonus.",
  },
] as const satisfies readonly Faq[];
