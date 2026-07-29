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
    image: `${site.url}/img/logo-enhanced.png`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/img/logo-enhanced.png`,
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

/**
 * Article markup for the MDX blog posts.
 *
 * `posts.ts` has carried `date` and `updated` fields documented as feeding
 * "the sitemap lastmod and the Article schema" since the rebuild, but no
 * Article schema existed — the posts shipped with only the site-wide
 * Organization and WebSite nodes. This is that builder.
 */
export function articleSchema(opts: {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
}) {
  const url = `${site.url}/${opts.slug}`;

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: "en-AU",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
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

/**
 * The contact page, typed so search engines can lift the phone number and
 * hours rather than inferring them from body copy.
 */
export function contactPageSchema() {
  return {
    "@type": "ContactPage",
    "@id": `${site.url}/contact-us#webpage`,
    url: `${site.url}/contact-us`,
    name: `Contact ${site.legalName}`,
    about: { "@id": ORG_ID },
    mainEntity: { "@id": ORG_ID },
    inLanguage: "en-AU",
  };
}

/**
 * The blog index as a collection, with its posts listed.
 *
 * Each entry is a full BlogPosting reference rather than a bare @id, because
 * the posts themselves are defined on their own pages, not this one — a bare
 * {"@id"} here would dangle.
 */
export function blogSchema(posts: readonly { slug: string; title: string; date: string }[]) {
  return {
    "@type": "Blog",
    "@id": `${site.url}/blog#blog`,
    url: `${site.url}/blog`,
    name: `${site.legalName} — guides`,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-AU",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${site.url}/${post.slug}`,
      datePublished: post.date,
    })),
  };
}

/**
 * An ordered list of pages, for hub pages whose job is to point at children.
 * Gives a crawler the set explicitly rather than leaving it to link discovery.
 */
export function itemListSchema(items: readonly { name: string; path: string }[]) {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${site.url}${item.path}`,
    })),
  };
}

/** Wraps nodes in a single @graph so each page emits exactly one script tag. */
export function graph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
