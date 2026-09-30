import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const onBehalfSaleFaqs = [
  {
    question: "Can I sell my parent's car if it is registered in their name?",
    answer:
      "Yes, if you hold authority to act for them. A parent who can still make their own decisions can sign the transfer themselves or authorise you in writing to sign and present forms for them. If they can no longer make financial decisions, you need an enduring power of attorney for financial matters that is in effect, or an administrator appointment from QCAT. Being their child or holding the keys is not authority on its own.",
  },
  {
    question: "What TMR form lets someone sign for the registered owner?",
    answer:
      "TMR publishes an authority to represent a registered operator for vehicle registration, form F5225. The person acting presents the original authority along with evidence of identity, and completes the authorisation question on the vehicle registration transfer application, form F3520. Check TMR's in-person transfer page for the current requirements before you lodge.",
  },
  {
    question: "Does a general power of attorney still work if the owner has dementia?",
    answer:
      "No. In Queensland a general power of attorney ends if the person who made it loses capacity. An enduring power of attorney continues to operate when capacity is lost. If there is no enduring power of attorney, QCAT may need to appoint an administrator before anyone can sell the car for them.",
  },
  {
    question: "Can an attorney buy the car themselves?",
    answer:
      "Only with authorisation. Buying the principal's car for yourself is a conflict transaction under Queensland's powers of attorney rules. It is allowed only if the enduring power of attorney document authorises it or QCAT approves it, so an attorney who wants to keep the car should sort that out before any money moves.",
  },
  {
    question: "Who should the sale money be paid to?",
    answer:
      "The owner. Acting for someone does not change who the car belongs to, so the proceeds belong to the registered owner and should go to an account in their name. An attorney must keep the principal's money separate from their own, so paying the sale price into the attorney's personal account is a problem even if the intention is honest.",
  },
] as const satisfies readonly Faq[];
