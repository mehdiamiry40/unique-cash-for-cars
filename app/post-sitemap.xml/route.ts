import type { NextRequest } from "next/server";
import { escapeXml, postRoutes, requestOrigin } from "../site-config";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const urls = postRoutes
    .map(
      (route) =>
        `  <url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "x-content-type-options": "nosniff",
    },
  });
}
