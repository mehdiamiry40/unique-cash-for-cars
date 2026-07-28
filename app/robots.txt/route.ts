import type { NextRequest } from "next/server";
import {
  isPreviewHostname,
  normalizedHostname,
  requestOrigin,
} from "../site-config";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const hostname = normalizedHostname(
    request.headers.get("x-forwarded-host"),
    request.nextUrl.hostname,
  );
  const preview = isPreviewHostname(hostname);
  const body = preview
    ? "User-agent: *\nDisallow: /\n"
    : [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${requestOrigin(request)}/sitemap_index.xml`,
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "x-content-type-options": "nosniff",
    },
  });
}
