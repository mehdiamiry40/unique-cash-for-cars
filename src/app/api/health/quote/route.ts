import { getQuoteHealth } from "@/lib/quote-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 5;

export async function GET() {
  const monitoringEnabled = process.env.VERCEL_ENV === "production"
    && process.env.NODE_ENV !== "development";
  const healthy = monitoringEnabled ? await getQuoteHealth() : false;
  return Response.json({ healthy }, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
