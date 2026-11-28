import "server-only";

import { createDashboardClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  EnquiryNote,
  EnquiryStatus,
  EnquiryType,
  EnquiryWithProperty,
} from "@/types/database";

/**
 * Every function in this module reads the `enquiries` table, which is protected
 * by RLS: only an active administrator can reach it. If a non-admin somehow
 * called these, PostgREST would return an empty set rather than someone else's
 * leads.
 */

const ENQUIRY_COLUMNS = [
  "id",
  "reference",
  "property_id",
  "property_title_snapshot",
  "full_name",
  "email",
  "phone",
  "enquiry_type",
  "preferred_contact_method",
  "message",
  "status",
  "source_page",
  "email_notified_at",
  "email_error",
  "created_at",
  "updated_at",
].join(", ");

const PROPERTY_EMBED = "property:properties(id, slug, title, city, state)";

export interface EnquiryFilters {
  q?: string;
  status?: EnquiryStatus | "";
  type?: EnquiryType | "";
  propertyId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface EnquirySearchResult {
  enquiries: EnquiryWithProperty[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  newCount: number;
}

function sanitize(input: string): string {
  return input
    .replace(/[,()%\\*:"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function buildFilters<T extends {
  eq: (c: string, v: unknown) => T;
  gte: (c: string, v: unknown) => T;
  lte: (c: string, v: unknown) => T;
  ilike: (c: string, v: string) => T;
  or: (f: string) => T;
}>(query: T, filters: EnquiryFilters): T {
  let q = query;

  if (filters.status) q = q.eq("status", filters.status);
  if (filters.type) q = q.eq("enquiry_type", filters.type);
  if (filters.propertyId) q = q.eq("property_id", filters.propertyId);
  if (filters.from) q = q.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) q = q.lte("created_at", `${filters.to}T23:59:59.999Z`);

  const term = filters.q ? sanitize(filters.q) : "";
  if (term) {
    const like = `%${term}%`;
    q = q.or(
      [
        `full_name.ilike.${like}`,
        `email.ilike.${like}`,
        `phone.ilike.${like}`,
        `reference.ilike.${like}`,
        `property_title_snapshot.ilike.${like}`,
        `message.ilike.${like}`,
      ].join(","),
    );
  }

  return q;
}

export async function searchEnquiries(
  filters: EnquiryFilters = {},
): Promise<EnquirySearchResult> {
  const supabase = await createDashboardClient();

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(filters.pageSize ?? 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const base = supabase
    .from("enquiries")
    .select(`${ENQUIRY_COLUMNS}, ${PROPERTY_EMBED}`, { count: "exact" });

  const query = buildFilters(base as never, filters) as unknown as typeof base;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Could not load enquiries: ${error.message}`);

  const { count: newCount } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const total = count ?? 0;
  return {
    enquiries: (data ?? []) as unknown as EnquiryWithProperty[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    newCount: newCount ?? 0,
  };
}

/** Unpaginated fetch used by the CSV / Excel export. */
export async function getEnquiriesForExport(
  filters: EnquiryFilters = {},
): Promise<EnquiryWithProperty[]> {
  const supabase = await createDashboardClient();
  const base = supabase
    .from("enquiries")
    .select(`${ENQUIRY_COLUMNS}, ${PROPERTY_EMBED}`)
    .order("created_at", { ascending: false })
    .limit(5000);

  const query = buildFilters(base as never, filters) as unknown as typeof base;
  const { data, error } = await query;
  if (error) throw new Error(`Could not export enquiries: ${error.message}`);
  return (data ?? []) as unknown as EnquiryWithProperty[];
}

export async function getEnquiryById(id: string): Promise<EnquiryWithProperty | null> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(`${ENQUIRY_COLUMNS}, ${PROPERTY_EMBED}`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load that enquiry: ${error.message}`);
  return (data as unknown as EnquiryWithProperty) ?? null;
}

export async function getEnquiryNotes(enquiryId: string): Promise<EnquiryNote[]> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("enquiry_notes")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load notes: ${error.message}`);
  return (data ?? []) as EnquiryNote[];
}

export async function getRecentEnquiries(limit = 5): Promise<EnquiryWithProperty[]> {
  const supabase = await createDashboardClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(`${ENQUIRY_COLUMNS}, ${PROPERTY_EMBED}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load recent enquiries: ${error.message}`);
  return (data ?? []) as unknown as EnquiryWithProperty[];
}

/** Aggregate counters for the dashboard overview. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createDashboardClient();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const countOf = (table: "properties" | "enquiries") =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [
    totalProperties,
    publishedProperties,
    featured,
    forSale,
    forRent,
    pending,
    sold,
    totalEnquiries,
    newEnquiries,
    contacted,
    inProgress,
    closedEnquiries,
    enquiriesLast7Days,
  ] = await Promise.all([
    countOf("properties"),
    countOf("properties").eq("is_published", true),
    countOf("properties").eq("is_featured", true).eq("is_published", true),
    countOf("properties").eq("listing_status", "for_sale").eq("is_published", true),
    countOf("properties").eq("listing_status", "for_rent").eq("is_published", true),
    countOf("properties").eq("listing_status", "pending").eq("is_published", true),
    countOf("properties").eq("listing_status", "sold").eq("is_published", true),
    countOf("enquiries"),
    countOf("enquiries").eq("status", "new"),
    countOf("enquiries").eq("status", "contacted"),
    countOf("enquiries").eq("status", "in_progress"),
    countOf("enquiries").eq("status", "closed"),
    countOf("enquiries").gte("created_at", since),
  ]);

  const total = totalProperties.count ?? 0;
  const published = publishedProperties.count ?? 0;

  return {
    totalProperties: total,
    publishedProperties: published,
    draftProperties: Math.max(0, total - published),
    forSale: forSale.count ?? 0,
    forRent: forRent.count ?? 0,
    pending: pending.count ?? 0,
    sold: sold.count ?? 0,
    featured: featured.count ?? 0,
    totalEnquiries: totalEnquiries.count ?? 0,
    newEnquiries: newEnquiries.count ?? 0,
    activeLeads: (contacted.count ?? 0) + (inProgress.count ?? 0),
    closedEnquiries: closedEnquiries.count ?? 0,
    enquiriesLast7Days: enquiriesLast7Days.count ?? 0,
  };
}
