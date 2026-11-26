import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the redirect back from Supabase Auth for email confirmation and
 * password-recovery links. Exchanges the short-lived code for a session cookie,
 * then forwards the visitor to the intended admin page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next") ?? "/admin";
  const next = nextParam.startsWith("/admin") && !nextParam.startsWith("//") ? nextParam : "/admin";

  // A link followed on an unconfigured deployment should explain itself rather
  // than fail the request outright.
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent("Authentication is not configured yet.")}`,
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent("That link has expired. Please request a new one.")}`,
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "recovery" | "email",
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/admin/login?error=${encodeURIComponent("That link is no longer valid.")}`,
  );
}
