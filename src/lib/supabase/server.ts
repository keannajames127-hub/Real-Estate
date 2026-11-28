import "server-only";

import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/env";
import { createPreviewClient, isPreviewMode } from "@/lib/supabase/preview";

/**
 * Request-scoped Supabase client that reads and writes the auth cookies.
 *
 * It carries the visitor's identity, so RLS applies exactly as it should:
 *   - anonymous visitors can only read published listings
 *   - signed-in administrators can manage everything
 *
 * Always create one per request; never cache it in a module-scoped variable.
 *
 * Before credentials exist the local development store is returned instead —
 * see src/lib/supabase/preview.ts.
 */
export async function createClient() {
  if (isPreviewMode()) return createPreviewClient();

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `cookies().set` throws inside Server Components, where the response
          // headers are already committed. The middleware refreshes the session
          // for those requests, so ignoring this is safe and expected.
        }
      },
    },
  });
}

/**
 * Client for the public storefront.
 *
 * A deployment can end up with a database connected but empty — for example
 * when credentials are provided before the migrations and seed have been run.
 * Rather than showing an empty catalogue, the storefront then serves the
 * content bundle compiled into the app. As soon as the database holds at least
 * one published listing, the database wins unconditionally.
 */
export const createPublicClient = cache(async () => {
  const supabase = await createClient();

  if (!isSupabaseConfigured()) return supabase;

  try {
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    if ((count ?? 0) > 0) return supabase;
  } catch {
    // Database unreachable — serve the bundled content instead of an error page.
  }

  return createPreviewClient();
});
