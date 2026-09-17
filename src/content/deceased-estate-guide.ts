import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const deceasedEstateFaqs = [
  {
    question: "Who can sell a car registered to someone who has died?",
    answer:
      "Transport and Main Roads accepts an executor named in the will or a grant of probate, an administrator named in letters of administration, or the next of kin where there is no will, grant of probate or letters of administration. That person deals with the registration on behalf of the estate using TMR's application to transact with registration products on behalf of a deceased person.",
  },
  {
    question: "Do I need probate to sell a deceased estate car in Queensland?",
    answer:
      "Not in every case. TMR's deceased-estate application provides a statutory declaration for a person who does not hold a grant of probate or letters of administration issued by the Supreme Court. Standard evidence of identity is still required, and certified copies are accepted when the application is lodged by post or email from interstate or overseas.",
  },
  {
    question: "What happens to the registration when TMR is told the operator has died?",
    answer:
      "TMR places a restriction against vehicles and personalised or customised plates recorded in the deceased person's name. The restriction does not cancel the registration, but the registration cannot be renewed until it is transferred to an eligible person or legal entity.",
  },
  {
    question: "Should I cancel the registration before selling the car?",
    answer:
      "TMR asks that the registration first be transferred into the estate of the deceased or to another person, and only then cancelled, so any unused portion of the registration is refunded to the correct person. Cancelling first can send a refund to an account that no longer exists.",
  },
  {
    question: "What happens to personalised plates from a deceased estate?",
    answer:
      "The plates carry the same restriction as the vehicle and must be transferred to an eligible person or legal entity before they can be used again. A transfer fee may not apply when personalised plates pass to a beneficiary, administrator or executor of a deceased estate, and notice of the transfer must be given to the chief executive within 14 days.",
  },
  {
    question: "Does a deceased estate car still need a safety certificate?",
    answer:
      "It depends on the transaction and whether an exemption applies. Queensland generally requires the person transferring a registered vehicle to give the new owner a current safety certificate, and the exemption criteria are listed on TMR's safety-certificate page. Confirm your circumstances with TMR rather than assuming the estate is exempt.",
  },
] as const satisfies readonly Faq[];
