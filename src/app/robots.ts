import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Replaces the WordPress robots.txt, which had five malformed Disallow lines
 * like `Disallow: /https://uniquecashforcars.com.au/]Car`. They blocked nothing
 * real but signalled neglect. This is the clean version.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
