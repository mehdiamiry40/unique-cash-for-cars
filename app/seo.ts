import { localPageMetadata } from "./location-pages";

type Metadata = {
  title: string;
  description: string;
  faq?: Array<{ question: string; answer: string }>;
};

const metadataByRoute: Record<string, Metadata> = {
  "/": {
    title: "Cash for Cars Gold Coast Up to $9,999 | Free Removal",
    description:
      "Sell an unwanted, old or damaged vehicle on the Gold Coast. Get a fast cash offer and free vehicle removal. Call 0423 476 111 for a quote.",
  },
  "/privacy-policy/": {
    title: "Privacy Policy | Unique Cash for Cars",
    description:
      "Read how Unique Cash for Cars collects, uses and protects personal information submitted through our website and vehicle quote forms.",
  },
  "/cash-for-cars/ipswich/": {
    title: "Cash for Cars Ipswich | Free Vehicle Removal",
    description:
      "Sell an unwanted, damaged or scrap vehicle in Ipswich. Request a cash offer with planned vehicle collection for cars, SUVs, utes and vans.",
  },
  "/cash-for-cars/logan/": {
    title: "Cash for Cars Logan | Free Vehicle Removal",
    description:
      "Get a cash offer for an old, damaged or unwanted vehicle in Logan. Cars, SUVs, utes, vans and light commercial vehicles considered.",
  },
  "/cash-for-cars/toowoomba/": {
    title: "Cash for Cars Toowoomba | Vehicle Collection",
    description:
      "Request a cash offer for an unwanted, damaged or scrap vehicle in Toowoomba, with collection planned around the vehicle and location.",
  },
  "/cash-for-cars/cash-for-cars-adelaide/": {
    title: "Cash for Cars Adelaide | Vehicle Removal",
    description:
      "Information about cash offers and vehicle removal enquiries in Adelaide. Service availability must be confirmed before making arrangements.",
  },
  "/sell-my-car-gold-coast/": {
    title: "Sell My Car Gold Coast | Fast Cash Car Buyers",
    description:
      "Sell your car on the Gold Coast without private ads or repeated inspections. Request a clear cash offer for used, damaged or unwanted vehicles.",
  },
  "/company-info-cash-for-cars-gold-coast-and-free-car-removal/": {
    title: "About Unique Cash for Cars | Gold Coast",
    description:
      "Learn about Unique Cash for Cars, our vehicle assessment process and removal service for unwanted, old and damaged vehicles on the Gold Coast.",
  },
  "/unwanted-car-buyer/": {
    title: "Unwanted Car Buyer Gold Coast | Request an Offer",
    description:
      "Request an offer for an unwanted car, SUV, ute, van or light commercial vehicle on the Gold Coast, including damaged and non-running vehicles.",
  },
  "/car-removal-gold-coast/": {
    title: "Free Car Removal Gold Coast | Same-Day Options",
    description:
      "Arrange car removal on the Gold Coast for unwanted, damaged, scrap and non-running vehicles. Collection timing is confirmed with your quote.",
  },
  "/cash-for-cars/": {
    title: "Cash for Cars Service Areas | Gold Coast",
    description:
      "View Unique Cash for Cars service areas across the Gold Coast. Choose your local suburb to request a vehicle quote and planned collection.",
  },
  "/contact-us/": {
    title: "Contact Unique Cash for Cars | Free Vehicle Quote",
    description:
      "Contact Unique Cash for Cars on 0423 476 111 or send your vehicle details online to request a no-obligation cash offer and collection plan.",
  },
  "/blog/": {
    title: "Car Selling & Removal Advice | Gold Coast Blog",
    description:
      "Practical articles about selling unwanted vehicles, car removal, damaged cars and responsible end-of-life vehicle options on the Gold Coast.",
  },
  "/5-best-luxury-eco-friendly-cars-in-australia-2020/": {
    title: "5 Eco-Friendly Luxury Cars in Australia",
    description:
      "Explore five luxury cars that combine comfort and lower-emission technology, with considerations for Australian drivers and used-car buyers.",
  },
  "/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/": {
    title: "5 Reasons to Sell Your Car for Cash in Brisbane",
    description:
      "Compare the convenience, timing and practical benefits of selling an unwanted or damaged vehicle directly to a cash car buyer in Brisbane.",
  },
  "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/": {
    title: "What to Do With a Damaged Car on the Gold Coast",
    description:
      "Compare repair, insurance, private sale and cash-for-cars options for a damaged vehicle on the Gold Coast before deciding what to do next.",
  },
  "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld/":
    {
      title: "Where Do Old Cars Go on the Gold Coast?",
      description:
        "Learn what can happen to an old or junk vehicle on the Gold Coast and compare resale, recycling, trade-in and vehicle removal options.",
    },
};

export function metadataFor(pathname: string): Metadata {
  return (
    localPageMetadata(pathname) ??
    metadataByRoute[pathname] ?? {
      title: "Unique Cash for Cars",
      description:
        "Request a cash offer and vehicle removal for an unwanted, damaged or old car on the Gold Coast.",
    }
  );
}

function breadcrumbName(segment: string) {
  const names: Record<string, string> = {
    "cash-for-cars": "Cash for Cars",
    blog: "Blog",
  };
  return (
    names[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function schemaFor(
  pathname: string,
  origin: string,
  metadata: Metadata,
) {
  const pageUrl = `${origin}${pathname}`;
  const organizationId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: Array<Record<string, unknown>> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${origin}/`,
    },
  ];

  let accumulated = "";
  pathSegments.forEach((segment, index) => {
    accumulated += `/${segment}`;
    const item: Record<string, unknown> = {
      "@type": "ListItem",
      position: index + 2,
      name:
        index === pathSegments.length - 1
          ? metadata.title.split("|")[0].trim()
          : breadcrumbName(segment),
    };
    if (index < pathSegments.length - 1) {
      item.item = `${origin}${accumulated}/`;
    }
    breadcrumbItems.push(item);
  });

  const graph: Array<Record<string, unknown>> = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: metadata.title,
      description: metadata.description,
      inLanguage: "en-AU",
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: `${origin}/`,
      name: "Unique Cash for Cars",
      description: "Cash for cars and vehicle removal on the Gold Coast",
      inLanguage: "en-AU",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "LocalBusiness",
      "@id": organizationId,
      name: "Unique Cash for Cars",
      url: `${origin}/`,
      image: `${origin}/wp-content/uploads/2023/05/uniquecashforcars.jpg`,
      telephone: "+61423476111",
      areaServed: [{ "@type": "City", name: "Gold Coast" }],
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "17:00",
      },
      sameAs: [
        "https://www.facebook.com/uniquecashforcars10/",
        "https://twitter.com/uniquecash4cars",
      ],
    },
  ];

  if (metadata.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: metadata.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e");
}
