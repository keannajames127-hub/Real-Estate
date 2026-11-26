import { ShieldCheck } from "lucide-react";

import { AgentManager } from "@/components/admin/AgentManager";
import {
  AdminUsersPanel,
  BusinessSettingsForm,
  EmailForm,
  PasswordForm,
  ProfileForm,
} from "@/components/admin/SettingsForms";
import { FormBanner } from "@/components/ui/Form";
import { canManageTeam, requireAdmin } from "@/lib/auth";
import {
  getAdminSettings,
  getPublicSettings,
  listAdminUsers,
  getAllAgents,
} from "@/lib/queries/settings";
import type { AdminUser, Agent, PublicSiteSettings, SiteSettings } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function asSettings(base: PublicSiteSettings): SiteSettings {
  return { ...base, notification_email: null, updated_at: new Date().toISOString() };
}

const SECTIONS = [
  { href: "#profile", label: "Profile" },
  { href: "#business", label: "Business information" },
  { href: "#team", label: "Advisors" },
  { href: "#administrators", label: "Administrators" },
  { href: "#password", label: "Password" },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdmin("/admin/settings");
  const params = await searchParams;
  const justSaved = first(params.saved) === "1";

  const settings =
    (await getAdminSettings().catch(() => null)) ?? asSettings(await getPublicSettings());

  const agents: Agent[] = await getAllAgents().catch(() => []);
  const isTeamManager = canManageTeam(session);
  const admins: AdminUser[] = isTeamManager ? await listAdminUsers().catch(() => []) : [];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow text-gold">Administration</p>
        <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[0.9rem] text-stone">
          Your account, the details shown across the public site, and the advisors who appear on
          the team page. Changes are live the moment you save them.
        </p>
      </header>

      {justSaved ? (
        <FormBanner tone="success" title="Saved">
          Your changes are live on the public website.
        </FormBanner>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[210px_1fr] lg:items-start">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-8">
          <ul className="hidden border-l border-hairline lg:block">
            {SECTIONS.filter(
              (section) => section.href !== "#administrators" || isTeamManager,
            ).map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="block border-l-2 border-transparent py-2.5 pl-5 font-sans text-[0.78rem] text-stone transition-colors hover:border-gold hover:text-charcoal"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          <ProfileForm
            defaultUsername={session.admin.username}
            defaultFullName={session.admin.full_name ?? ""}
            email={session.admin.email}
          />

          <EmailForm defaultEmail={session.admin.email} />

          <BusinessSettingsForm settings={settings} />

          <section id="team" className="border border-hairline bg-paper scroll-mt-28">
            <div className="border-b border-hairline px-6 py-5">
              <h2 className="font-display text-[1.2rem] text-charcoal">Advisors</h2>
              <p className="mt-1.5 font-sans text-[0.82rem] text-stone">
                The people shown on the public team page — your founder, co-founder and advisors.
                Open an entry and upload a portrait in the <strong className="font-medium text-charcoal">Portrait</strong> field;
                lower display numbers appear first.
              </p>
            </div>
            <div className="px-6 py-6">
              <AgentManager agents={agents} />
            </div>
          </section>

          {isTeamManager ? <AdminUsersPanel admins={admins} /> : null}

          <PasswordForm />

          <p className="flex items-start gap-3 border border-hairline bg-bone px-5 py-4 font-sans text-[0.8rem] leading-relaxed text-stone">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.6} />
            Signed in as {session.admin.email} ({session.admin.role}). Every dashboard action is
            authorised on the server against your administrator record — signing out ends this
            session everywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
