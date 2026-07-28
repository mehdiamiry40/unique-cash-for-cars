import type { NextRequest } from "next/server";
import { serveMirroredPage } from "./mirror";

export function GET(request: NextRequest) {
  return serveMirroredPage("/", request.nextUrl.origin);
}
