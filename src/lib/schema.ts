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
    name: site.name,
    legalName: site.registeredEntityName,
    url: site.url,
    telephone: site.phone.e164,
    email: site.email,
    image: `${site.url}/img/logo.png`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/img/logo.png`,
      caption: site.name,
    },
    currenciesAccepted: "AUD",
    areaServed: site.areaServed.map((name) => ({
      "@type": name === "Gold Coast" ? "City" : "Place",
      name,
    })),
    openingHoursSpecification: site.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Gold Coast cash car and removal services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": `${site.url}#service`,
            name: "Cash For Cars Gold Coast",
            serviceType: "Cash For Cars Gold Coast",
            url: site.url,
            areaServed: { "@type": "City", name: "Gold Coast" },
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": `${site.url}/car-removal-gold-coast#service`,
            name: "Car Removal Gold Coast",
            serviceType: "Car Removal Gold Coast",
            url: `${site.url}/car-removal-gold-coast`,
            areaServed: { "@type": "City", name: "Gold Coast" },
          },
        },
      ],
    },
    sameAs: [site.social.facebook].filter(Boolean),
    ...(site.abn ? { taxID: site.abn } : {}),
    ...(site.licenceNumber
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: "Queensland motor dealer licence",
            value: site.licenceNumber,
          },
        }
      : {}),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
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
      item: crumb.path === "/" ? site.url : `${site.url}${crumb.path}`,
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
    image: `${site.url}/img/Best-Cash-for-Cars-Gold-Coast.jpg`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: "en-AU",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  areaServed: string;
  areaType?: "City" | "Place";
  path: string;
  serviceType: string;
}) {
  const url = opts.path === "/" ? site.url : `${site.url}${opts.path}`;

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": opts.areaType ?? "City", name: opts.areaServed },
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
    name: `Contact ${site.name}`,
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
    name: `${site.name} — guides`,
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
