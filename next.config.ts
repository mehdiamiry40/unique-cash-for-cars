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
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
