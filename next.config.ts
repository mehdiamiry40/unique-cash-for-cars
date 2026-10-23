import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { retiredSuburbRedirects } from "./src/content/suburbs";
import { join } from "node:path";
import { contentSecurityPolicy } from "./src/lib/csp";
import { resolveQuoteDelivery } from "./src/lib/quote-delivery";
import { scheduleInlineScriptCsp } from "./scripts/publish-csp.mjs";

// The config is evaluated before NEXT_PHASE is assigned, so the build cannot
// be detected from that variable here. Skip worker processes: they exit while
// pages are still being written. The parent `next build` process checks the
// header as it exits. On Vercel that is too late to change the deployed
// header — scripts/csp-adapter.mjs runs first, inside onBuildComplete.
const isBuildWorker =
  Boolean(process.send) || process.env.NEXT_PRIVATE_BUILD_WORKER === "1";
if (!isBuildWorker) {
  scheduleInlineScriptCsp(__dirname);
}

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

  // Vercel injects its deployment adapter through NEXT_ADAPTER_PATH. That
  // adapter copies headers into the Build Output during onBuildComplete,
  // before this process exits, and it stores prerendered HTML outside
  // `.next/server/app`. Wrap it so the real script hashes are in the object
  // Vercel serialises. Local `next build` has no adapter and keeps the
  // default output layout; the exit hook patches routes-manifest.json there.
  ...(process.env.NEXT_ADAPTER_PATH
    ? { adapterPath: join(__dirname, "scripts/csp-adapter.mjs") }
    : {}),

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
      /*
       * The project's production alias served the full site with 200 and
       * index,follow — a second copy of every page, held off only by the
       * canonical. Exact host only: preview and per-deployment *.vercel.app
       * URLs must stay reachable (they are noindexed separately), and /api/ is
       * left alone so nothing calling the alias directly gets a redirect.
       */
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "unique-cash-for-cars.vercel.app" }],
        destination: "https://uniquecashforcars.com.au/:path",
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
          { key: "X-Frame-Options", value: "DENY" },
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
             * script-src is hash-based, not nonce-based. A nonce has to be
             * unique per response, and Next only stamps it onto scripts while
             * rendering dynamically — every page here is prerendered and cached
             * at the edge. The placeholder hash below is replaced with the
             * sha256 of each inline script from this build once the HTML
             * exists (scripts/csp-adapter.mjs on Vercel, scripts/publish-csp.mjs
             * otherwise). The build fails if the placeholder is still present.
             * 'strict-dynamic' is not set: it would ignore 'self' and the
             * Google host list, and the parser-inserted Next chunks plus the
             * client-inserted gtag script depend on those.
             *
             * style-src-attr stays 'unsafe-inline' because next/image emits
             * style attributes, which cannot carry a nonce or a hash.
             * style-src-elem does not, so an injected <style> tag is still
             * refused in browsers that understand the split. style-src keeps
             * 'unsafe-inline' for browsers that only read style-src.
             */
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
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
