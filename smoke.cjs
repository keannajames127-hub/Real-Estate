/*
 * Temporary local-mode smoke test.
 * Drives the running dev server over HTTP the same way a browser would, then
 * restores .local-data/preview-db.json to its pre-test contents.
 */
const { readFileSync, writeFileSync, copyFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE = "http://127.0.0.1:3000";
const STORE = join(process.cwd(), ".local-data", "preview-db.json");
const BACKUP = `${STORE}.smoke-backup`;

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
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
  while ((match = re.exec(tag))) {
    out[match[1]] = match[2] !== undefined ? match[2] : match[3];
  }
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

async function get(path) {
  const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const body = await response.text();
  return { status: response.status, body };
}

async function postForm(path, fields) {
  const { body, status } = await get(path);
  if (status !== 200) throw new Error(`GET ${path} returned ${status}`);
  const actionFields = actionFieldsFrom(body);
  if (actionFields.length === 0) throw new Error(`No server-action fields found on ${path}`);

  const form = new FormData();
  for (const [name, value] of actionFields) form.append(name, value);
  for (const [name, value] of Object.entries(fields)) form.append(name, value);

  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: form,
    redirect: "manual",
    headers: { origin: BASE, referer: `${BASE}${path}` },
  });
  return { status: response.status, body: await response.text(), actionFields };
}

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

(async () => {
  copyFileSync(STORE, BACKUP);
  const before = JSON.parse(readFileSync(STORE, "utf8"));

  // 1. Local image upload round-trip.
  try {
    const form = new FormData();
    form.append("file", new Blob([PNG], { type: "image/png" }), "smoke.png");
    const upload = await fetch(`${BASE}/api/local-upload`, { method: "POST", body: form });
    const payload = await upload.json();
    record("upload image", upload.status === 200 && Boolean(payload.url), `${upload.status} ${payload.url ?? payload.error ?? ""}`);

    const remove = await fetch(
      `${BASE}/api/local-upload?path=${encodeURIComponent(payload.storage_path ?? "")}`,
      { method: "DELETE" },
    );
    const removePayload = await remove.json();
    record("delete image", remove.status === 200 && removePayload.ok === true, `${remove.status}`);
  } catch (error) {
    record("upload image", false, error.message);
  }

  // 2. Create a listing through the real admin form.
  try {
    const response = await postForm("/admin/properties/new", {
      title: "Smoke Test Residence",
      slug: "smoke-test-residence",
      description: "A temporary listing created by the local smoke test to prove the admin form writes to the local store.",
      price: "1,250,000",
      price_period: "total",
      property_type: "house",
      listing_status: "for_sale",
      is_published: "on",
      street_address: "1 Smoke Test Way",
      city: "Atlanta",
      state: "GA",
      zip_code: "30327",
      bedrooms: "4",
      bathrooms: "3",
      square_feet: "3200",
      lot_size: "0.5",
      lot_size_unit: "acres",
      year_built: "2015",
      amenities: "Pool, Gym",
      images_json: "[]",
      hero_image_url: "",
    });
    const failed = /Please correct the highlighted fields/.test(response.body);
    if (failed) writeFileSync(join(process.cwd(), ".local-data", "smoke-response.html"), response.body, "utf8");
    const stored = JSON.parse(readFileSync(STORE, "utf8"));
    const created = stored.properties.find((row) => row.slug === "smoke-test-residence");
    record(
      "create property",
      !failed && Boolean(created),
      `http ${response.status}${failed ? " (validation error)" : ""}${created ? ` id=${created.id}` : " not written"}`,
    );

    // The same form with a required field missing must still be rejected.
    const invalid = await postForm("/admin/properties/new", {
      title: "Smoke Test Invalid",
      description: "This submission deliberately omits the bedroom count to prove validation still fails.",
      price: "1000",
      price_period: "total",
      property_type: "house",
      listing_status: "for_sale",
      street_address: "2 Smoke Test Way",
      city: "Atlanta",
      state: "GA",
      zip_code: "30327",
      bathrooms: "2",
      images_json: "[]",
    });
    record(
      "create property rejects missing required field",
      /Please correct the highlighted fields/.test(invalid.body),
      `http ${invalid.status}`,
    );
  } catch (error) {
    record("create property", false, error.message);
  }

  // 3. Roll the store back and confirm the page reflects it.
  try {
    copyFileSync(BACKUP, STORE);
    const page = await get("/admin/properties");
    const rolledBack = !/Smoke Test Residence/.test(page.body);
    record("rollback", page.status === 200 && rolledBack, `http ${page.status}`);
  } catch (error) {
    record("rollback", false, error.message);
  }

  // 4. Public + admin pages render.
  for (const path of ["/", "/properties", "/contact", "/admin", "/admin/properties", "/admin/enquiries", "/admin/settings"]) {
    try {
      const { status } = await get(path);
      record(`page ${path}`, status === 200, `http ${status}`);
    } catch (error) {
      record(`page ${path}`, false, error.message);
    }
  }

  const counts = JSON.parse(readFileSync(STORE, "utf8"));
  console.log(
    `\nstore: properties ${before.properties.length} -> ${counts.properties.length}, enquiries ${before.enquiries.length} -> ${counts.enquiries.length}`,
  );
  const failed = results.filter((row) => !row.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length === 0 ? 0 : 1);
})();
