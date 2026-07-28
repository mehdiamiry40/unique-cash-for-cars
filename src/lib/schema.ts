import { site } from "@/content/site";

/**
 * Structured data builders.
 *
 * `AutomotiveBusiness` is used for the service-area business. A street address
 * and coordinates are deliberately omitted because customers are served at
 * their location and the business does not publish a single public address.
 *
 * Deliberately NOT included: `aggregateRating`. Since 2019 Google does not
 * display review snippets for self-serving reviews on LocalBusiness or
 * Organization markup. Star ratings come from Google Business Profile, not
 * from markup on your own site.
 * https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
 */

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function organizationSchema() {
  return {
    "@type": "AutomotiveBusiness",
    "@id": ORG_ID,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: `${site.url}/img/logo.jpg`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/img/logo.jpg`,
      caption: site.legalName,
    },
    priceRange: "$$",
    currenciesAccepted: "AUD",
    paymentAccepted: "Cash, Bank Transfer, Cheque",
    areaServed: site.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    openingHoursSpecification: site.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [site.social.facebook].filter(Boolean),
    ...(site.abn ? { taxID: site.abn } : {}),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.legalName,
    description: site.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-AU",
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: readonly Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

export type Faq = { question: string; answer: string };

export function faqSchema(faqs: readonly Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; areaServed: string }) {
  return {
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: "Cash for cars and free car removal",
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "City", name: opts.areaServed },
  };
}

/** Wraps nodes in a single @graph so each page emits exactly one script tag. */
export function graph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
