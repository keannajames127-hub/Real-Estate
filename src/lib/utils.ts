import type { Property } from "@/types/database";

/** Minimal class-name joiner (keeps the bundle free of extra dependencies). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Formats a listing price. Rental listings carry a period, which is appended
 * as a suffix so the value never reads ambiguously.
 */
export function formatPrice(
  price: number | string | null | undefined,
  period: Property["price_period"] = "total",
): string {
  if (price === null || price === undefined || price === "") return "Price on request";
  const value = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(value)) return "Price on request";

  const base = currencyFormatter.format(value);
  if (period === "month") return `${base}/mo`;
  if (period === "year") return `${base}/yr`;
  return base;
}

/** "$8.5M" — used in tight spaces such as stat tiles and map popups. */
export function formatPriceCompact(price: number | null | undefined): string {
  if (price === null || price === undefined || !Number.isFinite(price)) return "—";
  return `$${compactFormatter.format(price)}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** "3 days ago" / "in 2 hours" — used on the leads workspace. */
export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 24 * 365],
    ["month", 60 * 24 * 30],
    ["week", 60 * 24 * 7],
    ["day", 60 * 24],
    ["hour", 60],
    ["minute", 1],
  ];

  for (const [unit, minutesPerUnit] of units) {
    if (Math.abs(diffMinutes) >= minutesPerUnit) {
      return formatter.format(Math.round(diffMinutes / minutesPerUnit), unit);
    }
  }
  return "just now";
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function truncate(input: string | null | undefined, length = 160): string {
  if (!input) return "";
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length - 1).trimEnd()}…`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function propertyAddress(property: Pick<Property, "street_address" | "city" | "state" | "zip_code">): string {
  return `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`;
}

export function shortAddress(property: Pick<Property, "city" | "state" | "neighborhood">): string {
  return property.neighborhood ? `${property.neighborhood}, ${property.city}` : `${property.city}, ${property.state}`;
}

export function coverImage(property: {
  hero_image_url?: string | null;
  property_images?: Array<{ url: string; is_cover: boolean; sort_order: number }> | null;
}): string | null {
  const images = property.property_images ?? [];
  // The image flagged as the cover in the gallery manager is the one the admin
  // chose, so it always wins. `hero_image_url` is only a fallback for listings
  // that have no photographs uploaded yet.
  const cover = images.find((image) => image.is_cover);
  if (cover) return cover.url;
  if (property.hero_image_url) return property.hero_image_url;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
}

/**
 * Supabase's PostgREST can return embedded relations as either an object or an
 * array depending on the detected cardinality. Normalise to an array so callers
 * never have to care.
 */
export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Builds a querystring while dropping empty values. */
export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function absoluteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Number of nights/days between two dates — used for "new this week" counters. */
export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

/** A phone number reduced to digits only, suitable for a `wa.me` link. */
export function phoneDigits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

/**
 * WhatsApp click-to-chat link, or null when no number is configured.
 *
 * The public phone number is deliberately WhatsApp-only: every place it is
 * shown links here instead of a `tel:` handler, so visitors start a chat
 * rather than a phone call.
 */
export function whatsappHref(phone: string | null | undefined): string | null {
  const digits = phoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : null;
}
