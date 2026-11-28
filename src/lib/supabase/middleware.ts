import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { PREVIEW_ADMIN_COOKIE } from "@/lib/supabase/preview-cookie";

/** Routes that must stay reachable without a session. */
const PUBLIC_ADMIN_ROUTES = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

function isPublicAdminRoute(pathname: string): boolean {
  return PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Refreshes the Supabase auth session on every request and gates the /admin
 * area.
 *
 * This is the first of two layers of protection: it gives a fast redirect and
 * keeps access tokens fresh. The authoritative check lives on the server in
 * `requireAdmin()` (see src/lib/auth.ts), which re-verifies the session and the
 * administrator record for every protected page and every mutation. Never rely
 * on middleware alone.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Read the public variables directly: the Edge runtime only inlines literal
  // `process.env.NEXT_PUBLIC_*` lookups, and a missing configuration must not
  // take the whole site down — only the dashboard needs a session.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: getUser() (not getSession()) — it validates the JWT with Supabase
  // Auth instead of trusting whatever is stored in the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminArea) {
    return response;
  }

  const isAuthCallback = pathname.startsWith("/auth");

  // The dashboard's fallback sign-in (used while the attached database is empty)
  // does not create a Supabase session, so its cookie is accepted as one here.
  // The authoritative check in `requireAdmin()` still decides what is rendered.
  const hasPreviewSession = request.cookies.get(PREVIEW_ADMIN_COOKIE)?.value === "1";

  if (!user && !hasPreviewSession && !isPublicAdminRoute(pathname) && !isAuthCallback) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return withCookies(NextResponse.redirect(redirectUrl), response);
  }

  if (user && isPublicAdminRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.search = "";
    return withCookies(NextResponse.redirect(redirectUrl), response);
  }

  return response;
}

/** Carries the refreshed auth cookies over to a redirect response. */
function withCookies(redirect: NextResponse, source: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
