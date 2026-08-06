"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/content/site";
import { PhoneIcon } from "@/components/ui";

const ON_PAGE_QUOTE_PATHS = new Set([
  "/",
  "/contact-us",
  "/car-removal-gold-coast",
]);

function hasOnPageQuote(pathname: string) {
  return ON_PAGE_QUOTE_PATHS.has(pathname);
}

/**
 * Fixed call bar on mobile.
 *
 * This is the highest-value conversion element on the site — the old site made
 * people scroll to find a phone number. Most traffic here is someone standing
 * next to a car they want gone.
 */
export function MobileCallBar() {
  const pathname = usePathname() || "/";
  const quoteHref = hasOnPageQuote(pathname) ? "#quote" : "/#quote";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-brand-dark lg:hidden">
      <a
        href={site.phone.href}
        data-cta="call-mobile-bar"
        className="flex items-center justify-center gap-2 bg-brand py-3.5 text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
      >
        <PhoneIcon className="size-4" />
        Call Now
      </a>
      <Link
        href={quoteHref}
        data-cta="quote-mobile-bar"
        className="flex items-center justify-center bg-navy py-3.5 text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
      >
        Free Quote
      </Link>
    </div>
  );
}
