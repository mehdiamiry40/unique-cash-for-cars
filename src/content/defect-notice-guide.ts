import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const defectNoticeFaqs = [
  {
    question: "Can I sell a car with a defect notice in Queensland?",
    answer:
      "Yes, but the notice does not disappear with the sale. You can repair the defects and clear the notice, sell the vehicle to a licensed motor dealer, or cancel the registration. Queensland's regulation lets you stop complying with the notice after a cancellation or a disposal to a dealer only if you give the required written notice within 7 days.",
  },
  {
    question: "Is a defect notice the same as a fine?",
    answer:
      "No. A defect notice requires the owner to have the vehicle repaired so it is safe to drive. An on-the-spot fine can be issued alongside it, and failing to comply with the notice can lead to a fine, an order to present the vehicle for a full inspection, or action to cancel the registration.",
  },
  {
    question: "What is the difference between a major and a minor defect notice?",
    answer:
      "A major defect notice is issued when using the vehicle on a road poses an imminent and serious safety risk. A minor defect notice covers a safety risk that is not imminent and serious. A self-clearing notice covers a defect that does not pose a safety risk, or an obscured or illegible number plate. The notice itself states whether and how the vehicle may be driven before it is cleared.",
  },
  {
    question: "Can I drive a car with a defect notice to the buyer?",
    answer:
      "Only within the conditions printed on the notice. A vehicle ordered off the road cannot be driven at all, and a defective vehicle must not be driven or parked on a road unless it is safe and the notice's driving conditions are being followed. A sale is not one of the journeys those conditions usually allow, so arrange a tow or transporter.",
  },
  {
    question: "Can I remove the defective vehicle label before selling?",
    answer:
      "No. Where an officer attaches a defective vehicle label, a person must not remove it without a reasonable excuse. Leave it on and tell any buyer about the notice in writing.",
  },
  {
    question: "Does selling privately get rid of the defect notice?",
    answer:
      "Not by itself. The regulation's exits are a cancelled registration or a disposal to a dealer, each followed by written notice within 7 days. A registered car sold privately also generally needs a current safety certificate, which a car with uncleared defects is unlikely to obtain.",
  },
] as const satisfies readonly Faq[];
