import Link from "next/link";
import { suburbs } from "@/content/suburbs";
import { CallButton, Section } from "@/components/ui";

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
          <h2 className="heading-md mb-4 text-center">Areas we cover</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {suburbs.map((suburb) => (
              <li key={suburb.slug}>
                <Link
                  href={`/cash-for-cars/${suburb.slug}`}
                  className="block rounded border border-hairline px-4 py-3 hover:border-brand hover:text-brand"
                >
                  Cash for Cars {suburb.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
