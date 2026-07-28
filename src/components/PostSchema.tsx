import { getPost } from "@/content/posts";
import { articleSchema, breadcrumbSchema, graph } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";

/**
 * Per-post structured data, dropped into each .mdx file.
 *
 * It lives in the post rather than in `(posts)/layout.tsx` because a server
 * layout is not told which child route rendered it, and the post is the only
 * place that knows its own slug.
 *
 * Emits two things the posts were missing: BlogPosting (the post layout has
 * always rendered a Home / Blog breadcrumb with no markup behind it) and
 * BreadcrumbList.
 */
export function PostSchema({ slug }: { slug: string }) {
  const post = getPost(slug);

  // A slug that isn't in posts.ts means the post is missing from the blog index
  // and the sitemap too. Emitting nothing is the honest response; the build
  // still succeeds, and the page renders.
  if (!post) return null;

  return (
    <JsonLd
      data={graph(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/${post.slug}` },
        ]),
        articleSchema({
          slug: post.slug,
          title: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated,
        }),
      )}
    />
  );
}
