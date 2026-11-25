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
  /**
   * Homepage meta description, and the fallback wherever a page has none. It
   * is also the WebSite and homepage Service description in the schema, so it
   * has to describe the whole service in at most 155 characters.
   */
  description:
    "Cash for cars on the Gold Coast from a licensed Queensland buyer. Any make or condition, free removal, payment method confirmed before pickup. Open 7 days.",

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

  /**
   * No email address is published. This domain has no mailbox, so an address
   * on it bounces. Contact is by phone and the quote form. Add an `email`
   * field back only once the address is confirmed to receive mail.
   */

  /**
   * Registered as a service-area business: we travel to the customer.
   * Keep this list aligned with the service area set in Google Business Profile.
   *
   * Every place after "Gold Coast" has a page in src/content/suburbs.ts, in
   * the same order. A test fails if the two lists differ, so adding a place
   * here means writing its page as well. Ipswich, Logan and Toowoomba are
   * outside the Gold Coast. Adelaide is not listed: it is in South Australia.
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
    "Ipswich",
    "Logan",
    "Toowoomba",
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
  /**
   * The register's search page. Its results endpoint returns raw JSON, which
   * reads as a broken page to a customer, so link here and show the number to
   * search for beside the link.
   */
  licenceRegisterUrl: "https://ftlr.fairtrading.qld.gov.au/",

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
