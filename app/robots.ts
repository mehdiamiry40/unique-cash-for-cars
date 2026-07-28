import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://uniquecashforcars.com.au/sitemap.xml",
    host: "https://uniquecashforcars.com.au",
  };
}
