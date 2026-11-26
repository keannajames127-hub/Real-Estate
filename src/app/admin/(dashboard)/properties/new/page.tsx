import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "New property" };

export default async function NewPropertyPage() {
  await requireAdmin("/admin/properties/new");

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          All properties
        </Link>
        <p className="eyebrow mt-6 text-gold">New listing</p>
        <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
          Add a property
        </h1>
        <p className="mt-3 max-w-2xl font-sans text-[0.9rem] text-stone">
          Fill in the details below and save. The listing appears on the public site as soon as it is
          published.
        </p>
      </header>

      <PropertyForm mode="create" />
    </div>
  );
}
