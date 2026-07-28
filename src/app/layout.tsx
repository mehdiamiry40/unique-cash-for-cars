import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCallBar } from "@/components/MobileCallBar";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
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
