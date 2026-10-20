import type { Faq } from "@/lib/schema";

/**
 * Shared between the visible guide accordion and its FAQPage schema so the
 * answers presented to readers cannot drift from the structured data.
 */
export const floodDamagedCarFaqs = [
  {
    question: "Should I try to start a car that has been in floodwater?",
    answer:
      "No. RACQ advises against starting or driving a car if water has reached the interior, the engine bay or the exhaust. Water drawn into a running engine can bend internal parts, and a flooded hybrid or electric vehicle carries a risk of electric shock or fire. Photograph it where it sits and have it towed.",
  },
  {
    question: "Will my insurer write off a flood damaged car?",
    answer:
      "Often, but not automatically. The insurer's assessor looks at how far the water reached, how long the car sat in it and what it damaged, then compares the repair against the car's value. A total loss is classified as a repairable or statutory write-off, and a statutory write-off can never be registered again.",
  },
  {
    question: "Can I sell a flood damaged car in Queensland?",
    answer:
      "Yes, but how depends on its status. If it has been written off, the record stays with the VIN. If it is a total loss that nobody has notified, TMR says the owner must notify before selling or disposing of it. A registered car also needs a lawful sale path, such as cancelling the registration and selling it unregistered.",
  },
  {
    question: "Do I have to tell a buyer that my car was flooded?",
    answer:
      "Queensland Fair Trading says businesses selling water-damaged vehicles must make the water damage clear and must not mislead buyers about the history. Whoever you sell to, put the flood in writing on the receipt. Written-off status shows up on a PPSR search anyway, and corrosion can appear months later.",
  },
  {
    question: "What if my flood damaged car is not insured?",
    answer:
      "Nobody will assess it for you, so get a mechanic's written report before deciding anything. If the car is a total loss and no insurer or other notifier has written it off, check TMR's written-off vehicle notification rules before you sell or dispose of it.",
  },
] as const satisfies readonly Faq[];
