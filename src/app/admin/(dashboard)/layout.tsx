import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { canManageTeam, requireAdmin } from "@/lib/auth";
import { isLocalTestMode } from "@/lib/env";
import { getPublicSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode } from "@/lib/supabase/preview";

export const metadata = {
  title: { default: "Dashboard", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/**
 * Every page in this route group is protected three times over:
 *   1. `src/middleware.ts` refreshes the session and bounces anonymous visitors.
 *   2. `requireAdmin()` below performs the authoritative check server-side.
 *   3. Postgres RLS refuses any query from a non-administrator session.
 */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const settings = await getPublicSettings();

  const supabase = await createClient();
  const { count } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <AdminShell
      businessName={settings.business_name}
      adminName={session.admin.full_name ?? session.admin.username}
      adminRole={session.admin.role}
      newEnquiries={count ?? 0}
      canManageTeam={canManageTeam(session)}
    >
      {isPreviewMode() ? (
        <div className="mb-8 border border-gold/40 bg-gold-pale/40 px-5 py-4">
          <p className="font-sans text-[0.78rem] leading-relaxed text-ink">
            <span className="font-medium uppercase tracking-[0.16em] text-gold">
              {isLocalTestMode() ? "Local test mode" : "Preview mode"}
            </span>
            {" — "}
            {isLocalTestMode()
              ? "property, enquiry and settings changes are saved on this PC only, along with uploaded photos. They are not sent to a live website."
              : "showing sample data. Changes are read-only until a live database and storage provider are configured."}
          </p>
        </div>
      ) : null}
      {children}
    </AdminShell>
  );
}
