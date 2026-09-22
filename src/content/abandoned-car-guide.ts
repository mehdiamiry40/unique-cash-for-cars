import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const abandonedCarFaqs = [
  {
    question: "Can I sell a car someone abandoned on my property in Queensland?",
    answer:
      "Not straight away, and not on the basis that it is parked on your land. The registered operator still owns it. Every lawful route to selling or scrapping an abandoned vehicle runs through a process first — the residential tenancy rules, the uncollected goods rules, or a tribunal or court order — and which one applies depends on how the car came to be there.",
  },
  {
    question: "Will the council remove an abandoned car from private property?",
    answer:
      "Generally no. Council powers over abandoned vehicles are directed at roads and public land. Where a vehicle sits on private property, arranging its removal is usually the landowner's responsibility. It is still worth reporting the vehicle, because the council can confirm whether the matter is theirs and what its local laws require.",
  },
  {
    question: "Should I call the police about an abandoned car?",
    answer:
      "Report it early. A dumped car can be a stolen car, and that changes everything about who may lawfully move or dispose of it. Queensland Police take reports of abandoned and suspicious vehicles through Policelink on 131 444, or Triple Zero if something is happening at the time.",
  },
  {
    question: "Can I find out who owns an abandoned car from its number plate?",
    answer:
      "Not as a member of the public. Transport and Main Roads holds registered operator details and releases them only on a written release of information request, assessed case by case against set reasons. A fee applies and processing is not immediate, so lodge it early rather than as a last step.",
  },
  {
    question: "A tenant left a car behind. How long do I have to keep it?",
    answer:
      "The residential tenancy rules set both a value threshold and a storage period, and they are updated from time to time, so check the Residential Tenancies Authority guidance for the current figures rather than relying on what applied at the last tenancy. The rules also require reasonable efforts to contact the person entitled to the goods, and they govern how any sale proceeds must be handled.",
  },
  {
    question: "Can I just tow the car off my property myself?",
    answer:
      "Towing from private property in Queensland is a regulated activity. Transport and Main Roads requires that vehicles be towed only by accredited tow truck operators using authorised tow trucks, under a written contract with the property owner or occupier and a completed Towing Consent. Moving the car is also not the same as acquiring the right to dispose of it.",
  },
] as const satisfies readonly Faq[];
