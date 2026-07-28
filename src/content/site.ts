/**
 * Single source of truth for business details.
 *
 * NAP (name / address / phone) consistency is a local-SEO ranking factor:
 * these exact strings must match your Google Business Profile and every
 * directory listing character for character. Change them here only.
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
    /** Human-readable. */
    display: "042 347 6111",
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

  address: {
    street: "20-B Bonemill Rd",
    suburb: "Runcorn",
    state: "QLD",
    postcode: "4113",
    country: "AU",
    /** Approximate depot coordinates — verify against your Google Business Profile pin. */
    geo: { lat: -27.5936, lng: 153.0741 },
  },

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
    "Logan",
    "Ipswich",
    "Brisbane South",
  ],

  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" },
    { days: ["Saturday"], opens: "08:00", closes: "16:00" },
    { days: ["Sunday"], opens: "09:00", closes: "15:00" },
  ],

  social: {
    facebook: "https://www.facebook.com/uniquecashforcars/",
  },

  /**
   * TODO — fill these in and they render automatically in the footer and
   * on the About page. Both are trust signals worth real money in this
   * industry, and you currently claim to be licensed without proving it.
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
      { label: "Cash for Cars Logan", href: "/cash-for-cars/logan" },
      { label: "Cash for Cars Ipswich", href: "/cash-for-cars/ipswich" },
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
