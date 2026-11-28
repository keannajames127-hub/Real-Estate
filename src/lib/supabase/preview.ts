import "server-only";

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/env";
import type { AdminUser } from "@/types/database";

import { BUNDLED_CONTENT } from "./preview-content";

/**
 * Offline preview stand-in.
 *
 * While no Supabase credentials are present the dashboard would otherwise be
 * unreachable — every page redirects to a sign-in form that can never succeed.
 * So that the site can still be reviewed, `createClient()` hands back a tiny
 * local stand-in built from the same sample content as `supabase/seed.sql`.
 *
 * This is inert the moment real credentials exist: `isPreviewMode()` flips to
 * false and `createClient()` returns the genuine Supabase client again. Local
 * changes are persisted under `.local-data/` for development testing only.
 */

export function isPreviewMode(): boolean {
  return !isSupabaseConfigured();
}

export const PREVIEW_WRITE_MESSAGE =
  "Local test mode — changes are saved on this PC only and are not sent to a live website.";

type Row = Record<string, unknown>;

const DAY = 86_400_000;
const NOW = Date.now();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(NOW - daysAgo * DAY - hoursAgo * 3_600_000).toISOString();

// Local placeholder photographs shipped in /public/preview. They are used
// instead of remote URLs so `next/image` never has to reach an unlisted host.
const img = (index: number) => `/preview/property-${(index % 3) + 1}.jpg`;

interface SeedProperty {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  price_period: "total" | "month" | "year";
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  property_type: "house" | "villa" | "apartment" | "penthouse" | "townhouse" | "estate" | "land";
  listing_status: "for_sale" | "for_rent" | "pending" | "sold";
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  lot_size_unit: string;
  year_built: number;
  amenities: string[];
  is_featured: boolean;
  is_published: boolean;
  updatedDaysAgo: number;
  heroPrompt: string;
  /** Dedicated cover photograph, when the sample ships with its own image. */
  coverImage?: string;
}

const SEED_PROPERTIES: SeedProperty[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "bel-air-contemporary-estate",
    title: "Bel Air Contemporary Estate",
    description:
      "A gated contemporary residence with canyon-to-ocean views, an infinity pool and a private screening room.",
    price: 12_450_000,
    price_period: "total",
    street_address: "1120 Stradella Road",
    city: "Los Angeles",
    state: "CA",
    zip_code: "90077",
    neighborhood: "Bel Air",
    latitude: 34.0928,
    longitude: -118.4527,
    property_type: "estate",
    listing_status: "for_sale",
    bedrooms: 6,
    bathrooms: 8,
    square_feet: 11_200,
    lot_size: 1.4,
    lot_size_unit: "acres",
    year_built: 2021,
    amenities: ["Infinity pool", "Home cinema", "Wine cellar", "Guest house", "Smart home"],
    is_featured: true,
    is_published: true,
    updatedDaysAgo: 1,
    heroPrompt: "luxury contemporary Bel Air estate at dusk, infinity pool, canyon views",
    coverImage: "/bel-air-estate.jpg",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "newport-beach-harbour-villa",
    title: "Newport Beach Harbour Villa",
    description:
      "A waterfront villa on a private dock, with a 60-foot boat slip and uninterrupted harbour views.",
    price: 8_900_000,
    price_period: "total",
    street_address: "2244 Bayside Drive",
    city: "Newport Beach",
    state: "CA",
    zip_code: "92660",
    neighborhood: "Balboa Peninsula",
    latitude: 33.6060,
    longitude: -117.8960,
    property_type: "villa",
    listing_status: "for_sale",
    bedrooms: 5,
    bathrooms: 6,
    square_feet: 7_400,
    lot_size: 0.42,
    lot_size_unit: "acres",
    year_built: 2018,
    amenities: ["Private dock", "Boat slip", "Outdoor kitchen", "Elevator"],
    is_featured: true,
    is_published: true,
    updatedDaysAgo: 3,
    heroPrompt: "waterfront Newport Beach harbour villa with private dock, golden hour",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "san-diego-marina-penthouse",
    title: "San Diego Marina Penthouse",
    description:
      "A full-floor penthouse above the marina with a wraparound terrace and floor-to-ceiling glazing.",
    price: 18_500,
    price_period: "month",
    street_address: "700 West Harbor Drive",
    city: "San Diego",
    state: "CA",
    zip_code: "92101",
    neighborhood: "Marina District",
    latitude: 32.7090,
    longitude: -117.1710,
    property_type: "penthouse",
    listing_status: "for_rent",
    bedrooms: 4,
    bathrooms: 4,
    square_feet: 4_150,
    lot_size: 0,
    lot_size_unit: "sqft",
    year_built: 2020,
    amenities: ["Wraparound terrace", "Concierge", "Gym", "Valet parking"],
    is_featured: false,
    is_published: true,
    updatedDaysAgo: 6,
    heroPrompt: "modern San Diego marina penthouse interior with wraparound terrace, city skyline",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "pasadena-craftsman-townhouse",
    title: "Pasadena Craftsman Townhouse",
    description:
      "A restored Craftsman townhouse steps from Old Pasadena, with original millwork and a private garden.",
    price: 2_150_000,
    price_period: "total",
    street_address: "178 South Grand Avenue",
    city: "Pasadena",
    state: "CA",
    zip_code: "91105",
    neighborhood: "Old Pasadena",
    latitude: 34.1420,
    longitude: -118.1510,
    property_type: "townhouse",
    listing_status: "pending",
    bedrooms: 3,
    bathrooms: 3,
    square_feet: 2_640,
    lot_size: 0.18,
    lot_size_unit: "acres",
    year_built: 1912,
    amenities: ["Private garden", "Original millwork", "Two-car garage"],
    is_featured: false,
    is_published: true,
    updatedDaysAgo: 9,
    heroPrompt: "restored Pasadena Craftsman townhouse exterior, tree-lined street",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "malibu-cliffside-residence",
    title: "Malibu Cliffside Residence",
    description:
      "A glass-walled residence perched above the Pacific, with direct beach access via a private stair.",
    price: 16_750_000,
    price_period: "total",
    street_address: "27800 Pacific Coast Highway",
    city: "Malibu",
    state: "CA",
    zip_code: "90265",
    neighborhood: "Big Rock",
    latitude: 34.0300,
    longitude: -118.6900,
    property_type: "house",
    listing_status: "sold",
    bedrooms: 5,
    bathrooms: 5,
    square_feet: 6_100,
    lot_size: 0.9,
    lot_size_unit: "acres",
    year_built: 2016,
    amenities: ["Private beach stair", "Ocean terrace", "Solar", "Wine room"],
    is_featured: false,
    is_published: true,
    updatedDaysAgo: 21,
    heroPrompt: "cliffside Malibu residence with glass walls overlooking the Pacific Ocean",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "garden-grove-family-home",
    title: "Garden Grove Family Home",
    description:
      "Draft listing. A single-storey family home with a detached studio and mature citrus garden.",
    price: 1_180_000,
    price_period: "total",
    street_address: "1234 Maple Street",
    city: "Garden Grove",
    state: "CA",
    zip_code: "92840",
    neighborhood: "West Garden Grove",
    latitude: 33.7739,
    longitude: -118.0030,
    property_type: "house",
    listing_status: "for_sale",
    bedrooms: 4,
    bathrooms: 2,
    square_feet: 2_050,
    lot_size: 0.22,
    lot_size_unit: "acres",
    year_built: 1974,
    amenities: ["Detached studio", "Citrus garden", "RV parking"],
    is_featured: false,
    is_published: false,
    updatedDaysAgo: 2,
    heroPrompt: "single storey California family home with citrus garden, warm afternoon light",
  },
];

const SEED_PROPERTIES_ROWS: Row[] = SEED_PROPERTIES.map((p, index) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  description: p.description,
  price: p.price,
  currency: "USD",
  price_period: p.price_period,
  street_address: p.street_address,
  city: p.city,
  state: p.state,
  zip_code: p.zip_code,
  neighborhood: p.neighborhood,
  country: "United States",
  latitude: p.latitude,
  longitude: p.longitude,
  property_type: p.property_type,
  listing_status: p.listing_status,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  square_feet: p.square_feet,
  lot_size: p.lot_size,
  lot_size_unit: p.lot_size_unit,
  year_built: p.year_built,
  amenities: p.amenities,
  hero_image_url: p.coverImage ?? img(index),
  is_featured: p.is_featured,
  is_published: p.is_published,
  published_at: p.is_published ? iso(p.updatedDaysAgo) : null,
  created_by: "00000000-0000-4000-8000-000000000001",
  created_at: iso(p.updatedDaysAgo + 14),
  updated_at: iso(p.updatedDaysAgo),
  property_images: [
    {
      id: `${p.id}-img-1`,
      property_id: p.id,
      url: p.coverImage ?? img(index),
      storage_path: null,
      alt_text: p.title,
      sort_order: 0,
      is_cover: true,
      created_at: iso(p.updatedDaysAgo + 14),
    },
  ],
}));

const SEED_ENQUIRIES_ROWS: Row[] = [
  {
    id: "aaaaaaaa-0001-4000-8000-000000000001",
    reference: "DSHP-24001",
    property_id: SEED_PROPERTIES[0].id,
    property_title_snapshot: SEED_PROPERTIES[0].title,
    full_name: "Marcus Whitfield",
    email: "marcus.whitfield@example.com",
    phone: "+1 (581) 238-7344",
    enquiry_type: "private_viewing" as const,
    preferred_contact_method: "phone" as const,
    message:
      "We are relocating from Chicago in the spring and would like to arrange a private viewing of the Bel Air estate this month.",
    status: "new" as const,
    source_page: "/properties/bel-air-contemporary-estate",
    email_notified_at: iso(1),
    email_error: null,
    created_at: iso(1, 3),
    updated_at: iso(1, 3),
    property: {
      id: SEED_PROPERTIES[0].id,
      slug: SEED_PROPERTIES[0].slug,
      title: SEED_PROPERTIES[0].title,
      city: SEED_PROPERTIES[0].city,
      state: SEED_PROPERTIES[0].state,
    },
  },
  {
    id: "aaaaaaaa-0002-4000-8000-000000000002",
    reference: "DSHP-24002",
    property_id: SEED_PROPERTIES[1].id,
    property_title_snapshot: SEED_PROPERTIES[1].title,
    full_name: "Priya Raghunathan",
    email: "priya.r@example.com",
    phone: "+1 (581) 238-7350",
    enquiry_type: "property_enquiry" as const,
    preferred_contact_method: "email" as const,
    message: "Could you confirm the annual HOA and whether the dock mooring is transferable?",
    status: "new" as const,
    source_page: "/properties/newport-beach-harbour-villa",
    email_notified_at: null,
    email_error: null,
    created_at: iso(2, 6),
    updated_at: iso(2, 6),
    property: {
      id: SEED_PROPERTIES[1].id,
      slug: SEED_PROPERTIES[1].slug,
      title: SEED_PROPERTIES[1].title,
      city: SEED_PROPERTIES[1].city,
      state: SEED_PROPERTIES[1].state,
    },
  },
  {
    id: "aaaaaaaa-0003-4000-8000-000000000003",
    reference: "DSHP-24003",
    property_id: SEED_PROPERTIES[2].id,
    property_title_snapshot: SEED_PROPERTIES[2].title,
    full_name: "Daniel Okafor",
    email: "d.okafor@example.com",
    phone: "+1 (581) 238-7361",
    enquiry_type: "more_information" as const,
    preferred_contact_method: "either" as const,
    message: "Is the marina penthouse available for a twelve-month lease starting in June?",
    status: "contacted" as const,
    source_page: "/properties/san-diego-marina-penthouse",
    email_notified_at: iso(4),
    email_error: null,
    created_at: iso(5),
    updated_at: iso(3),
    property: {
      id: SEED_PROPERTIES[2].id,
      slug: SEED_PROPERTIES[2].slug,
      title: SEED_PROPERTIES[2].title,
      city: SEED_PROPERTIES[2].city,
      state: SEED_PROPERTIES[2].state,
    },
  },
  {
    id: "aaaaaaaa-0004-4000-8000-000000000004",
    reference: "DSHP-24004",
    property_id: null,
    property_title_snapshot: null,
    full_name: "Helena Brandt",
    email: "helena.brandt@example.com",
    phone: "+1 (581) 238-7374",
    enquiry_type: "general" as const,
    preferred_contact_method: "email" as const,
    message:
      "I am looking for a hillside home between $4m and $6m in the Pasadena or Altadena area.",
    status: "in_progress" as const,
    source_page: "/contact",
    email_notified_at: iso(8),
    email_error: null,
    created_at: iso(9),
    updated_at: iso(6),
    property: null,
  },
  {
    id: "aaaaaaaa-0005-4000-8000-000000000005",
    reference: "DSHP-24005",
    property_id: SEED_PROPERTIES[4].id,
    property_title_snapshot: SEED_PROPERTIES[4].title,
    full_name: "Tomas Ferreira",
    email: "tomas.ferreira@example.com",
    phone: null,
    enquiry_type: "property_enquiry" as const,
    preferred_contact_method: "email" as const,
    message: "Congratulations on the Malibu sale — please keep me on the list for similar listings.",
    status: "closed" as const,
    source_page: "/properties/malibu-cliffside-residence",
    email_notified_at: iso(19),
    email_error: null,
    created_at: iso(20),
    updated_at: iso(18),
    property: {
      id: SEED_PROPERTIES[4].id,
      slug: SEED_PROPERTIES[4].slug,
      title: SEED_PROPERTIES[4].title,
      city: SEED_PROPERTIES[4].city,
      state: SEED_PROPERTIES[4].state,
    },
  },
];

const SEED_AGENTS_ROWS: Row[] = [
  {
    id: "bbbbbbbb-0001-4000-8000-000000000001",
    name: "Daniel S. Hansen",
    title: "Founder & Principal Broker",
    bio: "Twenty-two years placing exceptional California homes with private clients.",
    email: "daniel@danishhomeproperties.com",
    phone: "+1 (581) 238-7344",
    photo_url: null,
    license_number: "DRE #01987654",
    specialties: ["Bel Air & Westside", "Architectural estates", "Off-market"],
    sort_order: 1,
    is_active: true,
    created_at: iso(120),
    updated_at: iso(30),
  },
  {
    id: "bbbbbbbb-0002-4000-8000-000000000002",
    name: "Amelia Contreras",
    title: "Senior Advisor — Coastal",
    bio: "Specialist in Newport Beach, Corona del Mar and Laguna waterfront property.",
    email: "amelia@danishhomeproperties.com",
    phone: "+1 (581) 238-7355",
    photo_url: null,
    license_number: "DRE #02123456",
    specialties: ["Coastal Orange County", "Waterfront", "New development"],
    sort_order: 2,
    is_active: true,
    created_at: iso(96),
    updated_at: iso(24),
  },
  {
    id: "bbbbbbbb-0003-4000-8000-000000000003",
    name: "Nathan Reyes",
    title: "Advisor — San Diego",
    bio: "Advises buyers across La Jolla, Del Mar and the downtown marina district.",
    email: "nathan@danishhomeproperties.com",
    phone: "+1 (581) 238-7366",
    photo_url: null,
    license_number: "DRE #02098765",
    specialties: ["La Jolla", "Del Mar", "Investment"],
    sort_order: 3,
    is_active: true,
    created_at: iso(72),
    updated_at: iso(12),
  },
];

/** The administrator the preview session signs in as. */
export const PREVIEW_ADMIN: AdminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "admin@danishhomeproperties.com",
  username: "adminyy",
  full_name: "Daniel S. Hansen",
  role: "owner",
  is_active: true,
  last_login_at: iso(0, 4),
  created_at: iso(150),
  updated_at: iso(0, 4),
};

const SEED_ADMIN_ROWS: Row[] = [PREVIEW_ADMIN as unknown as Row];

const SEED_SETTINGS_ROW: Row = {
  id: 1,
  business_name: "Danish Home Properties",
  tagline: "Exceptional homes across California's most coveted addresses.",
  contact_email: "hello@danishhomeproperties.com",
  contact_phone: "+1 (581) 238-7344",
  office_address: "1234 Maple Street, Garden Grove, CA 92840, United States",
  notification_email: "hello@danishhomeproperties.com",
  about_text:
    "Danish Home Properties represents a small number of exceptional California homes each year.",
  social_links: {},
  hero_headline: "Discover Exceptional Properties",
  hero_subheadline:
    "A curated collection of California's finest homes, presented with discretion and care.",
  hero_image_url: null,
  footer_note: null,
  updated_at: iso(30),
};

const TABLES: Record<string, Row[]> = {
  properties: SEED_PROPERTIES_ROWS,
  property_images: SEED_PROPERTIES_ROWS.flatMap((property) =>
    (property.property_images as Row[]) ?? [],
  ),
  enquiries: SEED_ENQUIRIES_ROWS,
  enquiry_notes: [],
  agents: SEED_AGENTS_ROWS,
  admin_users: SEED_ADMIN_ROWS,
  site_settings: [SEED_SETTINGS_ROW],
  public_site_settings: [],
};

const LOCAL_STORE_DIR = join(process.cwd(), ".local-data");
const LOCAL_STORE_FILE = join(LOCAL_STORE_DIR, "preview-db.json");
const PERSISTED_TABLES = [
  "properties",
  "property_images",
  "enquiries",
  "enquiry_notes",
  "agents",
  "admin_users",
  "site_settings",
] as const;

let localStoreLoaded = false;

function syncRelatedRows(): void {
  const images = TABLES.property_images ?? [];
  for (const property of TABLES.properties ?? []) {
    property.property_images = images
      .filter((image) => image.property_id === property.id)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  }

  TABLES.public_site_settings = (TABLES.site_settings ?? []).map(
    ({ notification_email: _privateEmail, updated_at: _updatedAt, ...publicRow }) =>
      publicRow,
  );
}

/** Tables the deployed content bundle supplies when no database is attached. */
const BUNDLED_TABLES = ["properties", "property_images", "agents", "site_settings"] as const;

function loadLocalStore(force = false): void {
  if (localStoreLoaded && !force) return;
  localStoreLoaded = true;

  // A deployment with no database attached serves the content bundle compiled
  // into the app, so the storefront still shows the real listings instead of an
  // empty catalogue. Writes stay refused outside development.
  for (const table of BUNDLED_TABLES) {
    TABLES[table] = BUNDLED_CONTENT[table];
  }

  if (process.env.NODE_ENV === "production" || !existsSync(LOCAL_STORE_FILE)) {
    syncRelatedRows();
    return;
  }

  try {
    const saved = JSON.parse(readFileSync(LOCAL_STORE_FILE, "utf8")) as Record<
      string,
      unknown
    >;
    for (const table of PERSISTED_TABLES) {
      if (Array.isArray(saved[table])) TABLES[table] = saved[table] as Row[];
    }
  } catch {
    // Keep the built-in sample data if the local test file is unreadable.
  }

  syncRelatedRows();
}

function persistLocalStore(): void {
  if (process.env.NODE_ENV === "production") return;
  loadLocalStore();
  mkdirSync(LOCAL_STORE_DIR, { recursive: true });
  const temporaryFile = `${LOCAL_STORE_FILE}.${process.pid}.tmp`;
  const snapshot = Object.fromEntries(
    PERSISTED_TABLES.map((table) => [table, TABLES[table] ?? []]),
  );
  writeFileSync(temporaryFile, JSON.stringify(snapshot, null, 2), "utf8");
  renameSync(temporaryFile, LOCAL_STORE_FILE);
}

interface BuilderState {
  filters: Array<(row: Row) => boolean>;
  order: Array<{ column: string; ascending: boolean }>;
  limit: number | null;
  range: [number, number] | null;
  operation: "insert" | "update" | "upsert" | "delete" | null;
  values: Row[];
  patch: Row;
  returning: boolean;
  head: boolean;
  executed: boolean;
  resultRows: Row[];
  error: { message: string; code?: string } | null;
}

function makeBuilder(table: string): unknown {
  const rows = TABLES[table] ?? [];
  const state: BuilderState = {
    filters: [],
    order: [],
    limit: null,
    range: null,
    operation: null,
    values: [],
    patch: {},
    returning: false,
    head: false,
    executed: false,
    resultRows: [],
    error: null,
  };

  const matches = (): Row[] => rows.filter((row) => state.filters.every((test) => test(row)));

  const ordered = (input: Row[]): Row[] => {
    let out = [...input];
    for (let i = state.order.length - 1; i >= 0; i -= 1) {
      const { column, ascending } = state.order[i];
      out.sort((a, b) => {
        const left = a[column];
        const right = b[column];
        if (left === right) return 0;
        if (left == null) return ascending ? -1 : 1;
        if (right == null) return ascending ? 1 : -1;
        return (left < right ? -1 : 1) * (ascending ? 1 : -1);
      });
    }
    return out;
  };

  const page = (input: Row[]): Row[] => {
    let out = input;
    if (state.range) out = out.slice(state.range[0], state.range[1] + 1);
    else if (state.limit != null) out = out.slice(0, state.limit);
    return out;
  };

  const decorate = (input: Row[]): Row[] =>
    input.map((row) => {
      if (table === "properties") {
        return {
          ...row,
          property_images: (TABLES.property_images ?? [])
            .filter((image) => image.property_id === row.id)
            .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)),
        };
      }

      if (table === "enquiries") {
        const property = (TABLES.properties ?? []).find(
          (candidate) => candidate.id === row.property_id,
        );
        return {
          ...row,
          property: property
            ? {
                id: property.id,
                slug: property.slug,
                title: property.title,
                city: property.city,
                state: property.state,
              }
            : null,
        };
      }

      return row;
    });

  const evaluate = (): Row[] => page(ordered(matches()));

  const defaults = (value: Row): Row => {
    const now = new Date().toISOString();
    const id = typeof value.id === "string" ? value.id : crypto.randomUUID();
    const common = { ...value, id };

    switch (table) {
      case "properties":
        return {
          currency: "USD",
          price_period: "total",
          country: "United States",
          amenities: [],
          is_featured: false,
          is_published: false,
          published_at: null,
          created_by: PREVIEW_ADMIN.id,
          created_at: now,
          updated_at: now,
          property_images: [],
          ...common,
        };
      case "property_images":
        return { storage_path: null, alt_text: null, sort_order: 0, is_cover: false, created_at: now, ...common };
      case "enquiries":
        return {
          reference: `DSHP-${Date.now().toString().slice(-8)}`,
          property_id: null,
          property_title_snapshot: null,
          phone: null,
          message: null,
          status: "new",
          email_notified_at: null,
          email_error: null,
          created_at: now,
          updated_at: now,
          ...common,
        };
      case "enquiry_notes":
        return { author_id: null, author_name: null, created_at: now, ...common };
      case "agents":
        return {
          title: null,
          bio: null,
          email: null,
          phone: null,
          photo_url: null,
          license_number: null,
          specialties: [],
          sort_order: 0,
          is_active: true,
          created_at: now,
          updated_at: now,
          ...common,
        };
      case "admin_users":
        return {
          full_name: null,
          role: "admin",
          is_active: true,
          last_login_at: null,
          created_at: now,
          updated_at: now,
          ...common,
        };
      default:
        return common;
    }
  };

  const duplicateError = (candidate: Row, existing?: Row) => {
    if (!existing) return null;
    const uniqueFields =
      table === "properties"
        ? ["slug"]
        : table === "admin_users"
          ? ["email", "username"]
          : [];
    return uniqueFields.some(
      (field) =>
        candidate[field] != null &&
        candidate[field] === existing[field] &&
        candidate.id !== existing.id,
    )
      ? { message: "duplicate key value violates unique constraint", code: "23505" }
      : null;
  };

  const executeWrite = (): void => {
    if (state.executed || !state.operation) return;
    state.executed = true;
    if (process.env.NODE_ENV === "production") {
      state.error = {
        message: "Local test writes are disabled in production. Configure a live database and storage provider.",
      };
      return;
    }
    const targets = matches();
    const now = new Date().toISOString();

    if (state.operation === "insert" || state.operation === "upsert") {
      for (const input of state.values) {
        const key = [
          ["id", input.id],
          ["slug", input.slug],
          ["email", input.email],
          ["username", input.username],
        ].find(([, value]) => typeof value === "string")?.[0] as string | undefined;
        const existing = key
          ? rows.find((row) => row[key] === input[key])
          : undefined;

        if (state.operation === "upsert" && existing) {
          Object.assign(existing, input, { updated_at: now });
          state.resultRows.push(existing);
          continue;
        }

        const candidate = defaults(input);
        const duplicate = rows
          .map((row) => duplicateError(candidate, row))
          .find(Boolean);
        if (duplicate) {
          state.error = duplicate;
          break;
        }
        rows.push(candidate);
        state.resultRows.push(candidate);
      }
    } else if (state.operation === "update") {
      for (const row of targets) {
        Object.assign(row, state.patch);
        if ("updated_at" in row && !("updated_at" in state.patch)) row.updated_at = now;
        state.resultRows.push(row);
      }
    } else if (state.operation === "delete") {
      state.resultRows = targets;
      for (const row of targets) {
        const index = rows.indexOf(row);
        if (index >= 0) rows.splice(index, 1);
      }
      if (table === "properties") {
        const deletedIds = new Set(targets.map((row) => row.id));
        TABLES.property_images = (TABLES.property_images ?? []).filter(
          (image) => !deletedIds.has(image.property_id),
        );
        for (const enquiry of TABLES.enquiries ?? []) {
          if (deletedIds.has(enquiry.property_id)) enquiry.property_id = null;
        }
      }
    }

    if (!state.error) {
      syncRelatedRows();
      if (table === "admin_users") {
        const current = TABLES.admin_users.find((row) => row.id === PREVIEW_ADMIN.id);
        if (current) Object.assign(PREVIEW_ADMIN, current);
      }
      persistLocalStore();
    }
  };

  const result = () => {
    executeWrite();
    const fullRows = state.operation ? state.resultRows : ordered(matches());
    const selectedRows = state.operation ? fullRows : page(fullRows);
    return {
      data: state.head || (state.operation && !state.returning) ? null : decorate(selectedRows),
      error: state.error,
      count: state.operation ? state.resultRows.length : matches().length,
    };
  };

  const handlers: Record<string, (...args: never[]) => unknown> = {
    select: (_columns?: string, options?: { head?: boolean }) => {
      if (state.operation) state.returning = true;
      state.head = options?.head === true;
      return api;
    },
    eq: (column: string, value: unknown) => {
      state.filters.push((row) => row[column] === value);
      return api;
    },
    neq: (column: string, value: unknown) => {
      state.filters.push((row) => row[column] !== value);
      return api;
    },
    gt: (column: string, value: unknown) => {
      state.filters.push((row) => (row[column] as never) > (value as never));
      return api;
    },
    gte: (column: string, value: unknown) => {
      state.filters.push((row) => (row[column] as never) >= (value as never));
      return api;
    },
    lt: (column: string, value: unknown) => {
      state.filters.push((row) => (row[column] as never) < (value as never));
      return api;
    },
    lte: (column: string, value: unknown) => {
      state.filters.push((row) => (row[column] as never) <= (value as never));
      return api;
    },
    is: (column: string, value: unknown) => {
      state.filters.push((row) =>
        value === null ? row[column] == null : row[column] === value,
      );
      return api;
    },
    in: (column: string, values: unknown[]) => {
      state.filters.push((row) => values.includes(row[column]));
      return api;
    },
    ilike: (column: string, pattern: string) => {
      const escaped = String(pattern)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/%/g, ".*")
        .replace(/_/g, ".");
      const matcher = new RegExp(`^${escaped}$`, "i");
      state.filters.push((row) => matcher.test(String(row[column] ?? "")));
      return api;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      state.order.push({ column, ascending: options?.ascending !== false });
      return api;
    },
    limit: (count: number) => {
      state.limit = count;
      return api;
    },
    range: (from: number, to: number) => {
      state.range = [from, to];
      return api;
    },
    or: (expression: string) => {
      const clauses = String(expression).split(",").map((clause) => {
        const [column, operator, ...parts] = clause.split(".");
        const expected = parts.join(".");
        return (row: Row) => {
          if (operator === "ilike") {
            const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*");
            return new RegExp(`^${escaped}$`, "i").test(String(row[column] ?? ""));
          }
          if (operator === "eq") return String(row[column]) === expected;
          return false;
        };
      });
      state.filters.push((row) => clauses.some((clause) => clause(row)));
      return api;
    },
    not: (column: string, operator: string, value: unknown) => {
      state.filters.push((row) =>
        operator === "is" ? row[column] !== value : row[column] !== value,
      );
      return api;
    },
    filter: (column: string, operator: string, value: unknown) => {
      if (operator === "ilike") {
        const escaped = String(value)
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/%/g, ".*")
          .replace(/_/g, ".");
        const matcher = new RegExp(`^${escaped}$`, "i");
        state.filters.push((row) => matcher.test(String(row[column] ?? "")));
      } else if (operator === "eq") {
        state.filters.push((row) => row[column] === value);
      }
      return api;
    },
    match: (criteria: Row) => {
      for (const [column, value] of Object.entries(criteria)) {
        state.filters.push((row) => row[column] === value);
      }
      return api;
    },
    textSearch: (column: string, query: string) => {
      const terms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
      state.filters.push((row) => terms.every((term) => String(row[column] ?? "").toLowerCase().includes(term)));
      return api;
    },
    contains: (column: string, values: unknown) => {
      state.filters.push((row) =>
        Array.isArray(row[column])
          ? Array.isArray(values) && values.every((value) => (row[column] as unknown[]).includes(value))
          : false,
      );
      return api;
    },
    single: async () => {
      const response = result();
      const data = Array.isArray(response.data) ? response.data[0] ?? null : null;
      return { ...response, data };
    },
    maybeSingle: async () => {
      const response = result();
      const data = Array.isArray(response.data) ? response.data[0] ?? null : null;
      return { ...response, data };
    },
    insert: (values: Row | Row[]) => {
      state.operation = "insert";
      state.values = (Array.isArray(values) ? values : [values]).map((value) => ({ ...value }));
      return api;
    },
    update: (patch: Row) => {
      state.operation = "update";
      state.patch = { ...patch };
      return api;
    },
    upsert: (values: Row | Row[]) => {
      state.operation = "upsert";
      state.values = (Array.isArray(values) ? values : [values]).map((value) => ({ ...value }));
      return api;
    },
    delete: () => {
      state.operation = "delete";
      return api;
    },
    then: (
      onFulfilled: (value: unknown) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve().then(result).then(onFulfilled, onRejected),
  };

  // Any method we have not listed simply keeps the chain alive, so an
  // unfamiliar query shape degrades to "sample data" instead of crashing.
  const api: unknown = new Proxy(handlers, {
    get(target, property) {
      if (property in target) return target[property as string];
      return () => api;
    },
  });

  return api;
}

const STORAGE_STUB = {
  from: () => ({
    upload: async () => ({ data: null, error: { message: PREVIEW_WRITE_MESSAGE } }),
    remove: async () => ({ data: null, error: { message: PREVIEW_WRITE_MESSAGE } }),
    getPublicUrl: () => ({ data: { publicUrl: "" } }),
    createSignedUrl: async () => ({ data: null, error: { message: PREVIEW_WRITE_MESSAGE } }),
  }),
};

export function createPreviewClient(): SupabaseClient {
  // Next dev can serve actions and page requests from separate workers. Reload
  // the shared file so each request observes writes made by the other worker.
  loadLocalStore(true);
  const localUser = {
    id: PREVIEW_ADMIN.id,
    email: PREVIEW_ADMIN.email,
    user_metadata: {
      username: PREVIEW_ADMIN.username,
      full_name: PREVIEW_ADMIN.full_name,
    },
  };
  const localSession = { user: localUser, access_token: "local-preview", refresh_token: "local-preview" };

  const client = {
    from: (table: string) => makeBuilder(table),
    rpc: (name: string, args?: Record<string, unknown>) => {
      if (name === "email_for_username") {
        const username = args?.p_username;
        const admin = (TABLES.admin_users ?? []).find((row) => row.username === username);
        return Promise.resolve({ data: admin?.email ?? null, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    },
    storage: STORAGE_STUB,
    auth: {
      getUser: async () => ({ data: { user: localUser }, error: null }),
      getSession: async () => ({ data: { session: localSession }, error: null }),
      signInWithPassword: async () => ({
        data: { user: localUser, session: localSession },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      updateUser: async (attributes: Record<string, unknown>) => {
        if (typeof attributes.email === "string") {
          localUser.email = attributes.email;
        }
        return { data: { user: localUser }, error: null };
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      admin: {
        createUser: async (attributes: Record<string, unknown>) => {
          const user = {
            id: crypto.randomUUID(),
            email: attributes.email,
            user_metadata: attributes.user_metadata ?? {},
          };
          return { data: { user }, error: null };
        },
        deleteUser: async () => ({ data: {}, error: null }),
        generateLink: async () => ({ data: { properties: { action_link: "" } }, error: null }),
      },
    },
  };

  return client as unknown as SupabaseClient;
}
