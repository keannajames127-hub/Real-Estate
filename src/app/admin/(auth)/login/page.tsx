import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/AuthForms";
import { FormBanner } from "@/components/ui/Form";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextRaw = params.next;
  const next = Array.isArray(nextRaw) ? nextRaw[0] : nextRaw;
  const errorRaw = params.error;
  const error = Array.isArray(errorRaw) ? errorRaw[0] : errorRaw;

  const session = await getAdminSession();
  if (session) redirect(next && next.startsWith("/admin") ? next : "/admin");

  return (
    <div>
      <p className="eyebrow text-gold">Administrator access</p>
      <h1 className="mt-5 font-display text-[2.1rem] leading-tight text-ink">Sign in</h1>
      <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-stone">
        Enter your username or email address and password to reach the private dashboard.
      </p>

      <div className="mt-9 space-y-6">
        {!isSupabaseConfigured() ? (
          <FormBanner tone="info" title="Supabase is not configured yet">
            Add <code className="font-mono text-[0.8rem]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-[0.8rem]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="font-mono text-[0.8rem]">.env.local</code>, run the migrations in{" "}
            <code className="font-mono text-[0.8rem]">supabase/migrations</code>, then create your
            first administrator with{" "}
            <code className="font-mono text-[0.8rem]">npm run create-admin</code>.
          </FormBanner>
        ) : null}

        {error ? <FormBanner tone="error">{error}</FormBanner> : null}

        <LoginForm next={next} />
      </div>
    </div>
  );
}
