"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

/**
 * Browser-side Supabase client, used by the admin dashboard for interactive
 * work (sign-in, sign-out, password updates) and direct Storage uploads.
 *
 * Every table it can reach is protected by Row Level Security, so this client
 * is never able to read or mutate data the signed-in administrator is not
 * entitled to.
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
