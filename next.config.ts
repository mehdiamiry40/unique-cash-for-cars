import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { retiredSuburbRedirects } from "./src/content/suburbs";
import { resolveQuoteDelivery } from "./src/lib/quote-delivery";

/**
 * URL preservation is the highest-risk part of this migration.
 *
 * Rules:
 *  1. Every URL that ranked on WordPress either resolves here or permanently
 *     redirects to the
 *     closest equivalent. Nothing 404s.
 *  2. WordPress served trailing slashes (/cash-for-cars/southport/). Next
 *     serves without by default and redirects — that's fine and expected, but
 *     the canonical tags in src/lib/seo.ts must match the non-slash form.
 *  3. Redirects are permanent. Temporary redirects don't pass link equity.
 */

if (process.env.VERCEL_ENV === "production") {
  const quoteDelivery = resolveQuoteDelivery({
    webhookUrl: process.env.QUOTE_WEBHOOK_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    toEmail: process.env.QUOTE_TO_EMAIL,
    fromEmail: process.env.QUOTE_FROM_EMAIL,
  });

  if (!quoteDelivery.ok) {
    throw new Error(
      `Production quote delivery configuration is invalid (${quoteDelivery.reason}). Configure exactly one complete delivery method.`,
    );
  }

  if (
    quoteDelivery.provider === "resend" &&
    !process.env.QUOTE_FROM_EMAIL?.trim()
  ) {
    throw new Error(
      "Production Resend delivery requires QUOTE_FROM_EMAIL on a verified sending domain.",
    );
  }
}

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
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.uniquecashforcars.com.au" }],
        destination: "https://uniquecashforcars.com.au/:path*",
        permanent: true,
      },

      // Consolidate overlapping commercial intent into two canonical pillars.
      { source: "/cash-for-cars", destination: "/", permanent: true },
      { source: "/sell-my-car-gold-coast", destination: "/", permanent: true },
      { source: "/unwanted-car-buyer", destination: "/", permanent: true },
      {
        source: "/car-wreckers-gold-coast",
        destination: "/car-removal-gold-coast",
        permanent: true,
      },
      {
        source: "/car-disposals",
        destination: "/car-removal-gold-coast",
        permanent: true,
      },
      {
        source: "/services/car-disposals",
        destination: "/car-removal-gold-coast",
        permanent: true,
      },
      {
        source: "/car-recyclers",
        destination: "/car-removal-gold-coast",
        permanent: true,
      },
      {
        source: "/company-info-cash-for-cars-gold-coast-and-free-car-removal",
        destination: "/about",
        permanent: true,
      },

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
          {
            // Two years, subdomains included, preload-eligible. Vercel normally
            // sets this for custom domains, but relying on the host to supply a
            // security header means it silently disappears if the host changes.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            /*
             * Deliberately no script-src or style-src.
             *
             * Locking those down properly needs per-request nonces, which means
             * middleware, which means every page renders dynamically — a real
             * cost for a site that is otherwise entirely static, and
             * 'unsafe-inline' would buy nothing. The four directives below need
             * no nonce and still close the openings that matter here:
             * clickjacking (backing up X-Frame-Options with the modern
             * equivalent), <base> injection, form exfiltration to a third-party
             * host, and legacy plugin embedding.
             */
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
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
