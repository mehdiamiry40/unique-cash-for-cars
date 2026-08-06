import Link from "next/link";
import { Section } from "@/components/ui";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";

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

      <PrimaryServiceLinks />
    </>
  );
}
