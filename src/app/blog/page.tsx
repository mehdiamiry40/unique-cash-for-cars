import Link from "next/link";
import type { Metadata } from "next";

import { posts } from "@/content/posts";
import { pageMeta } from "@/lib/seo";
import { blogSchema, breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Blog — Selling, Scrapping & Removing Cars in QLD",
  description:
    "Practical guides on selling a damaged car, what scrap cars are worth, and how vehicle disposal actually works in South East Queensland.",
  path: "/blog",
});

const formatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BlogIndex() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          blogSchema(posts.filter((p) => !p.archived)),
        )}
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <h1 className="heading-xl mb-4">Blog</h1>
          <p className="mb-10 text-xl">
            Straight answers to the questions people ask before they call us.
          </p>

          <ul className="divide-y divide-hairline border-y border-hairline">
            {posts.map((post) => (
              <li key={post.slug} className="py-6">
                <article>
                  <p className="mb-1 text-sm text-ink-muted">
                    <time dateTime={post.date}>
                      {formatter.format(new Date(post.date))}
                    </time>
                    {" · "}
                    {post.readingMinutes} min read
                    {post.archived ? " · Archived" : null}
                  </p>
                  <h2 className="heading-md mb-2">
                    <Link
                      href={`/${post.slug}`}
                      className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p>{post.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
