import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  // Missing config must never 500 the whole site (e.g. homepage via
  // proxy). Degrade to guest mode - names only, no secret values.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if expired - do not use getSession() here.
  // Auth/network failures must not 500 the request - serve guest mode.
  try {
    await supabase.auth.getUser();
  } catch {
    // Fall through with the (possibly cookie-updated) response.
  }

  return supabaseResponse;
}
