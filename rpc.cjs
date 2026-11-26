/*
 * Temporary RPC smoke test for the enquiry controls, which are invoked as
 * client-side server actions (Next-Action header) rather than plain forms.
 */
const { readFileSync, writeFileSync, copyFileSync } = require("node:fs");
const { join } = require("node:path");

const BASE = "http://127.0.0.1:3000";
const STORE = join(process.cwd(), ".local-data", "preview-db.json");
const BACKUP = `${STORE}.rpc-backup`;
const ENQUIRY_ID = "aaaaaaaa-0001-4000-8000-000000000001";
const ACTIONS = {
  updateStatus: "60a7450fcff76282804a8fa1331ef068f291b2015b",
  addNote: "60236f18f1ae5e955ae891b704b9d8d3d5c2ed4c2d",
  deleteNote: "609b9f5ca48e0cca975fcce042e4b2283e21b83b4d",
};

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

const store = () => JSON.parse(readFileSync(STORE, "utf8"));
let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

(async () => {
  const original = store();
  copyFileSync(STORE, BACKUP);
  const path = `/admin/enquiries/${ENQUIRY_ID}`;
  const originalStatus = original.enquiries.find((row) => row.id === ENQUIRY_ID).status;

  try {
    const before = store().enquiries.find((row) => row.id === ENQUIRY_ID).status;
    const target = before === "contacted" ? "in_progress" : "contacted";
    const result = await callAction(path, ACTIONS.updateStatus, [ENQUIRY_ID, target]);
    const after = store().enquiries.find((row) => row.id === ENQUIRY_ID).status;
    check("update enquiry status", after === target, `http ${result.status}: ${before} -> ${after}`);
  } catch (error) {
    check("update enquiry status", false, error.message);
  }

  let noteId = null;
  try {
    const result = await callAction(path, ACTIONS.addNote, [ENQUIRY_ID, "Smoke test note from the local check"]);
    const notes = store().enquiry_notes.filter((row) => row.enquiry_id === ENQUIRY_ID);
    noteId = notes.at(-1)?.id ?? null;
    check("add enquiry note", notes.length === (original.enquiry_notes.length || 0) + 1, `http ${result.status}`);
  } catch (error) {
    check("add enquiry note", false, error.message);
  }

  if (noteId) {
    try {
      const result = await callAction(path, ACTIONS.deleteNote, [noteId, ENQUIRY_ID]);
      const remaining = store().enquiry_notes.filter((row) => row.enquiry_id === ENQUIRY_ID).length;
      check("delete enquiry note", remaining === original.enquiry_notes.length, `http ${result.status}`);
    } catch (error) {
      check("delete enquiry note", false, error.message);
    }
  } else {
    check("delete enquiry note", false, "no note id to delete");
  }

  copyFileSync(BACKUP, STORE);
  const restored = store();
  check(
    "restore store",
    restored.enquiries.find((row) => row.id === ENQUIRY_ID).status === originalStatus &&
      restored.enquiry_notes.length === original.enquiry_notes.length,
    `enquiries ${restored.enquiries.length}, notes ${restored.enquiry_notes.length}`,
  );

  writeFileSync(join(process.cwd(), ".local-data", "rpc-last-response.txt"), "see console");
  console.log(failures === 0 ? "\nall rpc checks passed" : `\n${failures} rpc check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
})();
