/**
 * Single source of truth for business details.
 *
 * Keep these public contact details aligned with the Google Business Profile
 * and directory listings. This is a service-area business, so no street
 * address is published on the website.
 */

export const site = {
  /** Legal trading name. Use this everywhere — no variations. */
  name: "Unique Cash For Cars",
  /** Longer form for page titles and schema. */
  legalName: "Unique Cash For Cars Gold Coast",
  url: "https://uniquecashforcars.com.au",
  description:
    "We pay Cash for Cars Gold Coast up to $9,999. Earn fast cash for any vehicle, whether unwanted, old, or damaged, and receive free removal.",

  phone: {
    /**
     * Human-readable. Australian mobiles group 4-3-3, so +61423476111 is
     * "0423 476 111". It was written "042 347 6111" here, which reads as a
     * landline and is awkward to dictate — and it disagreed with the number
     * printed in the quote endpoint's own error copy.
     */
    display: "0423 476 111",
    /** E.164 for tel: links and schema. */
    e164: "+61423476111",
    href: "tel:+61423476111",
  },
  /** Secondary landline shown on the contact page. */
  phoneAlt: {
    display: "07 3219 6670",
    href: "tel:+61732196670",
  },

  email: "info@uniquecashforcars.com.au",

  /**
   * Registered as a service-area business: we travel to the customer.
   * Keep this list aligned with the service area set in Google Business Profile.
   */
  areaServed: [
    "Gold Coast",
    "Southport",
    "Surfers Paradise",
    "Robina",
    "Burleigh Heads",
    "Labrador",
    "Nerang",
    "Helensvale",
    "Mermaid Waters",
  ],

  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" },
  ],

  social: {
    facebook: "https://www.facebook.com/uniquecashforcars/",
  },

  /**
   * TODO — fill these in and they render automatically in the footer and on
   * the About page. Both are trust signals worth real money in this industry.
   *
   * The site used to assert "a licensed, insured Queensland business" in four
   * places while these were empty, which is an unsubstantiated representation
   * under Australian Consumer Law. That copy has been reworded to claims the
   * business can actually stand behind. Once you have the licence number,
   * `git log --grep="Substantiate"` shows exactly which sentences to restore.
   */
  abn: "" as string,
  licenceNumber: "" as string,

  /** Headline offer. Change once here, updates every page and title tag. */
  maxPayout: "$9,999",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  {
    label: "Cash For Cars",
    href: "/cash-for-cars",
    children: [
      { label: "Cash for Cars Southport", href: "/cash-for-cars/southport" },
      { label: "Cash for Cars Surfers Paradise", href: "/cash-for-cars/surfers-paradise" },
      { label: "Cash for Cars Robina", href: "/cash-for-cars/robina" },
      { label: "Cash for Cars Burleigh Heads", href: "/cash-for-cars/burleigh-heads" },
    ],
  },
  { label: "Company", href: "/company-info-cash-for-cars-gold-coast-and-free-car-removal" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
  {
    label: "Services",
    href: "#",
    children: [
      { label: "Sell My Car Gold Coast", href: "/sell-my-car-gold-coast" },
      { label: "Car Removal Gold Coast", href: "/car-removal-gold-coast" },
      { label: "Unwanted Car Buyer", href: "/unwanted-car-buyer" },
    ],
  },
] as const;

export type NavItem = (typeof nav)[number];
