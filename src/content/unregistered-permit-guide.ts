import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const unregisteredPermitFaqs = [
  {
    question: "Do I need an unregistered vehicle permit to move my car in Queensland?",
    answer:
      "Only if the car is going to be driven on a road. A permit authorises a specific journey in an unregistered vehicle. If the car travels on a tow truck, a tilt tray or a trailer, it is not being driven and TMR does not require a permit for it.",
  },
  {
    question: "Can I get a permit for a car that is not roadworthy?",
    answer:
      "No. TMR will not issue an unregistered vehicle permit for a vehicle that is not in a safe condition to drive, or that would not pass — or has already failed — a safety inspection. A car in that condition has to be transported rather than driven.",
  },
  {
    question: "Does an unregistered vehicle permit include CTP insurance?",
    answer:
      "No. Class 22 compulsory third party insurance is a separate purchase from a licensed Queensland CTP insurer, and its cost sits outside the permit fee. Make the CTP dates match the permit dates, because a gap between them leaves part of the journey uncovered.",
  },
  {
    question: "How long does a Queensland unregistered vehicle permit last?",
    answer:
      "Permits are issued for one to seven days, based on the time the journey needs. A permit starts at 12.01am on the first day and expires at midnight on the last. The journey has to follow the most direct route to the destination.",
  },
  {
    question: "Do the number plates stay on the car?",
    answer:
      "No. A vehicle that still has plates attached, including personalised or customised plates, is not eligible for a permit, and the plates must be detached while the vehicle is driven under one. They can go back on once the vehicle passes inspection or the registration is renewed.",
  },
  {
    question: "What if I am selling the car rather than re-registering it?",
    answer:
      "Then the permit is usually the wrong tool. A permit exists to get a vehicle to an inspection, a repairer or a new registration, and it carries a fee and a separate CTP premium each time. Where the car is leaving the road for good, arranging collection avoids the drive altogether.",
  },
] as const satisfies readonly Faq[];
