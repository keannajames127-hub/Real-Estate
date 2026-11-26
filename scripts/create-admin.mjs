#!/usr/bin/env node
/**
 * Create (or repair) the first administrator account.
 *
 * Usage:
 *   npm run create-admin
 *   npm run create-admin -- --email you@example.com --username sarah --password "S3cret..."
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be present,
 * either in the environment or in `.env.local`.
 *
 * This is the only supported way to bootstrap an administrator: `admin_users`
 * rows are keyed to `auth.users`, and creating an auth user needs the
 * service-role key, which must never reach the browser.
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function loadEnvFile() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  const contents = readFileSync(path, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Real environment variables always win over the file.
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "\n  Missing Supabase credentials.\n" +
      "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local,\n" +
      "  then run this script again.\n",
  );
  exit(1);
}

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function readFlag(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,32}$/;
const ROLES = ["owner", "admin", "editor"];

function validateEmail(value) {
  if (!EMAIL_PATTERN.test(value)) throw new Error("That does not look like a valid email address.");
  return value.toLowerCase();
}

function validateUsername(value) {
  if (!USERNAME_PATTERN.test(value)) {
    throw new Error(
      "Username must be 3–32 characters using letters, numbers, dot, underscore or hyphen.",
    );
  }
  return value;
}

function validatePassword(value) {
  if (value.length < 10) throw new Error("Password must be at least 10 characters.");
  if (!/[A-Za-z]/.test(value)) throw new Error("Password must include a letter.");
  if (!/[0-9]/.test(value)) throw new Error("Password must include a number.");
  return value;
}

function validateRole(value) {
  const role = (value ?? "owner").toLowerCase();
  if (!ROLES.includes(role)) throw new Error(`Role must be one of: ${ROLES.join(", ")}.`);
  return role;
}

// ---------------------------------------------------------------------------
// Prompting
// ---------------------------------------------------------------------------

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question, fallback) {
  const suffix = fallback ? ` [${fallback}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || fallback || "";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function findUserByEmail(admin, email) {
  // `listUsers` is paginated; the first page covers any realistic install.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log("\n  Sarah Danish Properties — administrator setup\n");

  const email = validateEmail(
    readFlag("email") ?? (await ask("  Email address")),
  );
  const username = validateUsername(
    readFlag("username") ?? (await ask("  Username", email.split("@")[0])),
  );
  const fullName = readFlag("name") ?? (await ask("  Full name (optional)"));
  const role = validateRole(readFlag("role") ?? (await ask("  Role (owner|admin|editor)", "owner")));

  const password = validatePassword(
    readFlag("password") ?? (await ask("  Password (min 10 chars, mixed case + number)")),
  );

  rl.close();

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Create or repair the auth user --------------------------------------
  let userId;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, full_name: fullName },
  });

  if (createError && !/already|exists|registered/i.test(createError.message)) {
    throw new Error(`Could not create the account: ${createError.message}`);
  }

  if (created?.user) {
    userId = created.user.id;
    console.log(`\n  Created auth user ${email}.`);
  } else {
    const existing = await findUserByEmail(admin, email);
    if (!existing) throw new Error("That email already exists but could not be located.");

    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName },
    });
    if (updateError) throw new Error(`Could not update the account: ${updateError.message}`);

    userId = existing.id;
    console.log(`\n  Updated the existing account for ${email}.`);
  }

  // 2. Upsert the admin profile row ----------------------------------------
  const { error: profileError } = await admin
    .from("admin_users")
    .upsert(
      {
        id: userId,
        email,
        username,
        full_name: fullName || null,
        role,
        is_active: true,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    throw new Error(
      `The account exists but the administrator profile could not be saved: ${profileError.message}\n` +
        "  Have you run the SQL migrations in supabase/migrations?",
    );
  }

  console.log(
    `  ${username} now has ${role} access.\n\n` +
      `  Sign in at /admin/login with either "${username}" or "${email}".\n`,
  );
}

main().catch((error) => {
  console.error(`\n  ${error instanceof Error ? error.message : String(error)}\n`);
  exit(1);
});
