import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { FormBanner } from "@/components/ui/Form";
import { requireAdmin } from "@/lib/auth";
import { getAdminProperty } from "@/lib/queries/admin-properties";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getAdminProperty(id).catch(() => null);
  return { title: property ? `Edit · ${property.title}` : "Edit property" };
}

function toValues(property: Awaited<ReturnType<typeof getAdminProperty>>): PropertyFormValues {
  if (!property) return {};
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description ?? "",
    price: String(property.price ?? ""),
    price_period: property.price_period,
    street_address: property.street_address,
    city: property.city,
    state: property.state,
    zip_code: property.zip_code,
    neighborhood: property.neighborhood ?? "",
    property_type: property.property_type,
    listing_status: property.listing_status,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    square_feet: property.square_feet === null ? "" : String(property.square_feet),
    lot_size: property.lot_size === null ? "" : String(property.lot_size),
    lot_size_unit: property.lot_size_unit,
    year_built: property.year_built === null ? "" : String(property.year_built),
    latitude: property.latitude === null ? "" : String(property.latitude),
    longitude: property.longitude === null ? "" : String(property.longitude),
    amenities: property.amenities ?? [],
    is_featured: property.is_featured,
    is_published: property.is_published,
    hero_image_url: property.hero_image_url ?? "",
    images: (property.property_images ?? []).map((image) => ({
      url: image.url,
      storage_path: image.storage_path,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
      is_cover: image.is_cover,
    })),
  };
}

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("/admin/properties");
  const { id } = await params;
  const query = await searchParams;

  const property = await getAdminProperty(id);
  if (!property) notFound();

  const justSaved = query.saved === "1";

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
        <p className="eyebrow mt-6 text-gold">
          {property.is_published ? "Published listing" : "Draft listing"}
        </p>
        <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
          {property.title}
        </h1>
        <p className="mt-3 font-sans text-[0.86rem] text-stone">
          Last updated {formatDateTime(property.updated_at)}
        </p>
      </header>

      {justSaved ? (
        <FormBanner tone="success" title="Listing saved">
          Your changes are live. Anything you edited here is already reflected on the public site.
        </FormBanner>
      ) : null}

      <PropertyForm mode="edit" values={toValues(property)} />
    </div>
  );
}
