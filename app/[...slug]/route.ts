import type { NextRequest } from "next/server";
import { serveMirroredPage } from "../mirror";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const hostname = (
    request.headers.get("x-forwarded-host") ?? request.nextUrl.hostname
  )
    .split(",")[0]
    .trim()
    .split(":")[0];

  if (hostname === "www.uniquecashforcars.com.au") {
    const destination = request.nextUrl.clone();
    destination.hostname = "uniquecashforcars.com.au";
    destination.port = "";
    return Response.redirect(destination, 301);
  }

  return serveMirroredPage(request.nextUrl.pathname, request.nextUrl.origin);
}
