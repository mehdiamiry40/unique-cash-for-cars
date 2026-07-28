export const postRoutes = [
  "/blog/",
  "/5-best-luxury-eco-friendly-cars-in-australia-2020/",
  "/what-to-do-with-a-damaged-car-on-the-gold-coast-a-complete-guide/",
  "/where-do-old-junk-cars-go-in-gold-coast-car-selling-options-in-gold-coast-qld/",
] as const;

export const retiredRouteRedirects = new Map<string, string>([
  ["/cash-for-cars/cash-for-cars-adelaide/", "/cash-for-cars/"],
  ["/cash-for-cars/ipswich/", "/cash-for-cars/"],
  ["/cash-for-cars/logan/", "/cash-for-cars/"],
  ["/cash-for-cars/toowoomba/", "/cash-for-cars/"],
  ["/top-5-reasons-to-sell-your-car-for-cash-in-brisbane/", "/blog/"],
]);

export const retiredRoutes = new Set(retiredRouteRedirects.keys());

export function isPreviewHostname(hostname: string) {
  return (
    hostname.endsWith(".vercel.app") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

export function normalizedHostname(hostHeader: string | null, fallback: string) {
  return (hostHeader ?? fallback)
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

export function requestOrigin(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  if (!forwardedHost) return request.nextUrl.origin;
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
    request.nextUrl.protocol.replace(":", "");
  return `${forwardedProto}://${forwardedHost}`;
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
import type { NextRequest } from "next/server";
