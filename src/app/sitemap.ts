import type { MetadataRoute } from "next";
import { site } from "@/content/site";
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
   * that every static page had changed on every
   * deploy — including deploys that touched none of them. An omitted lastmod
   * is treated as "unknown"; a wrong one teaches the crawler to distrust the
   * field. The blog posts below do have real dates, so they keep theirs.
   */
  const staticPages: MetadataRoute.Sitemap = (
    [
      /*
       * Homepage loc must match the canonical exactly. pageMeta({ path: "/" })
       * uses site.url with no trailing slash; appending "/" here made the
       * sitemap disagree with every other signal for the same URL.
       */
      { url: site.url },
      { url: `${site.url}/car-removal-gold-coast` },
      { url: `${site.url}/about` },
      { url: `${site.url}/contact-us` },
      { url: `${site.url}/blog` },
    ] satisfies MetadataRoute.Sitemap
  );

  const postPages: MetadataRoute.Sitemap = posts
    // Archived carry-overs stay reachable but do not belong in the sitemap —
    // they compete with current guides for crawl budget and look stale in SERPs.
    .filter((p) => !p.archived)
    .map((p) => ({
      url: `${site.url}/${p.slug}`,
      lastModified: new Date(p.updated ?? p.date),
    }));

  return [...staticPages, ...postPages];
}
