import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Global MDX component mapping. Blog posts are authored as .mdx files under
 * src/app/(posts)/<slug>/page.mdx so each keeps the root-level URL it had on
 * WordPress.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children, ...props }) =>
      href.startsWith("/") ? (
        <Link href={href} {...props}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {children}
        </a>
      ),
    ...components,
  };
}
