import Link from "next/link";

import { getPost } from "@/content/posts";

const formatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  timeZone: "Australia/Brisbane",
  year: "numeric",
});

/**
 * Visible authorship and freshness signals for a guide.
 *
 * BlogPosting already carries these values in JSON-LD. Showing the same facts
 * to readers keeps the page honest and lets someone judge whether regulatory
 * guidance has been reviewed recently enough for their situation.
 */
export function PostDetails({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) return null;

  return (
    <p className="post-details">
      By{" "}
      <Link href="/about" rel="author">
        Unique Cash For Cars
      </Link>
      {" · Published "}
      <time dateTime={post.date}>{formatter.format(new Date(`${post.date}T00:00:00+10:00`))}</time>
      {post.updated ? (
        <>
          {" · Updated "}
          <time dateTime={post.updated}>
            {formatter.format(new Date(`${post.updated}T00:00:00+10:00`))}
          </time>
        </>
      ) : null}
      {` · ${post.readingMinutes} min read`}
    </p>
  );
}
