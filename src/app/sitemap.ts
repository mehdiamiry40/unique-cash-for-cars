import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { suburbs } from "@/content/suburbs";
import { posts } from "@/content/posts";

/**
 * Replaces the Yoast sitemap index. Submit https://uniquecashforcars.com.au/sitemap.xml
 * in Search Console after launch — the old /sitemap_index.xml 301s here
 * (see next.config.ts) so existing submissions keep working.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * No `lastModified` on the pages that have no real content date.
   *
   * These entries used to be stamped with the build time, which told Google
   * that all nine static pages and every location page had changed on every
   * deploy — including deploys that touched none of them. An omitted lastmod
   * is treated as "unknown"; a wrong one teaches the crawler to distrust the
   * field. The blog posts below do have real dates, so they keep theirs.
   */
  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
      { url: `${site.url}/cash-for-cars`, changeFrequency: "monthly", priority: 0.9 },
      { url: `${site.url}/sell-my-car-gold-coast`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${site.url}/car-removal-gold-coast`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${site.url}/unwanted-car-buyer`, changeFrequency: "monthly", priority: 0.8 },
      {
        url: `${site.url}/company-info-cash-for-cars-gold-coast-and-free-car-removal`,
        changeFrequency: "yearly",
        priority: 0.5,
      },
      { url: `${site.url}/contact-us`, changeFrequency: "yearly", priority: 0.7 },
      { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${site.url}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    ] satisfies MetadataRoute.Sitemap
  );

  const suburbPages: MetadataRoute.Sitemap = suburbs.map((s) => ({
    url: `${site.url}/cash-for-cars/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${site.url}/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticPages, ...suburbPages, ...postPages];
}
