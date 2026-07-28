import Link from "next/link";
import { site } from "@/content/site";
import { PhoneIcon } from "@/components/ui";

/**
 * Fixed call bar on mobile.
 *
 * This is the highest-value conversion element on the site — the old site made
 * people scroll to find a phone number. Most traffic here is someone standing
 * next to a car they want gone.
 */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-brand-dark lg:hidden">
      <a
        href={site.phone.href}
        data-cta="call-mobile-bar"
        className="flex items-center justify-center gap-2 bg-brand py-3.5 text-base font-bold text-white"
      >
        <PhoneIcon className="size-4" />
        Call Now
      </a>
      <Link
        href="/#quote"
        data-cta="quote-mobile-bar"
        className="flex items-center justify-center bg-navy py-3.5 text-base font-bold text-white"
      >
        Free Quote
      </Link>
    </div>
  );
}
