import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/ui";
import { suburbs } from "@/content/suburbs";

const otherLinks = [
  { label: "Company", href: "/company-info-cash-for-cars-gold-coast-and-free-car-removal" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const services = [
  { label: "Sell My Car Gold Coast", href: "/sell-my-car-gold-coast" },
  { label: "Car Removal Gold Coast", href: "/car-removal-gold-coast" },
  { label: "Unwanted Car Buyer", href: "/unwanted-car-buyer" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-surface-alt pt-14">
      <Container>
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-ink-heading">
              About Us
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Phone: </span>
                <a href={site.phone.href} className="hover:text-brand">
                  {site.phone.display}
                </a>
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                <a href={`mailto:${site.email}`} className="hover:text-brand">
                  {site.email}
                </a>
              </p>
            </div>

            {/* These render only once filled in — see src/content/site.ts */}
            {site.abn && (
              <p className="mt-3 text-sm text-ink-muted">ABN {site.abn}</p>
            )}
            {site.licenceNumber && (
              <p className="text-sm text-ink-muted">
                QLD Licence {site.licenceNumber}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-ink-heading">
              Other Links
            </h2>
            <ul className="space-y-2">
              {otherLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-ink-heading">
              Services
            </h2>
            <ul className="space-y-2">
              {services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-ink-heading">
              Areas We Serve
            </h2>
            <ul className="space-y-2">
              {suburbs.map((s) => (
                <li key={s.slug}>
                  <Link href={`/cash-for-cars/${s.slug}`} className="hover:text-brand">
                    Cash For Cars {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          {/* Trading name must match Google Business Profile exactly. */}
          <p>
            Copyright {year} © {site.legalName}. All Rights Reserved.
          </p>
          <Link href="/privacy-policy" className="hover:text-brand">
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
