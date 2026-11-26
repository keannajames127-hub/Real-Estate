import "server-only";

import { createClient } from "@/lib/supabase/server";
import { asArray, coverImage } from "@/lib/utils";
import type {
  ListingStatus,
  PropertyImage,
  PropertySort,
  PropertyType,
  PropertyWithImages,
} from "@/types/database";

/** A listing above this price is presented in the "Luxury Homes" rail. */
export const LUXURY_PRICE_THRESHOLD = 3_000_000;

const CARD_COLUMNS = [
  "id",
  "slug",
  "title",
  "price",
  "currency",
  "price_period",
  "street_address",
  "city",
  "state",
  "zip_code",
  "neighborhood",
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
  "created_at",
].join(", ");

const IMAGE_COLUMNS = "id, property_id, url, storage_path, alt_text, sort_order, is_cover, created_at";

export interface PropertyFilters {
  q?: string;
  city?: string;
  neighborhood?: string;
  zip?: string;
  propertyType?: PropertyType | "";
  listingStatus?: ListingStatus | "";
  minPrice?: number | null;
  maxPrice?: number | null;
  beds?: number | null;
  baths?: number | null;
  featuredOnly?: boolean;
  sort?: PropertySort;
  page?: number;
  pageSize?: number;
}

export interface PropertySearchResult {
  properties: PropertyWithImages[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * PostgREST treats commas, parentheses and wildcards as filter syntax, so any
 * user-supplied search term is stripped down to plain words before it reaches
 * the query builder. This is a correctness fix as much as a safety one: without
 * it, typing "Atlanta, GA" into the search box returns a 400.
 */
function sanitizeSearchTerm(input: string): string {
  return input
    .replace(/[,()%\\*:"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function sortToOrderBy(sort: PropertySort = "newest"): {
  column: string;
  ascending: boolean;
} {
  switch (sort) {
    case "oldest":
      return { column: "created_at", ascending: true };
    case "price_asc":
      return { column: "price", ascending: true };
    case "price_desc":
      return { column: "price", ascending: false };
    case "beds_desc":
      return { column: "bedrooms", ascending: false };
    case "sqft_desc":
      return { column: "square_feet", ascending: false };
    case "newest":
    default:
      return { column: "created_at", ascending: false };
  }
}

function normaliseImages(rows: PropertyImage[] | null | undefined): PropertyImage[] {
  return [...asArray(rows)].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

/**
 * Narrows an untyped PostgREST result.
 *
 * The select strings are assembled at runtime, which postgrest-js cannot resolve
 * statically, so it types the payload as a parser error rather than the rows it
 * actually returns. The shapes are guaranteed by `CARD_COLUMNS`/`IMAGE_COLUMNS`
 * below; this restores a usable type at the boundary.
 */
function rowList(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

function hydrate(row: Record<string, unknown>): PropertyWithImages {
  const images = normaliseImages(row.property_images as PropertyImage[] | null);
  return { ...(row as unknown as PropertyWithImages), property_images: images };
}

// ---------------------------------------------------------------------------
// Public reads — RLS restricts every one of these to published listings.
// ---------------------------------------------------------------------------

export async function searchProperties(
  filters: PropertyFilters = {},
): Promise<PropertySearchResult> {
  const supabase = await createClient();

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.max(1, Math.min(48, Math.floor(filters.pageSize ?? 9)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`, { count: "exact" })
    .eq("is_published", true);

  const term = filters.q ? sanitizeSearchTerm(filters.q) : "";
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      [
        `title.ilike.${like}`,
        `street_address.ilike.${like}`,
        `city.ilike.${like}`,
        `neighborhood.ilike.${like}`,
        `zip_code.ilike.${like}`,
        `description.ilike.${like}`,
      ].join(","),
    );
  }

  if (filters.city) query = query.ilike("city", `%${sanitizeSearchTerm(filters.city)}%`);
  if (filters.neighborhood)
    query = query.ilike("neighborhood", `%${sanitizeSearchTerm(filters.neighborhood)}%`);
  if (filters.zip) query = query.ilike("zip_code", `%${sanitizeSearchTerm(filters.zip)}%`);

  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.listingStatus) query = query.eq("listing_status", filters.listingStatus);
  if (filters.featuredOnly) query = query.eq("is_featured", true);

  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }
  if (typeof filters.beds === "number" && filters.beds > 0) {
    query = query.gte("bedrooms", filters.beds);
  }
  if (typeof filters.baths === "number" && filters.baths > 0) {
    query = query.gte("bathrooms", filters.baths);
  }

  const { column, ascending } = sortToOrderBy(filters.sort);
  query = query.order(column, { ascending, nullsFirst: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Could not load listings: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    properties: rowList(data).map(hydrate),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Featured listings for the homepage rail. */
export async function getFeaturedProperties(limit = 6): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load featured listings: ${error.message}`);
  return rowList(data).map(hydrate);
}

/** Newest published listings. */
export async function getRecentProperties(limit = 6): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load recent listings: ${error.message}`);
  return rowList(data).map(hydrate);
}

/** Highest-priced published listings. */
export async function getLuxuryProperties(limit = 6): Promise<PropertyWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .gte("price", LUXURY_PRICE_THRESHOLD)
    .order("price", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load luxury listings: ${error.message}`);
  const rows = rowList(data).map(hydrate);
  if (rows.length >= limit) return rows;

  // Smaller catalogues may not clear the threshold — top up with the priciest
  // listings so the rail is never emptier than it needs to be.
  const { data: fallback } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .order("price", { ascending: false })
    .limit(limit);

  const merged = [...rows];
  for (const row of rowList(fallback).map(hydrate)) {
    if (merged.length >= limit) break;
    if (!merged.some((item) => item.id === row.id)) merged.push(row);
  }
  return merged;
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`*, property_images(${IMAGE_COLUMNS})`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load that listing: ${error.message}`);
  return data ? hydrate(data) : null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPropertyByIdOrSlug(
  idOrSlug: string,
): Promise<PropertyWithImages | null> {
  const supabase = await createClient();
  const column = UUID_PATTERN.test(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("properties")
    .select(`*, property_images(${IMAGE_COLUMNS})`)
    .eq(column, idOrSlug)
    .maybeSingle();

  if (error) throw new Error(`Could not load that listing: ${error.message}`);
  return data ? hydrate(data) : null;
}

/**
 * "You may also like" — same city first, then same property type, then highest
 * price. Deliberately simple and index-friendly.
 */
export async function getSimilarProperties(
  property: Pick<PropertyWithImages, "id" | "city" | "property_type">,
  limit = 3,
): Promise<PropertyWithImages[]> {
  const supabase = await createClient();

  const { data: sameCity } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .neq("id", property.id)
    .ilike("city", property.city)
    .order("price", { ascending: false })
    .limit(limit);

  const results = rowList(sameCity).map(hydrate);
  if (results.length >= limit) return results.slice(0, limit);

  const { data: sameType } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .neq("id", property.id)
    .eq("property_type", property.property_type)
    .order("price", { ascending: false })
    .limit(limit * 2);

  for (const row of rowList(sameType).map(hydrate)) {
    if (results.length >= limit) break;
    if (!results.some((item) => item.id === row.id)) results.push(row);
  }

  if (results.length >= limit) return results;

  const { data: anyOther } = await supabase
    .from("properties")
    .select(`${CARD_COLUMNS}, property_images(${IMAGE_COLUMNS})`)
    .eq("is_published", true)
    .neq("id", property.id)
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  for (const row of rowList(anyOther).map(hydrate)) {
    if (results.length >= limit) break;
    if (!results.some((item) => item.id === row.id)) results.push(row);
  }

  return results.slice(0, limit);
}

export interface NeighborhoodSummary {
  slug: string;
  label: string;
  city: string;
  state: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  image: string | null;
}

/**
 * Neighborhoods are derived from live listing data rather than kept in a
 * separate table, so they can never drift out of sync with the catalogue.
 */
export async function getNeighborhoods(limit = 8): Promise<NeighborhoodSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "slug, city, state, neighborhood, price, hero_image_url, created_at, property_images(url, is_cover, sort_order)",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw new Error(`Could not load neighborhoods: ${error.message}`);

  const groups = new Map<string, NeighborhoodSummary & { newest: string }>();

  for (const row of data ?? []) {
    const city = String(row.city);
    const neighborhood = (row.neighborhood as string | null)?.trim() || city;
    const state = String(row.state);
    const slug = `${neighborhood}-${city}-${state}`
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const price = Number(row.price ?? 0);
    const image = coverImage(
      row as {
        hero_image_url?: string | null;
        property_images?: Array<{ url: string; is_cover: boolean; sort_order: number }> | null;
      },
    );
    const existing = groups.get(slug);

    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, price);
      existing.maxPrice = Math.max(existing.maxPrice, price);
      existing.averagePrice =
        (existing.averagePrice * (existing.count - 1) + price) / existing.count;
      if (!existing.image && image) existing.image = image;
    } else {
      groups.set(slug, {
        slug,
        label: neighborhood,
        city,
        state,
        count: 1,
        minPrice: price,
        maxPrice: price,
        averagePrice: price,
        image,
        newest: String(row.created_at ?? ""),
      });
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/** Distinct cities in the catalogue, for the search bar's datalist. */
export async function getAvailableCities(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("city")
    .eq("is_published", true)
    .limit(1000);

  if (error) return [];
  const unique = new Set<string>();
  for (const row of data ?? []) {
    const city = String(row.city ?? "").trim();
    if (city) unique.add(city);
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
}

export async function countPublishedProperties(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);
  return count ?? 0;
}

/** Just the slugs and timestamps needed to build the sitemap. */
export async function listPublishedSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(2000);

  if (error) return [];
  return (data ?? []) as { slug: string; updated_at: string }[];
}
