/**
 * Cookie written by the dashboard's fallback sign-in.
 *
 * It lives in its own module because both the middleware (Edge runtime) and the
 * server-side auth code need the name, while `src/lib/supabase/preview.ts` is
 * server-only and cannot be imported from the Edge runtime.
 */
export const PREVIEW_ADMIN_COOKIE = "dshp_demo_admin";
