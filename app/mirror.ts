import pages from "./mirror-pages.json";

const mirroredPages = pages as Record<string, string>;

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function rewriteRequestOrigin(html: string, origin: string) {
  return html
    .replaceAll("https://uniquecashforcars.com.au", origin)
    .replaceAll("https://www.uniquecashforcars.com.au", origin)
    .replaceAll("http://uniquecashforcars.com.au", origin)
    .replaceAll("http://www.uniquecashforcars.com.au", origin)
    .replaceAll("//uniquecashforcars.com.au", origin)
    .replaceAll("//www.uniquecashforcars.com.au", origin);
}

export function serveMirroredPage(pathname: string, origin: string) {
  const normalized = normalizePath(pathname);
  const storedHtml = mirroredPages[normalized];

  if (!storedHtml) {
    const fallback = mirroredPages["/"];
    const notFound = rewriteRequestOrigin(fallback, origin)
      .replace(
        /<title>.*?<\/title>/is,
        "<title>Page not found - Unique Cash for Cars</title>",
      )
      .replace(
        /<main id="main"[\s\S]*?<\/main>/i,
        '<main id="main" class=""><div class="container" style="padding:80px 15px"><h1>Page not found</h1><p>The page you requested is not available.</p><p><a class="button primary" href="/">Return home</a></p></div></main>',
      );

    return new Response(notFound, {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60",
      },
    });
  }

  return new Response(rewriteRequestOrigin(storedHtml, origin), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
