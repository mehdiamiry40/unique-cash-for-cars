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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close everything on route change. Adjusting state during render (rather
  // than in an effect) is the recommended pattern — it avoids the extra
  // render pass and the flash of an open menu on the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  // Close dropdowns on outside click or Escape.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const matches = (href: string) => {
    // A nav item can carry a placeholder href ("#") when it exists only to open
    // a submenu. startsWith("#") is never true for a pathname, so treating it
    // as a path silently left the "Services" parent inactive on all three of
    // its own child pages.
    if (!href.startsWith("/")) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  /** A parent is current when it, or any of its children, is the open page. */
  const isActive = (item: (typeof nav)[number]) =>
    matches(item.href) ||
    ("children" in item && item.children
      ? item.children.some((child) => matches(child.href))
      : false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — home`}>
          {/*
            width/height are the file's true intrinsic size (200x87). They said
            170x74, which made next/image advertise 256w and 384w candidates
            for a 200px source. Note the source is still short of a 2x render
            at h-14 — a higher-resolution logo is the only real fix for that.
          */}
          <Image
            src="/img/logo.jpg"
            alt={site.legalName}
            width={200}
            height={87}
            priority
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav ref={navRef} aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.map((item) => {
              const hasChildren = "children" in item && item.children;
              return (
                <li key={item.label} className="relative">
                  {hasChildren ? (
                    <>
                      {/*
                        No aria-haspopup. It maps to "menu", which promises
                        arrow-key navigation and roving focus that this widget
                        does not implement. aria-expanded on its own is the
                        correct disclosure pattern for a list of links.
                      */}
                      <button
                        type="button"
                        aria-expanded={openMenu === item.label}
                        aria-current={isActive(item) ? "true" : undefined}
                        onClick={() =>
                          setOpenMenu(openMenu === item.label ? null : item.label)
                        }
                        className={`flex items-center gap-1 py-2 text-[0.95rem] uppercase tracking-wide transition-colors hover:text-brand ${
                          isActive(item) ? "text-brand" : "text-ink"
                        }`}
                      >
                        {item.label}
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                          className={`size-4 transition-transform ${
                            openMenu === item.label ? "rotate-180" : ""
                          }`}
                        >
                          <path d="M5.5 7.5 10 12l4.5-4.5H5.5Z" />
                        </svg>
                      </button>
                      {openMenu === item.label && (
                        <ul className="absolute left-0 top-full z-50 min-w-64 rounded border border-hairline bg-surface py-2 shadow-lg">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={matches(child.href) ? "page" : undefined}
                                className="block px-4 py-2.5 text-sm hover:bg-surface-alt hover:text-brand"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={matches(item.href) ? "page" : undefined}
                      className={`block py-2 text-[0.95rem] uppercase tracking-wide transition-colors hover:text-brand ${
                        isActive(item) ? "text-brand" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.phone.href}
            data-cta="call-header"
            className="hidden items-center gap-2 rounded bg-brand px-5 py-3 text-lg font-bold text-white transition-colors hover:bg-brand-dark sm:inline-flex"
          >
            <PhoneIcon />
            <span className="whitespace-nowrap">{site.phone.display}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="rounded p-2.5 text-ink-heading hover:bg-surface-alt lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
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
                  {"children" in item && item.children ? (
                    <details>
                      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold uppercase tracking-wide">
                        {item.label}
                        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                          <path d="M5.5 7.5 10 12l4.5-4.5H5.5Z" />
                        </svg>
                      </summary>
                      <ul className="pb-2 pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={matches(child.href) ? "page" : undefined}
                              className="block py-2.5 text-sm hover:text-brand"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={matches(item.href) ? "page" : undefined}
                      className="block py-3 text-sm font-semibold uppercase tracking-wide hover:text-brand"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
