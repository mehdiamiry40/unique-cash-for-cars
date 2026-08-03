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
  /** Registered corporation operating the Unique Cash For Cars service. */
  registeredEntityName: "A Plus Car Removal Pty Ltd",
  url: "https://uniquecashforcars.com.au",
  description:
    "Get a firm cash offer for your Gold Coast car in about a minute. Up to $9,999, free towing, any condition. Call Unique Cash For Cars today.",

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

  /** Public registration details confirmed against the Australian and QLD registers. */
  abn: "39 627 952 916" as string,
  licenceNumber: "4253110" as string,

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
      { label: "Cash for Cars Labrador", href: "/cash-for-cars/labrador" },
      { label: "Cash for Cars Nerang", href: "/cash-for-cars/nerang" },
      { label: "Cash for Cars Helensvale", href: "/cash-for-cars/helensvale" },
      { label: "Cash for Cars Mermaid Waters", href: "/cash-for-cars/mermaid-waters" },
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
      { label: "Unwanted Car Buyer Gold Coast", href: "/unwanted-car-buyer" },
      { label: "Car Wreckers Gold Coast", href: "/car-wreckers-gold-coast" },
    ],
  },
] as const;

export type NavItem = (typeof nav)[number];
