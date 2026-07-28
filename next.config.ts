import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { retiredSuburbRedirects } from "./src/content/suburbs";

/**
 * URL preservation is the highest-risk part of this migration.
 *
 * Rules:
 *  1. Every URL that ranked on WordPress either resolves here or 301s to the
 *     closest equivalent. Nothing 404s.
 *  2. WordPress served trailing slashes (/cash-for-cars/southport/). Next
 *     serves without by default and redirects — that's fine and expected, but
 *     the canonical tags in src/lib/seo.ts must match the non-slash form.
 *  3. Redirects are permanent (301). Temporary redirects don't pass link equity.
 */

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],

  // Don't advertise the framework and version to anyone scanning for known
  // vulnerabilities. From the parallel migration.
  poweredByHeader: false,

  // Test seam. The preview-indexing test has to run a second build with
  // VERCEL_ENV=preview to check the noindex path, and `next build` has no
  // --distDir flag, so it redirects the output here instead of overwriting the
  // real build. Unset everywhere else, including on Vercel.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),

  // There is a stray package-lock.json in the home directory, so Turbopack
  // guesses $HOME as the workspace root and tries to watch the whole home
  // folder. Pin it to this project.
  turbopack: {
    root: __dirname,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async redirects() {
    const suburbRedirects = Object.entries(retiredSuburbRedirects).map(
      ([slug, destination]) => ({
        source: `/cash-for-cars/${slug}`,
        destination,
        permanent: true,
      }),
    );

    return [
      ...suburbRedirects,

      // WordPress internals that were indexed or linked. Send them somewhere useful.
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-login.php", destination: "/", permanent: false },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/blog/feed", destination: "/blog", permanent: true },

      // The old sitemap index lived at these paths and is submitted in Search
      // Console. Point them at the Next-generated sitemap so nothing breaks.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      {
        source: "/top-5-reasons-to-sell-your-car-for-cash-in-brisbane",
        destination: "/blog",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },

      // Images out of public/ are served with a short default max-age, unlike
      // hashed /_next/static assets. These files never change under a given
      // path — a new photo gets a new name — so they can be cached hard.
      // Pattern taken from the parallel migration.
      {
        source: "/:dir(img|assets)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // The original WordPress upload paths, kept so old image URLs and any
      // external hotlinks keep resolving after the move.
      {
        source: "/wp-content/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
