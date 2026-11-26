"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import type { PropertyFormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  checkbox,
  fieldErrors,
  formDataToObject,
  propertyImageSchema,
  propertySchema,
  uuidSchema,
} from "@/lib/validation/schemas";
import type { ListingStatus, PropertyImage } from "@/types/database";

/** Every path whose content depends on the property catalogue. */
function revalidateCatalogue(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/neighborhoods");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/properties/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
}

/** Finds a slug that is not yet taken, e.g. "villa-noir", "villa-noir-2". */
async function ensureUniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const supabase = await createClient();
  const root = slugify(base) || "property";

  let query = supabase.from("properties").select("slug").ilike("slug", `${root}%`);
  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.limit(200);
  const taken = new Set((data ?? []).map((row) => String(row.slug)));

  if (!taken.has(root)) return root;
  let suffix = 2;
  while (taken.has(`${root}-${suffix}`)) suffix += 1;
  return `${root}-${suffix}`;
}

function parseAmenities(raw: unknown): string[] {
  const source = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join(",") : "";
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of source.split(",")) {
    const value = part.trim().replace(/\s+/g, " ");
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value.slice(0, 80));
  }
  return result.slice(0, 60);
}

/** Validates the JSON payload produced by the image manager in the browser. */
function parseImages(raw: unknown): Array<Omit<PropertyImage, "id" | "property_id" | "created_at">> {
  if (typeof raw !== "string" || raw.trim() === "") return [];

  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(decoded)) return [];

  const images: Array<Omit<PropertyImage, "id" | "property_id" | "created_at">> = [];
  decoded.forEach((entry, index) => {
    const parsed = propertyImageSchema.safeParse({
      url: (entry as Record<string, unknown>)?.url,
      storage_path: (entry as Record<string, unknown>)?.storage_path,
      alt_text: (entry as Record<string, unknown>)?.alt_text,
      sort_order: (entry as Record<string, unknown>)?.sort_order ?? index,
      is_cover: Boolean((entry as Record<string, unknown>)?.is_cover),
    });
    if (parsed.success) images.push(parsed.data);
  });

  // Guarantee exactly one cover image.
  if (images.length > 0 && !images.some((image) => image.is_cover)) {
    images[0]!.is_cover = true;
  }
  let sawCover = false;
  for (const image of images) {
    if (image.is_cover && sawCover) image.is_cover = false;
    if (image.is_cover) sawCover = true;
  }

  return images;
}

function buildRow(input: ReturnType<typeof propertySchema.parse>, slug: string) {
  return {
    slug,
    title: input.title,
    description: input.description,
    price: input.price,
    price_period: input.price_period,
    street_address: input.street_address,
    city: input.city,
    state: input.state,
    zip_code: input.zip_code,
    neighborhood: input.neighborhood,
    property_type: input.property_type,
    listing_status: input.listing_status,
    bedrooms: Math.round(input.bedrooms),
    bathrooms: input.bathrooms,
    square_feet: input.square_feet === null ? null : Math.round(input.square_feet),
    lot_size: input.lot_size,
    lot_size_unit: input.lot_size_unit,
    year_built: input.year_built === null ? null : Math.round(input.year_built),
    latitude: input.latitude,
    longitude: input.longitude,
    amenities: input.amenities,
    is_featured: input.is_featured,
    is_published: input.is_published,
    // Only ever an explicit fallback typed by the admin. The gallery cover is
    // what drives cards and the hero, so this is no longer auto-filled from it.
    hero_image_url: input.hero_image_url?.trim() || null,
  };
}

export async function createProperty(
  _previous: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const session = await requireAdmin();

  const parsed = propertySchema.safeParse({
    ...formDataToObject(formData),
    amenities: parseAmenities(formData.get("amenities")),
    is_featured: checkbox(formData.get("is_featured")),
    is_published: checkbox(formData.get("is_published")),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const images = parseImages(formData.get("images_json"));
  const slug = await ensureUniqueSlug(parsed.data.slug || slugify(parsed.data.title));
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("properties")
    .insert({ ...buildRow(parsed.data, slug), created_by: session.admin.id })
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (error || !created) {
    if (error?.code === "23505") {
      return { status: "error", message: "That URL slug is already in use. Choose another." };
    }
    return { status: "error", message: error?.message ?? "Could not save the listing." };
  }

  if (images.length > 0) {
    const { error: imageError } = await supabase.from("property_images").insert(
      images.map((image, index) => ({
        property_id: created.id,
        url: image.url,
        storage_path: image.storage_path,
        alt_text: image.alt_text ?? parsed.data.title,
        sort_order: image.sort_order ?? index,
        is_cover: image.is_cover,
      })),
    );
    if (imageError) {
      console.error("[properties] gallery insert failed", imageError.message);
    }
  }

  revalidateCatalogue(created.slug);
  redirect(`/admin/properties/${created.id}/edit?saved=1`);
}

export async function updateProperty(
  _previous: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  await requireAdmin();

  const idCheck = uuidSchema.safeParse(formData.get("id"));
  if (!idCheck.success) {
    return { status: "error", message: "That listing could not be identified." };
  }
  const id = idCheck.data;

  const parsed = propertySchema.safeParse({
    ...formDataToObject(formData),
    amenities: parseAmenities(formData.get("amenities")),
    is_featured: checkbox(formData.get("is_featured")),
    is_published: checkbox(formData.get("is_published")),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const images = parseImages(formData.get("images_json"));
  const slug = parsed.data.slug ?? (await ensureUniqueSlug(slugify(parsed.data.title), id));

  const { error } = await supabase
    .from("properties")
    .update(buildRow(parsed.data, slug))
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "That URL slug is already in use. Choose another." };
    }
    return { status: "error", message: error.message };
  }

  // Replace the gallery wholesale — the form always sends the complete set.
  await supabase.from("property_images").delete().eq("property_id", id);
  if (images.length > 0) {
    const { error: imageError } = await supabase.from("property_images").insert(
      images.map((image, index) => ({
        property_id: id,
        url: image.url,
        storage_path: image.storage_path,
        alt_text: image.alt_text ?? parsed.data.title,
        sort_order: image.sort_order ?? index,
        is_cover: image.is_cover,
      })),
    );
    if (imageError) {
      console.error("[properties] gallery replace failed", imageError.message);
    }
  }

  revalidateCatalogue(slug);
  redirect(`/admin/properties/${id}/edit?saved=1`);
}

export async function deleteProperty(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Invalid listing id." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("properties")
    .select("slug")
    .eq("id", parsedId.data)
    .maybeSingle<{ slug: string }>();

  const { error } = await supabase.from("properties").delete().eq("id", parsedId.data);
  if (error) return { ok: false, error: error.message };

  revalidateCatalogue(existing?.slug);
  return { ok: true };
}

export async function setPublishState(
  id: string,
  isPublished: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ is_published: isPublished })
    .eq("id", id)
    .select("slug")
    .maybeSingle<{ slug: string }>();

  if (error) return { ok: false, error: error.message };

  revalidateCatalogue(data?.slug);
  return { ok: true };
}

export async function setListingStatus(
  id: string,
  status: ListingStatus,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const allowed: ListingStatus[] = ["for_sale", "for_rent", "pending", "sold"];
  if (!allowed.includes(status)) return { ok: false, error: "Unknown status." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ listing_status: status })
    .eq("id", id)
    .select("slug")
    .maybeSingle<{ slug: string }>();

  if (error) return { ok: false, error: error.message };

  revalidateCatalogue(data?.slug);
  return { ok: true };
}

export async function setFeaturedState(
  id: string,
  isFeatured: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ is_featured: isFeatured })
    .eq("id", id)
    .select("slug")
    .maybeSingle<{ slug: string }>();

  if (error) return { ok: false, error: error.message };

  revalidateCatalogue(data?.slug);
  return { ok: true };
}
