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
    // No `host:` directive. It is a Yandex extension that Google ignores, and
    // the apex/www question is already settled by the 301 in next.config.ts.
    sitemap: `${site.url}/sitemap.xml`,
  };
}
