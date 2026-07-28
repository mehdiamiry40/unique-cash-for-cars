import type { NextRequest } from "next/server";
import { escapeXml, requestOrigin } from "../site-config";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const origin = escapeXml(requestOrigin(request));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${origin}/page-sitemap.xml</loc></sitemap>
  <sitemap><loc>${origin}/post-sitemap.xml</loc></sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "x-content-type-options": "nosniff",
    },
  });
}
