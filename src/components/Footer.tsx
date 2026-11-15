import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/ui";

const otherLinks = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Guides", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const services = [
  { label: "Cash For Cars Gold Coast", href: "/" },
  { label: "Car Removal Gold Coast", href: "/car-removal-gold-coast" },
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
                <a
                  href={site.phone.href}
                  className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {site.phone.display}
                </a>
              </p>
            </div>

            <p className="mt-3 text-sm text-ink-muted">
              Operated by {site.registeredEntityName}
            </p>
            {site.abn && (
              <p className="text-sm text-ink-muted">ABN {site.abn}</p>
            )}
            {site.licenceNumber && (
              <p className="text-sm text-ink-muted">
                QLD Licence {site.licenceNumber} ·{" "}
                <a
                  href={site.licenceRegisterUrl}
                  className="underline hover:text-brand"
                >
                  search the register
                </a>
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
                  <Link
                    href={link.href}
                    className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
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
                  <Link
                    href={link.href}
                    className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
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
              {site.areaServed.slice(1).map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright {year} © {site.name}. All Rights Reserved.
          </p>
          <Link
            href="/privacy-policy"
            className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
