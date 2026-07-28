import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Builds page metadata with a canonical URL always set.
 *
 * Every URL that existed on the WordPress site must keep its exact canonical
 * here — a canonical that shifts during migration is the fastest way to lose
 * the rankings you already have.
 */
export function pageMeta(opts: {
  title: string;
  description: string;
  /** Path with leading slash, no trailing slash. Use "/" for the homepage. */
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = opts.path === "/" ? site.url : `${site.url}${opts.path}`;
  /*
   * Social crawlers fetch this path directly, not through /_next/image, so the
   * extension has to match the bytes. It was served as `.png` while containing
   * JPEG — and this site sets X-Content-Type-Options: nosniff, which is
   * precisely when a strict client refuses to render the mismatch. Keep the
   * extension honest if you swap the file.
   */
  const image = opts.image ?? "/img/Best-Cash-for-Cars-Gold-Coast.jpg";

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: site.legalName,
      locale: "en_AU",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    ...(opts.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
