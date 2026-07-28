import type { NextRequest } from "next/server";
import { serveMirroredPage } from "../mirror";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return serveMirroredPage(request.nextUrl.pathname, request.nextUrl.origin);
}
