import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { isSearchVisible } from "@/lib/deploy";

/**
 * Replaces the WordPress robots.txt, which had five malformed Disallow lines
 * like `Disallow: /https://uniquecashforcars.com.au/]Car`. They blocked nothing
 * real but signalled neglect. This is the clean version.
 *
 * Preview deployments disallow everything and advertise no sitemap, so a
 * branch URL cannot end up competing with the live site. See lib/deploy.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isSearchVisible) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

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
