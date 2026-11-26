/*
 * One-off: restores the "Bel Air Contemporary Estate" sample listing in the
 * local preview store and gives it the generated cover photograph.
 * Safe to re-run: an existing Bel Air listing only has its cover refreshed.
 */
const { readFileSync, writeFileSync, copyFileSync } = require("node:fs");
const { join } = require("node:path");
const { randomUUID } = require("node:crypto");

const STORE = join(process.cwd(), ".local-data", "preview-db.json");
const SLUG = "bel-air-contemporary-estate";
const COVER = "/bel-air-estate.jpg";
const TITLE = "Bel Air Contemporary Estate";

copyFileSync(STORE, `${STORE}.bel-air-backup`);
const db = JSON.parse(readFileSync(STORE, "utf8"));
console.log("tables:", Object.keys(db).join(", "));

db.properties = db.properties ?? [];
db.property_images = db.property_images ?? [];

const existing = db.properties.find((property) => property.slug === SLUG);
if (existing) {
  existing.hero_image_url = COVER;
  const cover = db.property_images.find(
    (image) => image.property_id === existing.id && image.is_cover,
  );
  if (cover) cover.url = COVER;
  console.log(`updated existing listing ${existing.id} (${TITLE})`);
} else {
  const now = new Date().toISOString();
  const created = new Date(Date.now() - 15 * 86_400_000).toISOString();
  const id = randomUUID();

  db.properties.unshift({
    id,
    slug: SLUG,
    title: TITLE,
    description:
      "A gated contemporary residence with canyon-to-ocean views, an infinity pool and a private screening room.",
    price: 12450000,
    currency: "USD",
    price_period: "total",
    street_address: "1120 Stradella Road",
    city: "Los Angeles",
    state: "CA",
    zip_code: "90077",
    neighborhood: "Bel Air",
    country: "United States",
    latitude: 34.0928,
    longitude: -118.4527,
    property_type: "estate",
    listing_status: "for_sale",
    bedrooms: 6,
    bathrooms: 8,
    square_feet: 11200,
    lot_size: 1.4,
    lot_size_unit: "acres",
    year_built: 2021,
    amenities: ["Infinity pool", "Home cinema", "Wine cellar", "Guest house", "Smart home"],
    hero_image_url: COVER,
    is_featured: true,
    is_published: true,
    published_at: now,
    created_by: "00000000-0000-4000-8000-000000000001",
    created_at: created,
    updated_at: now,
  });

  db.property_images.unshift({
    id: randomUUID(),
    property_id: id,
    url: COVER,
    storage_path: null,
    alt_text: TITLE,
    sort_order: 0,
    is_cover: true,
    created_at: created,
  });

  console.log(`created listing ${id} (${TITLE}) with cover ${COVER}`);
}

writeFileSync(STORE, JSON.stringify(db, null, 2), "utf8");
console.log("properties now:", db.properties.length);
