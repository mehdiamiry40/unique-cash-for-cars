import type { NextRequest } from "next/server";
import { serveMirroredPage } from "../mirror";
import { normalizedHostname, requestOrigin } from "../site-config";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const hostname = normalizedHostname(
    request.headers.get("x-forwarded-host"),
    request.nextUrl.hostname,
  );

  if (hostname === "www.uniquecashforcars.com.au") {
    const destination = request.nextUrl.clone();
    destination.hostname = "uniquecashforcars.com.au";
    destination.port = "";
    return Response.redirect(destination, 301);
  }

  return serveMirroredPage(
    request.nextUrl.pathname,
    requestOrigin(request),
    hostname,
  );
}
