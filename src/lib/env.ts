/**
 * Environment configuration.
 *
 * Values are read lazily (through functions rather than module-level constants)
 * so that a missing variable produces a clear, actionable error at the moment
 * it is actually needed — instead of breaking the build for no reason.
 */

function read(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function requireEnv(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.local.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  if (!value) {
    throw new Error(
      'Missing required environment variable "NEXT_PUBLIC_SUPABASE_URL". ' +
        "Copy .env.local.example to .env.local and fill in your Supabase credentials.",
    );
  }
  return value.replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!value) {
    throw new Error(
      'Missing required environment variable "NEXT_PUBLIC_SUPABASE_ANON_KEY". ' +
        "Copy .env.local.example to .env.local and fill in your Supabase credentials.",
    );
  }
  return value;
}

/** Service-role key. Server-only — never import this into a client component. */
export function getServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getSiteUrl(): string {
  const configured = read("NEXT_PUBLIC_SITE_URL");
  if (configured) return configured.replace(/\/+$/, "");
  if (read("VERCEL_URL")) return `https://${read("VERCEL_URL")}`;
  return "http://localhost:3000";
}

export function getResendApiKey(): string | null {
  return read("RESEND_API_KEY") || null;
}

export function getResendFromEmail(): string {
  return read("RESEND_FROM_EMAIL") || "Danish Home Properties <onboarding@resend.dev>";
}

export function getFallbackNotificationEmail(): string | null {
  return read("NOTIFICATION_EMAIL") || null;
}

/** True when the Supabase credentials needed to talk to the database exist. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

/** File-backed preview changes are intentionally limited to `next dev`. */
export function isLocalTestMode(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}
