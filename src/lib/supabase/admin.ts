import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, getServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { createPreviewClient } from "@/lib/supabase/preview";

/**
 * Privileged Supabase client.
 *
 * The service-role key bypasses Row Level Security, so this client is used ONLY
 * for operations that must happen outside a visitor's session:
 *
 *   - inserting a public enquiry after the server has validated it
 *   - provisioning administrator accounts
 *   - server-side maintenance jobs
 *
 * It must never be handed to the browser and never used to satisfy a request
 * without an explicit, server-side authorization check first.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) return createPreviewClient();

  return createSupabaseClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
