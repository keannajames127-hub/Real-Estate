/*
 * Temporary: proves the founder/co-founder portrait path end to end —
 * upload a photo, attach it to an advisor through the real form, and confirm
 * it renders on the public team page. Restores the store afterwards.
 */
const { readFileSync, copyFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE = "http://127.0.0.1:3000";
const STORE = join(process.cwd(), ".local-data", "preview-db.json");
const BACKUP = `${STORE}.portrait-backup`;
const store = () => JSON.parse(readFileSync(STORE, "utf8"));

// 1x1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

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

(async () => {
  const original = store();
  copyFileSync(STORE, BACKUP);
  let uploadedStoragePath = null;

  try {
    const body = new FormData();
    body.append("file", new Blob([PNG], { type: "image/png" }), "founder.png");
    const response = await fetch(`${BASE}/api/local-upload`, { method: "POST", body });
    const result = await response.json();
    uploadedStoragePath = result.storage_path ?? null;
    check("upload portrait file", response.ok && Boolean(result.url), result.url ?? String(response.status));

    const advisor = original.agents[0];
    const submit = await submitForm("/admin/settings", `value="${advisor.id}"`, {
      id: advisor.id,
      name: advisor.name,
      title: advisor.title ?? "",
      email: advisor.email ?? "",
      phone: advisor.phone ?? "",
      photo_url: result.url,
      license_number: advisor.license_number ?? "",
      specialties: advisor.specialties.join(", "),
      bio: advisor.bio ?? "",
      sort_order: String(advisor.sort_order),
      is_active: "on",
    });
    const saved = store().agents.find((row) => row.id === advisor.id);
    check("portrait saved on advisor", saved?.photo_url === result.url, `http ${submit.status}`);

    const team = await getPage("/team");
    const encoded = `url=${encodeURIComponent(result.url)}`;
    check(
      "portrait rendered on /team",
      team.body.includes(encoded) || team.body.includes(result.url),
      `http ${team.status}`,
    );
  } catch (error) {
    check("portrait flow", false, error.message);
  } finally {
    copyFileSync(BACKUP, STORE);
    const restored = store();
    check(
      "restore store",
      restored.agents.length === original.agents.length &&
        restored.agents[0].photo_url === original.agents[0].photo_url,
      `agents ${restored.agents.length}`,
    );
    if (uploadedStoragePath) {
      try {
        await fetch(`${BASE}/api/local-upload?path=${encodeURIComponent(uploadedStoragePath)}`, {
          method: "DELETE",
        });
      } catch {
        // Cleanup only — a transient keep-alive reset here must not fail the run.
      }
    }
  }

  console.log(failures === 0 ? "\nportrait checks passed" : `\n${failures} portrait check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
})();
