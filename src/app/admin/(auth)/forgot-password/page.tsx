import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="eyebrow text-gold">Account recovery</p>
      <h1 className="mt-5 font-display text-[2.1rem] leading-tight text-ink">Reset your password</h1>
      <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-stone">
        Enter the email address on your administrator account and we will send a secure link to
        choose a new password.
      </p>

      <div className="mt-9">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
