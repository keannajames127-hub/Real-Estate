import "server-only";

import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { AdminUser, Agent, PublicSiteSettings, SiteSettings } from "@/types/database";

const DEFAULT_PUBLIC_SETTINGS: PublicSiteSettings = {
  id: 1,
  business_name: "Danish Home Properties",
  tagline: "Exceptional homes across California's most coveted addresses.",
  contact_email: "hello@danishhomeproperties.com",
  contact_phone: "+1 (581) 238-7344",
  office_address: "1234 Maple Street, Garden Grove, CA 92840, United States",
  about_text: null,
  social_links: {},
  hero_headline: "Discover Exceptional Properties",
  hero_subheadline:
    "A curated collection of California's finest homes, presented with discretion and care.",
  hero_image_url: null,
  footer_note: null,
};

/**
 * Public site settings — read through the `public_site_settings` view, which
 * deliberately omits `notification_email` and any other internal field.
 *
 * Falls back to sensible defaults so the site still renders before the database
 * has been seeded.
 */
export async function getPublicSettings(): Promise<PublicSiteSettings> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("public_site_settings")
      .select("*")
      .maybeSingle<PublicSiteSettings>();

    if (error || !data) return DEFAULT_PUBLIC_SETTINGS;
    return { ...DEFAULT_PUBLIC_SETTINGS, ...data };
  } catch {
    // The site must still render (and the sign-in page must still work) before
    // the environment variables have been filled in.
    return DEFAULT_PUBLIC_SETTINGS;
  }
}

/** Full settings row, including the notification address. Admins only (RLS). */
export async function getAdminSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle<SiteSettings>();

  if (error) throw new Error(`Could not load settings: ${error.message}`);
  return data;
}

export async function getActiveAgents(): Promise<Agent[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load the team: ${error.message}`);
  return (data ?? []) as Agent[];
}

export async function getAllAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load the team: ${error.message}`);
  return (data ?? []) as Agent[];
}

/** Every administrator, newest first. RLS restricts this to signed-in admins. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Could not load administrators: ${error.message}`);
  return (data ?? []) as AdminUser[];
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle<Agent>();

  if (error) throw new Error(`Could not load that advisor: ${error.message}`);
  return data;
}
