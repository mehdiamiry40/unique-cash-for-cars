import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const personalisedPlatesFaqs = [
  {
    question: "Do personalised plates stay with the car when I sell it in Queensland?",
    answer:
      "Not automatically. Personalised plates are owned by the plate owner, not the vehicle. You can remove them and keep them, transfer them to the buyer with a personalised number plate transfer application (F2963) signed by both of you, or cancel them. Decide before the sale, because a registration transfer cannot be done online while personalised or customised plates are attached.",
  },
  {
    question: "How do I take personalised plates off a car I am selling?",
    answer:
      "Lodge a remove and/or attach personalised/customised number plates application (F2964) at a transport and motoring customer service centre, with evidence of identity for one registered operator and all plate owners and the standard plate fee. You receive standard plates for the car, which must be attached within one day.",
  },
  {
    question: "Can I keep my personalised plates if I scrap the car?",
    answer:
      "Yes. When you cancel a vehicle's registration, TMR does not require you to surrender personalised or customised plates you are keeping. If you want the plate combination itself cancelled, that takes a separate cancel personalised/customised plate application (F5339) and the plates are handed in.",
  },
  {
    question: "Can I sell my personalised plates separately from the car?",
    answer:
      "Yes. Personalised plates can be transferred to another person or organisation with form F2963, signed by the seller and the buyer. A transfer fee usually applies, but may not when the plates are given to a spouse, parent or child, or pass to a beneficiary, administrator or executor of a deceased estate.",
  },
  {
    question: "What is the difference between personalised and customised plates when selling?",
    answer:
      "Personalised plates can be sold or transferred to another person. Customised plates cannot, because their ownership is not transferable. When selling a car with customised plates, you either remove them and attach them to another vehicle you own, or leave them on, in which case they become standard plates when the vehicle is transferred.",
  },
] as const satisfies readonly Faq[];
