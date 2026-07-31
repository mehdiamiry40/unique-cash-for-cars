/**
 * Whether this build should be visible to search engines.
 *
 * Ported from the parallel migration, which correctly spotted that a preview
 * deployment left indexable competes with the real site for its own keywords —
 * and that nobody notices for months.
 *
 * That version checked the hostname per request. This reads Vercel's build-time
 * environment instead, so robots.txt and the root metadata stay static; a
 * request-time hostname check forces every page to render dynamically.
 *
 * Note the direction of the test: excluded only when the environment says
 * "preview", rather than included only when it says "production". The two
 * differ for a locally produced build — `next build` on a laptop, or
 * `vercel deploy --prebuilt` — where VERCEL_ENV is not set at all. Under the
 * stricter test those ship with noindex and quietly remove the live site from
 * Google, which is far worse than the failure this guards against.
 */
export const isSearchVisible = process.env.VERCEL_ENV !== "preview";

/**
 * Whether Google Ads conversion / call-measurement tags should load.
 *
 * Stricter than `isSearchVisible`: only the production deployment loads Ads.
 * Preview URLs and local `next build` must not fire production conversion tags
 * into the live ad account. There is no "count a local test click" mode —
 * point a separate Ads account at a preview via env vars if you need that.
 */
export const isAdsEnabled = process.env.VERCEL_ENV === "production";
