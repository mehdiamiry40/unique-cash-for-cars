import type { Metadata } from "next";
import Link from "next/link";
import { CallButton, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page Not Found | Unique Cash For Cars",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-lg text-brand">404</p>
        <h1 className="heading-xl mb-4">We couldn&apos;t find that page</h1>
        <p className="mb-8 text-lg">
          It may have moved when we rebuilt the site. If you were after a quote,
          the fastest route is still the phone.
        </p>

        <CallButton className="text-xl" />

        <div className="mt-12 text-left">
          <h2 className="heading-md mb-4 text-center">Start with one of our services</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <Link
                href="/"
                className="block rounded border border-hairline px-4 py-3 text-center font-bold hover:border-brand hover:text-brand"
              >
                Cash For Cars Gold Coast
              </Link>
            </li>
            <li>
              <Link
                href="/car-removal-gold-coast"
                className="block rounded border border-hairline px-4 py-3 text-center font-bold hover:border-brand hover:text-brand"
              >
                Car Removal Gold Coast
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
