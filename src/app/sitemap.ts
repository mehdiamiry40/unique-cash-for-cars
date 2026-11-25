import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { posts } from "@/content/posts";
import { suburbPath, suburbs } from "@/content/suburbs";

/**
 * Editorial dates for the static pages whose body copy was substantially
 * rewritten, keyed by path.
 *
 * Hand-set, like `suburb.updated` and a post's `updated`. Change an entry only
 * when that page's copy really changes, and to the day it changed. Never
 * derive it from the build clock: a lastmod that moves on every deploy teaches
 * the crawler to distrust the field. A static page with no entry here has no
 * known content date and is listed without a lastmod.
 */
const contentDates: Record<string, string> = {
  "/": "2026-11-26",
  "/car-removal-gold-coast": "2026-11-26",
  "/sell-my-car-gold-coast": "2026-11-26",
};

const staticPaths = [
  "/",
  "/car-removal-gold-coast",
  "/sell-my-car-gold-coast",
  "/about",
  "/contact-us",
  "/blog",
];

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
   * field. The three rewritten pages carry the date in `contentDates`, and the
   * blog posts and suburb pages below have real dates of their own.
   */
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    /*
     * Homepage loc must match the canonical exactly. pageMeta({ path: "/" })
     * uses site.url with no trailing slash; appending "/" here made the
     * sitemap disagree with every other signal for the same URL.
     */
    url: path === "/" ? site.url : `${site.url}${path}`,
    ...(contentDates[path] ? { lastModified: new Date(contentDates[path]) } : {}),
  }));

  const postPages: MetadataRoute.Sitemap = posts
    // Archived carry-overs stay reachable but do not belong in the sitemap —
    // they compete with current guides for crawl budget and look stale in SERPs.
    .filter((p) => !p.archived)
    .map((p) => ({
      url: `${site.url}/${p.slug}`,
      lastModified: new Date(p.updated ?? p.date),
    }));

  // Suburb pages. `updated` is set by hand in suburbs.ts when a
  // page's content changes, so it is a real date and not the build time.
  const suburbPages: MetadataRoute.Sitemap = suburbs.map((suburb) => ({
    url: `${site.url}${suburbPath(suburb.slug)}`,
    lastModified: new Date(suburb.updated),
  }));

  return [...staticPages, ...suburbPages, ...postPages];
}
