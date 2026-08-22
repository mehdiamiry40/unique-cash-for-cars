import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { PrimaryServiceLinks } from "@/components/PrimaryServiceLinks";
import { Container, Section } from "@/components/ui";
import { posts, type Post } from "@/content/posts";
import { blogSchema, breadcrumbSchema, graph } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Gold Coast Car Selling and Removal Guides | Unique",
  description:
    "Practical Gold Coast car selling guides covering value, write-offs, finance, roadworthy rules, Queensland registration, paperwork and vehicle removal.",
  path: "/blog",
});

const formatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  timeZone: "Australia/Brisbane",
  year: "numeric",
});

const startHere = [
  {
    label: "Selling paperwork",
    title: "Do I need a roadworthy?",
    href: "/sell-car-without-roadworthy-qld",
  },
  {
    label: "Vehicle value",
    title: "What is my scrap car worth?",
    href: "/how-much-is-my-scrap-car-worth-gold-coast",
  },
  {
    label: "Damaged vehicles",
    title: "Repair, claim or sell?",
    href: "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide",
  },
] as const;

function formatDate(date: string) {
  return formatter.format(new Date(`${date}T00:00:00+10:00`));
}

function GuideMeta({ post }: { post: Post }) {
  const displayDate = post.updated ?? post.date;

  return (
    <p className="text-sm text-ink-muted">
      <span>{post.updated ? "Updated" : "Published"} </span>
      <time dateTime={displayDate}>{formatDate(displayDate)}</time>
      <span aria-hidden="true"> · </span>
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}

export default function BlogIndex() {
  const activePosts = posts.filter((post) => !post.archived);
  const [featuredPost, ...otherPosts] = activePosts;

  if (!featuredPost) {
    throw new Error("The guide hub needs at least one active post.");
  }

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          blogSchema(activePosts),
        )}
      />

      <section className="relative isolate overflow-hidden border-t-4 border-brand bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-1/2 -z-10 -translate-y-1/2 text-[clamp(8rem,23vw,19rem)] font-extrabold leading-none tracking-[-0.09em] text-white/5"
        >
          GUIDE
        </div>

        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/75">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Guides
              </li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white/80">
                Gold Coast car owner&apos;s guide
              </p>
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Clear answers before you sell or remove a car
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
                Practical Queensland guidance on vehicle value, roadworthy rules,
                registration, finance and damaged cars — written to help you choose
                the right next step.
              </p>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                {activePosts.length} current guides · Written for Queensland readers
              </p>
            </div>

            <aside className="border-t border-white/25 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
              <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-white/70">
                Start with your situation
              </p>
              <ul className="divide-y divide-white/20">
                {startHere.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-20 items-center justify-between gap-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-[0.13em] text-white/60">
                          {item.label}
                        </span>
                        <span className="mt-1 block font-bold text-white group-hover:underline group-hover:underline-offset-4">
                          {item.title}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-2xl text-white/70 transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </section>

      <Section tone="alt">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-brand">
                Latest guide
              </p>
              <h2 className="heading-lg">New and newly reviewed</h2>
            </div>
            <Link
              href="#all-guides"
              className="hidden font-bold text-brand underline-offset-4 hover:underline sm:block"
            >
              Browse all guides
            </Link>
          </div>

          <article>
            <Link
              href={`/${featuredPost.slug}`}
              className="group grid overflow-hidden rounded border border-hairline bg-surface shadow-[0_8px_30px_rgba(51,72,98,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand lg:grid-cols-[1.12fr_0.88fr]"
            >
              <div className="relative min-h-64 overflow-hidden bg-surface-alt sm:min-h-80 lg:min-h-[25rem]">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />
                <span className="absolute left-5 top-5 bg-brand px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
                  Latest
                </span>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-11">
                <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-brand">
                  {featuredPost.category}
                </p>
                <h3 className="heading-lg mb-4 transition-colors group-hover:text-brand">
                  {featuredPost.title}
                </h3>
                <p className="mb-6 text-lg">{featuredPost.description}</p>
                <GuideMeta post={featuredPost} />
                <span className="mt-7 inline-flex items-center gap-2 font-extrabold text-brand">
                  Read the guide
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          </article>
        </div>
      </Section>

      <Section id="all-guides">
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 max-w-3xl">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-brand">
              Guide library
            </p>
            <h2 className="heading-lg mb-3">More practical car selling guides</h2>
            <p className="text-lg">
              Use these guides to understand your paperwork, compare your options and
              avoid surprises before a vehicle changes hands.
            </p>
          </div>

          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <li key={post.slug}>
                <article className="h-full">
                  <Link
                    href={`/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded border border-hairline bg-surface shadow-[0_2px_12px_rgba(51,72,98,0.06)] transition-[border-color,box-shadow] hover:border-brand hover:shadow-[0_8px_24px_rgba(51,72,98,0.10)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
                      <Image
                        src={post.image}
                        alt={post.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-brand">
                        {post.category}
                      </p>
                      <h3 className="heading-md mb-3 transition-colors group-hover:text-brand">
                        {post.title}
                      </h3>
                      <p className="mb-6">{post.description}</p>
                      <div className="mt-auto border-t border-hairline pt-4">
                        <GuideMeta post={post} />
                      </div>
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <PrimaryServiceLinks />
    </>
  );
}
