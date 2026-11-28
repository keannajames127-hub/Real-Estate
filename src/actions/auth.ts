"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getAdminSession, requireAdmin } from "@/lib/auth";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import type { AuthFormState } from "@/lib/form-state";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { PREVIEW_ADMIN, PREVIEW_ADMIN_PASSWORD } from "@/lib/supabase/preview";
import { PREVIEW_ADMIN_COOKIE } from "@/lib/supabase/preview-cookie";
import { createClient, servesBundledContent } from "@/lib/supabase/server";
import {
  fieldErrors,
  formDataToObject,
  loginSchema,
  newPasswordSchema,
  passwordResetRequestSchema,
} from "@/lib/validation/schemas";

async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

/** Only ever redirect to a path inside the admin area. */
function safeRedirectTarget(candidate: string | null | undefined): string {
  if (!candidate) return "/admin";
  if (!candidate.startsWith("/admin")) return "/admin";
  if (candidate.startsWith("//")) return "/admin";
  return candidate;
}

/**
 * Signs an administrator in with a username *or* an email address.
 *
 * A username is resolved to its email through a narrowly-scoped SECURITY
 * DEFINER function before the password is checked by Supabase Auth — the
 * password itself never touches our code.
 */
export async function signInWithCredentials(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const { identifier, password, next } = parsed.data;

  const ip = await clientIp();
  const attempt = rateLimit(`login:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!attempt.allowed) {
    return {
      status: "error",
      message: "Too many sign-in attempts. Please wait a few minutes and try again.",
    };
  }

  // A deployment can have a database attached that is still empty — for example
  // when the credentials were provided before the migrations and seed were run.
  // There are then no administrators to authenticate against, so the bundled
  // content's administrator is accepted instead, with the documented demo
  // credentials. This stops applying the moment the database holds any listing.
  if (isSupabaseConfigured() && (await servesBundledContent())) {
    const matchesDemoAdmin =
      (identifier === PREVIEW_ADMIN.username ||
        identifier.toLowerCase() === PREVIEW_ADMIN.email.toLowerCase()) &&
      password === PREVIEW_ADMIN_PASSWORD;

    if (!matchesDemoAdmin) {
      return { status: "error", message: "Incorrect username or password." };
    }

    (await cookies()).set(PREVIEW_ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    revalidatePath("/admin");
    redirect(safeRedirectTarget(next));
  }

  const supabase = await createClient();

  let email = identifier;
  if (!identifier.includes("@")) {
    const { data: resolved, error: lookupError } = await supabase.rpc("email_for_username", {
      p_username: identifier,
    });
    if (lookupError || !resolved) {
      return { status: "error", message: "Incorrect username or password." };
    }
    email = String(resolved);
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.user) {
    return { status: "error", message: "Incorrect username or password." };
  }

  // Authentication alone is not authorization: the user must also have an
  // active administrator record, otherwise we immediately drop the session.
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("id", signInData.user.id)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (!admin || !admin.is_active) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message:
        "This account does not have administrator access. Contact the brokerage owner if that is unexpected.",
    };
  }

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", signInData.user.id);

  const target = safeRedirectTarget(next);
  revalidatePath("/admin");
  redirect(target);
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete(PREVIEW_ADMIN_COOKIE);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Sends a password-reset link. The response is identical whether or not the
 * address exists, so the form cannot be used to enumerate administrators.
 */
export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordResetRequestSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const ip = await clientIp();
  const attempt = rateLimit(`reset:${ip}`, { limit: 6, windowMs: 15 * 60 * 1000 });
  if (!attempt.allowed) {
    return { status: "error", message: "Too many requests. Please try again shortly." };
  }

  const supabase = await createClient();
  const redirectTo = `${getSiteUrl()}/auth/callback?next=/admin/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    console.error("[auth] password reset request failed", error.message);
  }

  return {
    status: "success",
    message:
      "If that email address belongs to an administrator, a reset link is on its way. Check your inbox and spam folder.",
  };
}

/**
 * Sets a new password for the signed-in user. Reached from a recovery link
 * (which establishes a short-lived session) or from Admin -> Settings.
 */
export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Your reset link has expired. Request a new one and try again.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", message: "Your password has been updated." };
}

/** Updates the signed-in administrator's own username and display name. */
export async function updateOwnProfile(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
    return {
      status: "error",
      fieldErrors: {
        username: "Use 3–32 characters: letters, numbers, dot, underscore or hyphen.",
      },
    };
  }
  if (fullName.length > 120) {
    return { status: "error", fieldErrors: { full_name: "Please keep this under 120 characters." } };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ username, full_name: fullName || null })
    .eq("id", session.admin.id);

  if (error) {
    if (error.code === "23505" || error.message.includes("duplicate key")) {
      return { status: "error", fieldErrors: { username: "That username is already taken." } };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/settings");
  return { status: "success", message: "Your profile has been updated." };
}

/** Updates the signed-in administrator's own email address (and login email). */
export async function updateOwnEmail(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    return { status: "error", fieldErrors: { email: "Enter a valid email address." } };
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.updateUser({ email });
  if (authError) {
    return { status: "error", message: authError.message };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ email })
    .eq("id", session.admin.id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/settings");
  return {
    status: "success",
    message:
      "Email updated. Supabase will send a confirmation link — the address only becomes live once it is confirmed.",
  };
}

/**
 * Invites an additional administrator. Restricted to owners and admins, and
 * performed with the service-role client because creating an auth user is an
 * administrative operation that must not be possible from a browser session.
 */
export async function inviteAdministrator(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const session = await requireAdmin();
  if (session.admin.role !== "owner" && session.admin.role !== "admin") {
    return { status: "error", message: "Only owners and admins can add administrators." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "admin");

  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    return { status: "error", fieldErrors: { email: "Enter a valid email address." } };
  }
  if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) {
    return {
      status: "error",
      fieldErrors: { username: "Use 3–32 characters: letters, numbers, dot, underscore or hyphen." },
    };
  }
  if (!["owner", "admin", "editor"].includes(role)) {
    return { status: "error", message: "Unknown role." };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { username, full_name: fullName },
  });

  if (createError || !created.user) {
    return { status: "error", message: createError?.message ?? "Could not create that account." };
  }

  const { error: profileError } = await admin.from("admin_users").insert({
    id: created.user.id,
    email,
    username,
    full_name: fullName || null,
    role,
  });

  if (profileError) {
    // Roll the auth user back so we never leave an orphaned account behind.
    await admin.auth.admin.deleteUser(created.user.id);
    if (profileError.code === "23505" || profileError.message.includes("duplicate key")) {
      return { status: "error", message: "That email or username is already in use." };
    }
    return { status: "error", message: profileError.message };
  }

  // Send them a link so they can choose their own password.
  await admin.auth.admin.generateLink({ type: "recovery", email });

  revalidatePath("/admin/settings");
  return {
    status: "success",
    message: `${email} now has ${role} access. Send them a password reset link from the sign-in page so they can set a password.`,
  };
}

export async function deactivateAdministrator(
  adminId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  if (session.admin.role !== "owner") {
    return { ok: false, error: "Only the owner can deactivate administrators." };
  }
  if (session.admin.id === adminId) {
    return { ok: false, error: "You cannot deactivate your own account." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: false })
    .eq("id", adminId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function currentAdminForDebug(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.admin.username ?? null;
}
