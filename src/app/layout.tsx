import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAdsTracking } from "@/components/GoogleAdsTracking";
import { MobileCallBar } from "@/components/MobileCallBar";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { isAdsEnabled, isSearchVisible } from "@/lib/deploy";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";

/**
 * Open Sans, self-hosted from @fontsource rather than fetched from Google.
 *
 * The old WordPress site pulled it from fonts.googleapis.com on every page
 * load — an extra third-party connection before text could render, and a
 * request to Google on behalf of every visitor. Serving it from our own
 * origin is faster and avoids the privacy question entirely.
 *
 * Every weight declared here gets its own `<link rel="preload">` on every
 * page, so the list is a per-page bandwidth cost, not a menu. Weight 300 was
 * dropped because exactly one heading used it — ~19 KB of render-priority
 * traffic on every page load for one line of text. Before adding a weight
 * back, check it earns the download.
 */
const openSans = localFont({
  src: [
    { path: "../../node_modules/@fontsource/open-sans/files/open-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/open-sans/files/open-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/open-sans/files/open-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../node_modules/@fontsource/open-sans/files/open-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-open-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Cash For Cars Gold Coast — Up to ${site.maxPayout}, Free Removal`,
    // Pages set their own full title — no suffix appended.
    template: "%s",
  },
  description: site.description,
  applicationName: site.legalName,
  // Preview deployments are kept out of search here as well as in robots.txt:
  // Disallow stops crawling, noindex removes anything already discovered.
  robots: isSearchVisible
    ? {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#c14142",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={openSans.variable}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        {/* Ads only on the production deployment — preview URLs must not fire
            production conversion tags against real ad accounts. */}
        {isAdsEnabled ? <GoogleAdsTracking /> : null}

        {/* Site-wide schema: emitted once, referenced by @id from every page. */}
        <JsonLd data={graph(organizationSchema(), websiteSchema())} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          Skip to content
        </a>

        <Header />
        {/* Bottom padding leaves room for the mobile call bar. */}
        <main id="main" className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
        <Footer />
        <MobileCallBar />
      </body>
    </html>
  );
}
