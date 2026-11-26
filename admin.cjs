/*
 * Temporary admin-mode smoke test for the remaining write paths:
 * property row actions, the edit form (gallery replace), agent CRUD,
 * the profile form and the website settings form.
 */
const { readFileSync, copyFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE = "http://127.0.0.1:3000";
const STORE = join(process.cwd(), ".local-data", "preview-db.json");
const BACKUP = `${STORE}.admin-backup`;

/**
 * Next.js regenerates server-action ids whenever the dev bundle is rebuilt, so
 * they are read from the current on-disk chunks instead of being hard-coded.
 * Each client action appears as `createServerReference)("<id>", …, "<name>")`.
 */
function resolveActions() {
  const chunks = [
    ".next/static/chunks/app/admin/(dashboard)/properties/page.js",
    ".next/static/chunks/app/admin/(dashboard)/settings/page.js",
    ".next/static/chunks/app/admin/(dashboard)/layout.js",
  ];
  const pattern =
    /createServerReference\)\(\\"([0-9a-f]{20,})\\"[\s\S]{0,400}?\\"([A-Za-z_][A-Za-z0-9_]*)\\"/g;
  const map = {};
  for (const rel of chunks) {
    let source;
    try {
      source = readFileSync(join(process.cwd(), rel), "utf8");
    } catch {
      continue;
    }
    for (const match of source.matchAll(pattern)) map[match[2]] = match[1];
  }
  return map;
}

const ACTIONS = {};

const store = () => JSON.parse(readFileSync(STORE, "utf8"));
let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function unescapeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseAttrs(tag) {
  const out = {};
  const re = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = re.exec(tag))) out[match[1]] = match[2] !== undefined ? match[2] : match[3];
  return out;
}

function actionFieldsFrom(html) {
  const fields = [];
  for (const tag of html.match(/<input\b[^>]*>/g) ?? []) {
    const attrs = parseAttrs(tag);
    if (attrs.type === "hidden" && typeof attrs.name === "string" && attrs.name.startsWith("$ACTION")) {
      fields.push([attrs.name, unescapeHtml(attrs.value ?? "")]);
    }
  }
  return fields;
}

/** Picks the $ACTION hidden fields belonging to the form containing `marker`. */
function formFieldsFor(html, marker) {
  for (const part of html.split(/<form\b/).slice(1)) {
    const end = part.indexOf("</form>");
    const block = end === -1 ? part : part.slice(0, end);
    if (block.includes(marker)) {
      const fields = actionFieldsFrom(block);
      if (fields.length > 0) return fields;
    }
  }
  return null;
}

async function getPage(path) {
  const response = await fetch(`${BASE}${path}`);
  return { status: response.status, body: await response.text() };
}

async function submitForm(path, marker, fields) {
  const page = await getPage(path);
  const actionFields = formFieldsFor(page.body, marker);
  if (!actionFields) throw new Error(`no form matching ${marker} on ${path}`);

  const form = new FormData();
  for (const [name, value] of actionFields) form.append(name, value);
  for (const [name, value] of Object.entries(fields)) form.append(name, value);

  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: form,
    redirect: "manual",
    headers: { origin: BASE, referer: `${BASE}${path}` },
  });
  return { status: response.status, body: await response.text() };
}

async function callAction(path, actionId, args) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: JSON.stringify(args),
    headers: {
      "next-action": actionId,
      "content-type": "text/plain;charset=UTF-8",
      accept: "text/x-component",
      origin: BASE,
    },
  });
  return { status: response.status, body: await response.text() };
}

(async () => {
  // Warm the routes so their client chunks are on disk, then read the ids.
  await getPage("/admin/properties").catch(() => {});
  await getPage("/admin/settings").catch(() => {});
  Object.assign(ACTIONS, resolveActions());
  if (!ACTIONS.deleteProperty || !ACTIONS.saveAgent) {
    console.error(
      "Could not resolve server-action ids from .next/static/chunks — is the dev server running?",
    );
    process.exit(2);
  }

  const original = store();
  copyFileSync(STORE, BACKUP);

  // --- Properties -----------------------------------------------------------
  let propertyId = null;
  try {
    const response = await submitForm("/admin/properties/new", 'id="title"', {
      title: "Admin Smoke Property",
      slug: "admin-smoke-property",
      description: "A temporary listing created by the admin smoke test to exercise the row actions.",
      price: "2,000,000",
      price_period: "total",
      property_type: "villa",
      listing_status: "for_sale",
      is_published: "on",
      street_address: "9 Admin Smoke Lane",
      city: "Atlanta",
      state: "GA",
      zip_code: "30327",
      bedrooms: "5",
      bathrooms: "4",
      images_json: "[]",
    });
    propertyId = store().properties.find((row) => row.slug === "admin-smoke-property")?.id ?? null;
    check("create property (form)", Boolean(propertyId), `http ${response.status}`);
  } catch (error) {
    check("create property (form)", false, error.message);
  }

  if (propertyId) {
    const path = "/admin/properties";

    try {
      await callAction(path, ACTIONS.setPublishState, [propertyId, false]);
      const row = store().properties.find((item) => item.id === propertyId);
      check("unpublish property", row?.is_published === false);
    } catch (error) {
      check("unpublish property", false, error.message);
    }

    try {
      await callAction(path, ACTIONS.setListingStatus, [propertyId, "pending"]);
      const row = store().properties.find((item) => item.id === propertyId);
      check("set listing status", row?.listing_status === "pending", String(row?.listing_status));
    } catch (error) {
      check("set listing status", false, error.message);
    }

    try {
      await callAction(path, ACTIONS.setFeaturedState, [propertyId, true]);
      const row = store().properties.find((item) => item.id === propertyId);
      check("feature property", row?.is_featured === true);
    } catch (error) {
      check("feature property", false, error.message);
    }

    try {
      const imagesBefore = store().property_images.filter((row) => row.property_id === propertyId).length;
      const response = await submitForm(`/admin/properties/${propertyId}/edit`, `value="${propertyId}"`, {
        id: propertyId,
        title: "Admin Smoke Property Renamed",
        slug: "admin-smoke-property",
        description: "The gallery replacement path is exercised by this second save.",
        price: "2,100,000",
        price_period: "total",
        property_type: "villa",
        listing_status: "pending",
        is_published: "on",
        street_address: "9 Admin Smoke Lane",
        city: "Atlanta",
        state: "GA",
        zip_code: "30327",
        bedrooms: "5",
        bathrooms: "4",
        images_json: JSON.stringify([
          { url: "/preview/property-1.jpg", storage_path: null, alt_text: "Smoke", sort_order: 0, is_cover: true },
        ]),
      });
      const row = store().properties.find((item) => item.id === propertyId);
      const imagesAfter = store().property_images.filter((item) => item.property_id === propertyId);
      check(
        "edit property + replace gallery",
        row?.title === "Admin Smoke Property Renamed" && imagesAfter.length === 1 && imagesBefore === 0,
        `http ${response.status}, images ${imagesBefore} -> ${imagesAfter.length}`,
      );
    } catch (error) {
      check("edit property + replace gallery", false, error.message);
    }

    try {
      await callAction(path, ACTIONS.deleteProperty, [propertyId]);
      const gone = !store().properties.some((item) => item.id === propertyId);
      const orphanImages = store().property_images.some((item) => item.property_id === propertyId);
      check("delete property", gone, `orphaned gallery rows: ${orphanImages}`);
    } catch (error) {
      check("delete property", false, error.message);
    }
  }

  // --- Agents --------------------------------------------------------------
  // The "add" form only renders after a click, so the seeded advisor's form is
  // reused: submitting it without the hidden id hits the create branch.
  const seededAgent = original.agents[0];
  const agentMarker = `value="${seededAgent.id}"`;
  let agentId = null;
  try {
    const before = store().agents.length;
    const response = await submitForm("/admin/settings", agentMarker, {
      name: "Smoke Test Agent",
      title: "Test Associate",
      email: "smoke.agent@example.test",
      phone: "+1 (404) 555-0100",
      photo_url: "",
      license_number: "SMOKE-1",
      specialties: "Testing, Locally",
      bio: "A temporary agent created by the local smoke test.",
      sort_order: "99",
      is_active: "on",
    });
    agentId = store().agents.find((row) => row.email === "smoke.agent@example.test")?.id ?? null;
    check("create agent", Boolean(agentId) && store().agents.length === before + 1, `http ${response.status}`);
  } catch (error) {
    check("create agent", false, error.message);
  }

  try {
    const response = await submitForm("/admin/settings", agentMarker, {
      id: seededAgent.id,
      name: seededAgent.name,
      title: "Smoke Test Title",
      email: seededAgent.email ?? "",
      phone: seededAgent.phone ?? "",
      photo_url: seededAgent.photo_url ?? "",
      license_number: seededAgent.license_number ?? "",
      specialties: seededAgent.specialties.join(", "),
      bio: seededAgent.bio ?? "",
      sort_order: String(seededAgent.sort_order),
      is_active: "on",
    });
    const updated = store().agents.find((row) => row.id === seededAgent.id)?.title;
    check("update agent", updated === "Smoke Test Title", `http ${response.status}: ${updated}`);
  } catch (error) {
    check("update agent", false, error.message);
  }

  if (agentId) {
    try {
      await callAction("/admin/settings", ACTIONS.deleteAgent, [agentId]);
      const gone = !store().agents.some((row) => row.id === agentId);
      check("delete agent", gone);
    } catch (error) {
      check("delete agent", false, error.message);
    }
  }

  // --- Settings and profile ------------------------------------------------
  try {
    const response = await submitForm("/admin/settings", 'name="hero_headline"', {
      business_name: store().site_settings[0].business_name,
      tagline: store().site_settings[0].tagline ?? "",
      contact_email: store().site_settings[0].contact_email ?? "",
      contact_phone: store().site_settings[0].contact_phone ?? "",
      office_address: store().site_settings[0].office_address ?? "",
      notification_email: store().site_settings[0].notification_email ?? "",
      hero_headline: "Smoke Test Headline",
      hero_subheadline: store().site_settings[0].hero_subheadline ?? "",
      hero_image_url: "",
      about_text: "",
      footer_note: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
    });
    const saved = store().site_settings[0].hero_headline;
    check("save website settings", saved === "Smoke Test Headline", `http ${response.status}: ${saved}`);
  } catch (error) {
    check("save website settings", false, error.message);
  }

  try {
    const current = store().admin_users[0];
    const response = await submitForm("/admin/settings", 'id="username"', {
      username: current.username,
      full_name: "Smoke Test Owner",
    });
    const updated = store().admin_users.find((row) => row.id === current.id)?.full_name;
    check("update own profile", updated === "Smoke Test Owner", `http ${response.status}: ${updated}`);
  } catch (error) {
    check("update own profile", false, error.message);
  }

  // --- Restore -------------------------------------------------------------
  copyFileSync(BACKUP, STORE);
  const restored = store();
  check(
    "restore store",
    restored.properties.length === original.properties.length &&
      restored.agents.length === original.agents.length &&
      restored.enquiry_notes.length === original.enquiry_notes.length &&
      restored.site_settings[0].hero_headline === original.site_settings[0].hero_headline,
    `properties ${restored.properties.length}, agents ${restored.agents.length}`,
  );

  console.log(failures === 0 ? "\nall admin checks passed" : `\n${failures} admin check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
})();
