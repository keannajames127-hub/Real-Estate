import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ResetPasswordForm } from "@/components/admin/AuthForms";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // Without credentials there is no recovery session to verify, so fall through
  // to the "link expired" guidance rather than failing the whole request.
  const supabase = isSupabaseConfigured() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <div>
        <p className="eyebrow text-gold">Link expired</p>
        <h1 className="mt-5 font-display text-[2.1rem] leading-tight text-ink">
          This reset link is no longer valid
        </h1>
        <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-stone">
          Recovery links expire quickly for security. Request a new one and it will arrive within a
          minute or two.
        </p>
        <Link
          href="/admin/forgot-password"
          className="mt-8 inline-flex items-center gap-2 bg-charcoal px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
        >
          Request a new link
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow text-gold">Account recovery</p>
      <h1 className="mt-5 font-display text-[2.1rem] leading-tight text-ink">Choose a new password</h1>
      <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-stone">
        Signed in as <span className="text-charcoal">{user.email}</span>. Pick something strong — it
        protects every listing and enquiry in the dashboard.
      </p>

      <div className="mt-9">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
