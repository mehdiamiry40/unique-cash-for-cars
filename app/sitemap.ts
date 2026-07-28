import type { MetadataRoute } from "next";

const routes = [
  "",
  "/sell-my-car-gold-coast",
  "/car-removal-gold-coast",
  "/unwanted-car-buyer",
  "/cash-for-cars",
  "/company-info-cash-for-cars-gold-coast-and-free-car-removal",
  "/contact-us",
  "/privacy-policy",
  "/blog",
  "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
  "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld",
  "/top-5-reasons-to-sell-your-car-for-cash-in-brisbane",
  "/5-best-luxury-eco-friendly-cars-in-australia-2020",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://uniquecashforcars.com.au${route}/`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("blog") ? 0.5 : 0.8,
  }));
}
