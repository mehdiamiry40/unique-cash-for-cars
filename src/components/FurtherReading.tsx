import Link from "next/link";
import { getPost } from "@/content/posts";
import { Section, SectionHeading } from "@/components/ui";

/**
 * Contextual links from a service page to the guides that answer the questions
 * that page raises.
 *
 * The point is crawl depth as much as usability: without this, a post is
 * reachable only from /blog, one link deep from a single low-authority index.
 * Linking from the pages that actually rank spreads that authority and gives
 * the guides a second path in.
 *
 * Unknown slugs are skipped rather than thrown on — a typo here should not take
 * a service page down.
 */
export function FurtherReading({ slugs }: { slugs: readonly string[] }) {
  const posts = slugs.map(getPost).filter((post) => post !== undefined);
  if (posts.length === 0) return null;

  return (
    <Section tone="alt">
      <div className="mx-auto max-w-3xl">
        <SectionHeading align="left">Further reading</SectionHeading>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/${post.slug}`}
                className="group block rounded border border-hairline bg-surface p-5 transition-colors hover:border-brand"
              >
                <span className="heading-md block group-hover:text-brand">
                  {post.title}
                </span>
                <span className="mt-1 block text-ink">{post.description}</span>
                <span className="mt-2 block text-sm text-ink-muted">
                  {post.readingMinutes} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
