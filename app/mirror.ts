import pages from "./mirror-pages.json";
import { renderLocalMain } from "./location-pages";
import { renderMarketingMain } from "./marketing-pages";
import { metadataFor, schemaFor } from "./seo";
import { isPreviewHostname, retiredRouteRedirects } from "./site-config";

const mirroredPages = pages as Record<string, string>;

const securityHeaders = {
  "content-security-policy":
    "default-src 'self'; base-uri 'self'; form-action 'self' https://mail.uniquecashforcars.com.au; frame-ancestors 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; frame-src https://www.youtube-nocookie.com; connect-src 'self' https://mail.uniquecashforcars.com.au https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "cross-origin-resource-policy": "same-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
};

const legacyBlogPaths = [
  "/author/",
  "/category/",
  "/tag/",
];

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function rewriteRequestOrigin(html: string, origin: string) {
  return html.replace(
    /(?:https?:)?\/\/(?:www\.)?uniquecashforcars\.com\.au/gi,
    origin,
  );
}

function removeLegacyScripts(html: string) {
  return html
    .replace(
      /<noscript>[\s\S]*?(?:googletagmanager|statcounter)[\s\S]*?<\/noscript>/gi,
      "",
    )
    .replace(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
      (script, attributes: string, body: string) => {
        const value = `${attributes} ${body}`.toLowerCase();
        const removable =
          value.includes("application/ld+json") ||
          value.includes("googletagmanager.com") ||
          value.includes("clarity.ms") ||
          value.includes("gtag(") ||
          value.includes("sc_project") ||
          value.includes("statcounter.com") ||
          value.includes("contact-form-7") ||
          value.includes("/swv/") ||
          value.includes("wp-hooks-js") ||
          value.includes("wp-i18n-js") ||
          value.includes("wp.i18n") ||
          value.includes("flatsome-instant-page") ||
          value.includes("flatsome-live-search") ||
          value.includes("jquery-ui-core") ||
          value.includes("pum-site-scripts") ||
          value.includes("pum_vars") ||
          value.includes("flatsome-lazy-load") ||
          value.includes("video_wrapper") ||
          value.includes("jquery-migrate");
        return removable ? "" : script;
      },
    );
}

function removeElementById(html: string, id: string) {
  const startMatch = html.match(
    new RegExp(`<div\\b[^>]*\\bid=(["'])${id}\\1[^>]*>`, "i"),
  );
  if (!startMatch?.index) return html;

  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = startMatch.index;
  let depth = 0;
  let tag: RegExpExecArray | null;
  while ((tag = tagPattern.exec(html))) {
    depth += tag[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      return html.slice(0, startMatch.index) + html.slice(tagPattern.lastIndex);
    }
  }
  return html;
}

function optimizeStaticMarkup(html: string) {
  let optimized = removeElementById(
    removeElementById(html, "pum-469"),
    "text-3",
  )
    .replace(
      /<style\b[^>]*\bid=(["'])kirki-inline-styles\1[^>]*>[\s\S]*?<\/style>/gi,
      "",
    )
    .replace(/<!--(?!\[if)[\s\S]*?-->/gi, "")
    .replaceAll(
      "/wp-content/uploads/2022/01/Best-Cash-for-Cars-Gold-Coast.png",
      "/assets/hero-cash-for-cars.webp",
    )
    .replaceAll(
      "/wp-content/uploads/2020/12/logo.jpg",
      "/assets/unique-cash-logo.webp",
    );

  optimized = optimized.replace(
    /<img\b([^>]*\bsrc=(["'])[^"']*\/assets\/hero-cash-for-cars\.webp\2[^>]*)>/gi,
    (image, attributes: string) => {
      if (/\bsrcset=/i.test(attributes)) return image;
      return `<img${attributes} srcset="/assets/hero-cash-for-cars-mobile.webp 800w, /assets/hero-cash-for-cars.webp 1920w" sizes="100vw">`;
    },
  );

  return optimized.replace(
    /<script\b((?=[^>]*\bsrc=(["'])(?!https?:\/\/(?!www\.uniquecashforcars\.com\.au|uniquecashforcars\.com\.au))[^"']+\2)[^>]*)>/gi,
    (script, attributes: string) => {
      if (/\b(?:async|defer)\b/i.test(attributes)) return script;
      return `<script${attributes} defer>`;
    },
  );
}

function removeLegacyDiscoveryLinks(html: string) {
  return html.replace(/<link\b[^>]*>/gi, (link) => {
    const value = link.toLowerCase();
    const removable =
      value.includes('rel="pingback"') ||
      value.includes("rel='pingback'") ||
      value.includes('rel="edituri"') ||
      value.includes("rel='edituri'") ||
      value.includes("xmlrpc.php") ||
      value.includes("/wp-json/") ||
      value.includes("/oembed/") ||
      value.includes("/feed/") ||
      value.includes('rel="profile"') ||
      value.includes("rel='profile'");
    return removable ? "" : link;
  });
}

function readableLabel(href: string) {
  try {
    const path = new URL(href, "https://example.com").pathname;
    const slug = path.split("/").filter(Boolean).at(-1) ?? "page";
    return `View ${slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")}`;
  } catch {
    return "View page";
  }
}

function repairLinksAndMarkup(html: string) {
  let repaired = html;

  for (const [retiredRoute, destination] of retiredRouteRedirects) {
    const escaped = retiredRoute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    repaired = repaired
      .replace(
        new RegExp(
          `<li\\b(?:(?!<li\\b)[\\s\\S])*?href=(["'])(?:https?:\\/\\/(?:www\\.)?uniquecashforcars\\.com\\.au)?${escaped}\\1(?:(?!<li\\b)[\\s\\S])*?<\\/li>`,
          "gi",
        ),
        "",
      )
      .replace(
        new RegExp(
          `<a\\b(?=[^>]*href=(["'])(?:https?:\\/\\/(?:www\\.)?uniquecashforcars\\.com\\.au)?${escaped}\\1)[^>]*>[\\s\\S]*?<\\/a>`,
          "gi",
        ),
        "",
      )
      .replace(
        new RegExp(
          `href=(["'])(?:https?:\\/\\/(?:www\\.)?uniquecashforcars\\.com\\.au)?${escaped}\\1`,
          "gi",
        ),
        `href="${destination}"`,
      );
  }

  return repaired
    .replace(
      /href=(["'])(https?:\/\/(?:www\.)?uniquecashforcars\.com\.au)?\/(?:author|category|tag)\/[^"']*\1/gi,
      'href="/blog/"',
    )
    .replace(
      /<a class="nav-top-link" aria-expanded="false" aria-haspopup="menu">Services/gi,
      '<a href="/cash-for-cars/" class="nav-top-link" aria-expanded="false" aria-haspopup="menu">Services',
    )
    .replace(/<a>Services<\/a>/gi, '<a href="/cash-for-cars/">Services</a>')
    .replace(/<a\b([^>]*\bclass=(["'])[^"']*\bfill\b[^"']*\2[^>]*)>/gi, (
      opening,
      attributes: string,
    ) => {
      if (/\baria-label=/i.test(attributes)) return opening;
      const href =
        attributes.match(/\bhref=(["'])(.*?)\1/i)?.[2] ?? "/cash-for-cars/";
      return `<a${attributes} aria-label="${readableLabel(href)}">`;
    })
    .replace(
      /<img\b(?![^>]*\bwidth=)([^>]*\bsrc=(["'])[^"']*\/call-button\.jpg[^"']*\2[^>]*)>/gi,
      '<img width="100" height="101"$1>',
    )
    .replace(/<h4\b/gi, "<h3")
    .replace(/<\/h4>/gi, "</h3>")
    .replace(/<li>\s*(?:Ipswich|Toowoomba|Logan|Adelaide)\s*<\/li>/gi, "")
    .replace(
      /<p><strong>Address:<\/strong>[\s\S]*?Runcorn QLD 4113[\s\S]*?<\/p>/gi,
      "<p><strong>Service area:</strong> Gold Coast residents only</p>",
    )
    .replace(
      /Gold Coast\s*\|\s*Brisbane\s*\|\s*Ipswich\s*\|\s*Logan\s*\|\s*Toowoomba\s*\|\s*Sunshine Coast/gi,
      "Gold Coast",
    );
}

function replaceYouTubeEmbeds(html: string) {
  return html.replace(
    /<iframe\b[^>]*\bsrc=(["'])https:\/\/www\.youtube\.com\/embed\/([A-Za-z0-9_-]+)[^"']*\1[^>]*>\s*<\/iframe>/gi,
    (_iframe, _quote, videoId: string) =>
      `<button class="video-lite" type="button" data-youtube-id="${videoId}" aria-label="Play our vehicle removal video"><img src="/assets/video-poster.webp" width="400" height="225" loading="lazy" alt=""><span class="video-lite__play" aria-hidden="true">▶</span><span class="video-lite__label">Play our vehicle removal video</span></button>`,
  );
}

function replaceMetaTag(
  html: string,
  matcher: RegExp,
  replacement: string,
) {
  return matcher.test(html)
    ? html.replace(matcher, replacement)
    : html.replace("</head>", `${replacement}\n</head>`);
}

function enhanceSeo(
  html: string,
  pathname: string,
  origin: string,
  noIndex: boolean,
) {
  const metadata = metadataFor(pathname);
  const canonical = `${origin}${pathname}`;
  let enhanced = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${metadata.title}</title>`,
  );
  enhanced = replaceMetaTag(
    enhanced,
    /<meta\b[^>]*\bname=(["'])description\1[^>]*>/i,
    `<meta name="description" content="${metadata.description}">`,
  );
  enhanced = replaceMetaTag(
    enhanced,
    /<meta\b[^>]*\bname=(["'])robots\1[^>]*>/i,
    `<meta name="robots" content="${
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    }">`,
  );
  enhanced = replaceMetaTag(
    enhanced,
    /<link\b[^>]*\brel=(["'])canonical\1[^>]*>/i,
    `<link rel="canonical" href="${canonical}">`,
  );
  enhanced = enhanced
    .replace(
      /<meta\b[^>]*\bproperty=(["'])og:title\1[^>]*>/i,
      `<meta property="og:title" content="${metadata.title}">`,
    )
    .replace(
      /<meta\b[^>]*\bproperty=(["'])og:description\1[^>]*>/i,
      `<meta property="og:description" content="${metadata.description}">`,
    )
    .replace(
      /<meta\b[^>]*\bproperty=(["'])og:url\1[^>]*>/i,
      `<meta property="og:url" content="${canonical}">`,
    );

  return enhanced.replace(
    "</head>",
    `<link rel="stylesheet" href="/site-enhancements.css">\n<script type="application/ld+json">${schemaFor(
      pathname,
      origin,
      metadata,
    )}</script>\n</head>`,
  );
}

function addBlogHeading(html: string, pathname: string) {
  if (pathname !== "/blog/" || /<h1\b/i.test(html)) return html;
  return html.replace(
    /(<main\b[^>]*>)/i,
    '$1<div class="blog-page-heading"><p class="local-eyebrow">Helpful vehicle advice</p><h1>Car Selling &amp; Removal Advice</h1></div>',
  );
}

function addPrivacyDetails(html: string, pathname: string) {
  if (pathname !== "/privacy-policy/" || html.includes("privacy-technology")) {
    return html;
  }
  return html.replace(
    "</main>",
    `<section class="privacy-technology" aria-labelledby="privacy-technology-title">
  <h2 id="privacy-technology-title">Website forms, analytics and consent</h2>
  <p>Vehicle quote forms send the details you choose to provide to our enquiry-processing service. This can include your name, phone number, email address, vehicle location, vehicle details, expected price and condition information. Please do not submit sensitive information that is not needed for the quote.</p>
  <p>Optional website analytics are disabled until you select “Accept analytics” in the privacy choices notice. If accepted, Google Tag Manager may load measurement tools configured by Unique Cash for Cars. You can decline analytics and continue using the website, including its quote forms and phone links.</p>
  <p>Your analytics choice is stored in your browser’s local storage. Clearing site data removes that saved choice, and the website will ask again on a later visit.</p>
  <p>Embedded video content is not loaded from YouTube until you choose to play it. Once played, YouTube’s privacy-enhanced service may receive technical information associated with the request.</p>
</section></main>`,
  );
}

function addConsentBanner(html: string) {
  if (html.includes('id="privacy-consent"')) return html;
  return html.replace(
    "</body>",
    `<aside id="privacy-consent" class="privacy-consent" hidden aria-labelledby="privacy-consent-title">
  <div><strong id="privacy-consent-title">Your privacy choices</strong><p>We use optional analytics to understand which pages help visitors. The site works without them.</p></div>
  <div class="privacy-consent__actions"><button type="button" data-consent="decline">Decline analytics</button><button class="button primary" type="button" data-consent="accept">Accept analytics</button></div>
</aside></body>`,
  );
}

function addBusinessDetails(html: string) {
  if (html.includes('class="business-details-band"')) return html;
  return html.replace(
    /<footer\b/i,
    `<section class="business-details-band" aria-label="Business details">
  <div><span>Service area</span><strong>Gold Coast residents only</strong></div>
  <div><span>Business hours</span><strong>Monday–Friday, 9:00 am–5:00 pm</strong></div>
  <div><span>Phone</span><a href="tel:0423476111">0423 476 111</a></div>
</section>
<footer`,
  );
}

function prepareHtml(
  originalHtml: string,
  pathname: string,
  origin: string,
  noIndex: boolean,
) {
  let html = removeLegacyScripts(originalHtml);
  html = optimizeStaticMarkup(html);
  html = removeLegacyDiscoveryLinks(html);
  html = repairLinksAndMarkup(html);
  html = replaceYouTubeEmbeds(html);
  const replacementMain =
    renderMarketingMain(pathname, html) ?? renderLocalMain(pathname, html);
  if (replacementMain) {
    html = html.replace(/<main\b[\s\S]*?<\/main>/i, replacementMain);
  }
  html = addBlogHeading(html, pathname);
  html = addPrivacyDetails(html, pathname);
  html = addBusinessDetails(html);
  html = enhanceSeo(html, pathname, origin, noIndex);
  html = addConsentBanner(html);
  return rewriteRequestOrigin(html, origin);
}

function responseHeaders(noIndex: boolean, cacheControl: string) {
  return {
    "content-type": "text/html; charset=utf-8",
    "cache-control": cacheControl,
    ...(noIndex ? { "x-robots-tag": "noindex, nofollow" } : {}),
    ...securityHeaders,
  };
}

export function serveMirroredPage(
  pathname: string,
  origin: string,
  hostname: string,
) {
  const normalized = normalizePath(pathname);
  if (legacyBlogPaths.some((prefix) => normalized.startsWith(prefix))) {
    return Response.redirect(`${origin}/blog/`, 301);
  }
  const retiredDestination = retiredRouteRedirects.get(normalized);
  if (retiredDestination) {
    return Response.redirect(`${origin}${retiredDestination}`, 301);
  }

  const storedHtml = mirroredPages[normalized];
  const noIndex = isPreviewHostname(hostname);

  if (!storedHtml) {
    const fallback = mirroredPages["/"];
    const notFound = prepareHtml(fallback, "/", origin, true)
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
      headers: responseHeaders(true, "public, max-age=60"),
    });
  }

  return new Response(
    prepareHtml(storedHtml, normalized, origin, noIndex),
    {
      headers: responseHeaders(
        noIndex,
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      ),
    },
  );
}

export function redirectLegacySearch(origin: string) {
  return Response.redirect(`${origin}/blog/`, 301);
}

export function htmlSecurityHeaders() {
  return securityHeaders;
}
