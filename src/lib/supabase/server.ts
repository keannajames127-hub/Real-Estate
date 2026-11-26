import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
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
