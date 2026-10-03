import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const defectNoticeFaqs = [
  {
    question: "Can I sell a car with a defect notice in Queensland?",
    answer:
      "Yes. TMR's defect-notice guidance says that after receiving a notice you can sell the vehicle to a licensed motor dealer or cancel its registration. Once registration is cancelled the vehicle can be sold unregistered, including for parts. If you want to sell privately with the registration, repair the defects and clear the notice first, then get the safety certificate an ordinary private sale needs.",
  },
  {
    question: "What is the difference between a major, minor and self-clearing defect notice?",
    answer:
      "A major defect notice is issued when the officer reasonably believes the vehicle poses an imminent and serious safety risk. A minor defect notice covers a safety risk that is not imminent and serious. A self-clearing defect notice is issued where using the vehicle does not pose a safety risk. The notice itself states what you may do with the vehicle and how the defect must be cleared.",
  },
  {
    question: "Can I drive a car that has a defect notice?",
    answer:
      "It depends on what the notice says. A dangerous vehicle can be ordered off the road on the spot, in which case it has to be towed or carried on a trailer. A less serious defect may allow you to drive to a specified place, such as home or a repair workshop, under the conditions stated on the notice. Removing a defect label without authority is an offence.",
  },
  {
    question: "How do I clear a defect notice in Queensland?",
    answer:
      "Repair the defects, then follow the clearance method printed on the notice. Some notices need an inspection, which may be done at an approved inspection station. When the station records the inspection in TMR's online system, you do not need to visit a transport and motoring service centre to have the notice cleared.",
  },
  {
    question: "What if I cannot repair the car by the date on the defect notice?",
    answer:
      "The notice shows the date the defects must be repaired by. If you cannot meet it, TMR says you can ask the officer or transport inspector who issued the notice for an extension. If the repair is not worth doing, cancelling the registration or selling to a licensed motor dealer are the paths TMR describes.",
  },
] as const satisfies readonly Faq[];
