"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { nav, site } from "@/content/site";
import { Container, PhoneIcon } from "@/components/ui";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  // Close everything on route change. Adjusting state during render (rather
  // than in an effect) is the recommended pattern — it avoids the extra
  // render pass and the flash of an open menu on the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  // Close the mobile navigation on Escape.
  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        menuTriggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const matches = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          {/*
            Intrinsic size is 800×348 (≈4× the old 200×87 mark) so next/image
            can serve crisp 2×/3× candidates at the h-14 display size.
          */}
          <Image
            src="/img/logo.png"
            alt={site.name}
            width={800}
            height={348}
            priority
            sizes="129px"
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={matches(item.href) ? "page" : undefined}
                  className={`block py-2 text-[0.95rem] uppercase tracking-wide transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    matches(item.href) ? "text-brand" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.phone.href}
            data-cta="call-header"
            className="hidden items-center gap-2 rounded bg-brand px-5 py-3 text-lg font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:inline-flex"
          >
            <PhoneIcon />
            <span className="whitespace-nowrap">{site.phone.display}</span>
          </a>

          <button
            ref={menuTriggerRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="rounded p-2.5 text-ink-heading hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-6">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-hairline bg-surface lg:hidden">
          <Container className="py-3">
            <ul className="divide-y divide-hairline">
              {nav.map((item) => (
                <li key={item.label} className="py-1">
                  <Link
                    href={item.href}
                    aria-current={matches(item.href) ? "page" : undefined}
                    className="block py-3 text-sm font-semibold uppercase tracking-wide hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
