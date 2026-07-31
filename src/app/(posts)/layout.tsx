import Link from "next/link";
import { Section } from "@/components/ui";
import { CallButton } from "@/components/ui";

/**
 * Shared shell for MDX blog posts.
 *
 * Route group `(posts)` doesn't appear in URLs, so posts keep the root-level
 * paths they had on WordPress (e.g. /how-much-is-my-scrap-car-worth-gold-coast).
 */
export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-brand">
                  Blog
                </Link>
              </li>
            </ol>
          </nav>

          <article className="prose-site">{children}</article>
        </div>
      </Section>

      <Section tone="alt">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="heading-lg mb-3">Want a number for your car?</h2>
          <p className="mb-7 text-lg">
            Free quote in about a minute, no obligation, free removal if you go ahead.
          </p>
          <CallButton className="text-xl" />
        </div>
      </Section>
    </>
  );
}
