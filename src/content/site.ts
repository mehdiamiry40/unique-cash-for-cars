/**
 * Single source of truth for business details.
 *
 * Keep these public contact details aligned with the Google Business Profile
 * and directory listings. This is a service-area business, so no street
 * address is published on the website.
 */

export const site = {
  /** Public website brand. The registered entity is listed separately below. */
  name: "Unique Cash For Cars",
  /** Registered corporation operating the Unique Cash For Cars service. */
  registeredEntityName: "A Plus Car Removal Pty Ltd",
  url: "https://uniquecashforcars.com.au",
  description:
    "Get a Cash For Cars Gold Coast quote up to $9,999 for any make or condition, with free car removal across the city. Call for an offer.",

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
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],

  social: {
    facebook: "https://www.facebook.com/uniquecashforcars/",
  },

  /** Licence 4253110 was current in the QLD register on 5 August 2026; recheck at expiry. */
  abn: "39 627 952 916" as string,
  licenceNumber: "4253110" as string,

  /** Headline offer. Change once here, updates every page and title tag. */
  maxPayout: "$9,999",
} as const;

export const nav = [
  { label: "Cash For Cars", href: "/" },
  { label: "Car Removal", href: "/car-removal-gold-coast" },
  { label: "About", href: "/about" },
  { label: "Guides", href: "/blog" },
  { label: "Contact", href: "/contact-us" },
] as const;

export type NavItem = (typeof nav)[number];
