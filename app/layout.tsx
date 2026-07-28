import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uniquecashforcars.com.au"),
  title: {
    default: "Unique Cash for Cars Gold Coast",
    template: "%s | Unique Cash for Cars",
  },
  description:
    "Fast cash offers and free car removal across the Gold Coast for old, damaged and unwanted vehicles.",
  applicationName: "Unique Cash for Cars",
  authors: [{ name: "Unique Cash for Cars" }],
  creator: "Unique Cash for Cars",
  publisher: "Unique Cash for Cars",
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Unique Cash for Cars",
    title: "Cash for Cars Gold Coast",
    description: "Fast quotes, free removal and same-day pickup options.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Cash for Cars Gold Coast — fast quotes and free removal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash for Cars Gold Coast",
    description: "Fast quotes, free removal and same-day pickup options.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
