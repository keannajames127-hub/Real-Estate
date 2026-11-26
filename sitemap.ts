import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { listPublishedSlugs } from "@/lib/queries/properties";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" },
  { path: "/neighborhoods", priority: 0.7, changeFrequency: "weekly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const listings = await listPublishedSlugs().catch(() => []);

  const listingEntries: MetadataRoute.Sitemap = listings.map((property) => ({
    url: `${base}/properties/${property.slug}`,
    lastModified: property.updated_at ? new Date(property.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...listingEntries];
}
