import "server-only";

import { createDashboardClient } from "@/lib/supabase/server";
import { asArray } from "@/lib/utils";
import type {
  ListingStatus,
  PropertyImage,
  PropertyType,
  PropertyWithImages,
} from "@/types/database";

/**
 * Administrator-facing property reads. Unlike src/lib/queries/properties.ts
 * these include unpublished drafts — RLS allows that because the caller holds
 * an active administrator session.
 */

const FULL_COLUMNS = [
  "id",
  "slug",
  "title",
  "description",
  "price",
  "currency",
  "price_period",
  "street_address",
  "city",
  "state",
  "zip_code",
  "neighborhood",
  "country",
  "latitude",
  "longitude",
  "property_type",
  "listing_status",
  "bedrooms",
  "bathrooms",
  "square_feet",
  "lot_size",
  "lot_size_unit",
  "year_built",
  "amenities",
  "hero_image_url",
  "is_featured",
  "is_published",
  "published_at",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

const IMAGE_COLUMNS =
  "id, property_id, url, storage_path, alt_text, sort_order, is_cover, created_at";

export interface AdminPropertyFilters {
  q?: string;
  status?: ListingStatus | "";
  type?: PropertyType | "";
  published?: "all" | "published" | "draft";
  page?: number;
  pageSize?: number;
}

export interface AdminPropertyListResult {
  properties: PropertyWithImages[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

/**
 * Narrows an untyped PostgREST result. The select string is assembled at
 * runtime, which postgrest-js cannot resolve statically, so it types the
 * payload as a parser error instead of the rows it actually returns.
 */
function rowList(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

function hydrate(row: Record<string, unknown>): PropertyWithImages {
  const images = [...asArray(row.property_images as PropertyImage[] | null)].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  return { ...(row as unknown as PropertyWithImages), property_images: images };
}

export async function listAdminProperties(
  filters: AdminPropertyFilters = {},
): Promise<AdminPropertyListResult> {
  const supabase = await createDashboardClient();

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(filters.pageSize ?? 12)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select(`${FULL_COLUMNS}, property_images(${IMAGE_COLUMNS})`, { count: "exact" });

  const term = filters.q
    ? filters.q.replace(/[,()%\\*:"'`]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60)
    : "";
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      [
        `title.ilike.${like}`,
        `city.ilike.${like}`,
        `state.ilike.${like}`,
        `street_address.ilike.${like}`,
        `zip_code.ilike.${like}`,
      ].join(","),
    );
  }

  if (filters.status) query = query.eq("listing_status", filters.status);
  if (filters.type) query = query.eq("property_type", filters.type);
  if (filters.published === "published") query = query.eq("is_published", true);
  if (filters.published === "draft") query = query.eq("is_published", false);

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Could not load listings: ${error.message}`);

  const total = count ?? 0;
  return {
    properties: rowList(data).map(hydrate),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminProperty(id: string): Promise<PropertyWithImages | null> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`${FULL_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load that listing: ${error.message}`);
  return data ? hydrate(data as unknown as Record<string, unknown>) : null;
}

/** Recent listings for the dashboard, drafts included. */
export async function getRecentlyUpdatedProperties(
  limit = 5,
): Promise<PropertyWithImages[]> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`${FULL_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load recent listings: ${error.message}`);
  return rowList(data).map(hydrate);
}

/** Lightweight id/title pairs, used by the enquiry detail page. */
export async function getPropertyOptions(): Promise<
  Array<{ id: string; title: string; city: string; state: string }>
> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, city, state")
    .order("title", { ascending: true });

  if (error) return [];
  return (data ?? []) as Array<{ id: string; title: string; city: string; state: string }>;
}
