import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const roadworthyFaqs = [
  {
    question: "Can I advertise a registered car without a roadworthy in Queensland?",
    answer:
      "Yes. Queensland no longer requires a safety certificate merely to offer a registered vehicle for sale. For an ordinary private sale, the seller must still obtain a current safety certificate before disposing of the vehicle and give the certificate or its number to the buyer.",
  },
  {
    question: "Who is responsible for the safety certificate when selling a car?",
    answer:
      "For an ordinary private sale of a registered light vehicle, the seller is responsible for obtaining the current safety certificate and giving the required certificate information to the buyer. The buyer cannot complete the normal registration transfer without it.",
  },
  {
    question: "Can I sell an unregistered car without a safety certificate?",
    answer:
      "Yes. An unregistered vehicle can be sold in Queensland without a safety certificate. Both parties should keep a signed receipt or contract recording the date, make and model, and VIN, chassis or engine number. Driving it on the road may require a permit and CTP insurance; an unsafe vehicle should be transported.",
  },
  {
    question: "Do I need a roadworthy when selling to a licensed motor dealer?",
    answer:
      "Queensland does not require a safety certificate when a registered vehicle is traded to a licensed motor dealer. Confirm that the buyer actually holds the relevant motor-dealer licence before relying on this exemption; a towing, recycling or cash-for-cars description alone does not establish it.",
  },
  {
    question: "Can I sell a damaged car that will not pass a roadworthy?",
    answer:
      "You can repair the defects, sell the vehicle to a licensed motor dealer, or cancel the registration and sell it unregistered. A vehicle sold for parts must be de-registered first. If it is unsafe, do not drive it to the buyer; arrange suitable transport.",
  },
  {
    question: "Can a written-off car be registered again in Queensland?",
    answer:
      "A repairable write-off may be eligible for re-registration after the required repairs, safety-certificate inspection and written-off vehicle inspection. A statutory write-off can never be re-registered in Australia. Written-off notification duties may apply before disposal.",
  },
] as const satisfies readonly Faq[];
