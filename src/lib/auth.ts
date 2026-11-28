import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient, servesBundledContent } from "@/lib/supabase/server";
import { PREVIEW_ADMIN } from "@/lib/supabase/preview";
import { PREVIEW_ADMIN_COOKIE } from "@/lib/supabase/preview-cookie";
import type { AdminUser } from "@/types/database";

export interface AdminSession {
  user: {
    id: string;
    email: string;
  };
  admin: AdminUser;
}

/** The sample administrator the fallback sign-in signs in as. */
function previewSession(): AdminSession {
  return {
    user: { id: PREVIEW_ADMIN.id, email: PREVIEW_ADMIN.email },
    admin: PREVIEW_ADMIN,
  };
}

/**
 * Resolves the signed-in administrator, or null.
 *
 * Two independent conditions must hold:
 *   1. Supabase Auth recognises the session cookie (validated against the
 *      Auth server, not merely decoded locally).
 *   2. A matching row exists in `admin_users` and is flagged active.
 *
 * Cached per request so a page and its nested components only pay for it once.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  // Without credentials there cannot be a real session. Rather than lock the
  // dashboard away entirely, sign in as the sample administrator so the panel
  // can be reviewed — see src/lib/supabase/preview.ts.
  if (!isSupabaseConfigured()) return previewSession();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!userError && user) {
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<AdminUser>();

    // Deliberately no fallback here: a genuine signed-in account that is not an
    // active administrator is rejected outright.
    if (adminError || !admin || !admin.is_active) return null;

    return {
      user: { id: user.id, email: user.email ?? admin.email },
      admin,
    };
  }

  // A database that is connected but still empty has no administrators to
  // authenticate against. The fallback sign-in (see src/actions/auth.ts) leaves
  // a cookie behind; honour it while — and only while — the bundled content is
  // still what the site serves.
  if (await servesBundledContent()) {
    const cookieStore = await cookies();
    if (cookieStore.get(PREVIEW_ADMIN_COOKIE)?.value === "1") return previewSession();
  }

  return null;
});

/**
 * Use in every protected server component, server action and route handler.
 * Redirects to the sign-in page when the caller is not an administrator.
 */
export async function requireAdmin(currentPath?: string): Promise<AdminSession> {
  const session = await getAdminSession();
  if (session) return session;

  const target = currentPath
    ? `/admin/login?next=${encodeURIComponent(currentPath)}`
    : "/admin/login";
  redirect(target);
}

/** Use in server actions where an HTTP 404 is friendlier than a redirect. */
export async function requireAdminOrNotFound(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) notFound();
  return session;
}

/** True when the signed-in administrator may change other administrators. */
export function canManageTeam(session: AdminSession): boolean {
  return session.admin.role === "owner" || session.admin.role === "admin";
}
