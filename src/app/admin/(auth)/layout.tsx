import Link from "next/link";
import type { ReactNode } from "react";

import { getPublicSettings } from "@/lib/queries/settings";

export const metadata = {
  title: "Administrator access",
  robots: { index: false, follow: false },
};

export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const settings = await getPublicSettings();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between bg-ink p-12 lg:flex xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, #faf3e3 0, transparent 45%), radial-gradient(circle at 80% 75%, #faf3e3 0, transparent 40%)",
          }}
        />
        <Link href="/" className="relative font-display text-[1.6rem] text-white">
          {settings.business_name}
        </Link>

        <div className="relative max-w-md">
          <p className="eyebrow text-gold-soft">Private area</p>
          <h1 className="mt-6 text-[2.4rem] leading-[1.1] tracking-[-0.02em] text-white xl:text-[3rem]">
            The brokerage, at your fingertips.
          </h1>
          <p className="mt-6 font-sans text-[0.95rem] leading-relaxed text-white/60">
            Manage listings, photographs and every prospect enquiry from a single private dashboard.
            Changes publish to the public site immediately.
          </p>
        </div>

        <p className="relative font-sans text-[0.75rem] text-white/35">
          Authorised administrators only. All access is logged.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center bg-paper px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="font-display text-[1.5rem] text-ink lg:hidden">
            {settings.business_name}
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
