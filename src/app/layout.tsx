import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCallBar } from "@/components/MobileCallBar";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";

/**
 * Open Sans, self-hosted from @fontsource rather than fetched from Google.
 *
 * The old WordPress site pulled it from fonts.googleapis.com on every page
 * load — an extra third-party connection before text could render, and a
 * request to Google on behalf of every visitor. Serving it from our own
 * origin is faster and avoids the privacy question entirely.
 */
const openSans = localFont({
  src: [
    { path: "../../node_modules/@fontsource/open-sans/files/open-sans-latin-300-normal.woff2", weight: "300", style: "normal" },
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
    default: `${site.legalName} Upto $9999 - Free Car Removal`,
    // Pages set their own full title — no suffix appended.
    template: "%s",
  },
  description: site.description,
  applicationName: site.legalName,
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={openSans.variable}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        {/* Site-wide schema: emitted once, referenced by @id from every page. */}
        <JsonLd data={graph(organizationSchema(), websiteSchema())} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
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
