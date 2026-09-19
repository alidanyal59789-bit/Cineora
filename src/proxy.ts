import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Proxy must never throw a 500 for the whole site - fall back to
  // a plain pass-through (guest mode) on any session-refresh failure.
  try {
    return await updateSession(request);
  } catch {
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata file)
     * - image assets (svg, png, jpg, jpeg, gif, webp)
     * Supabase session refresh only - no route protection yet (Phase 1).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
