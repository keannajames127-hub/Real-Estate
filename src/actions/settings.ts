"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import type { CrudFormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";
import {
  agentSchema,
  checkbox,
  fieldErrors,
  formDataToObject,
  settingsSchema,
  uuidSchema,
} from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Agents / advisors
// ---------------------------------------------------------------------------

function parseList(raw: unknown): string[] {
  const source = typeof raw === "string" ? raw : "";
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of source.split(",")) {
    const value = part.trim().replace(/\s+/g, " ");
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value.slice(0, 60));
  }
  return result.slice(0, 20);
}

export async function saveAgent(
  _previous: CrudFormState,
  formData: FormData,
): Promise<CrudFormState> {
  await requireAdmin();

  const rawId = formData.get("id");
  const isUpdate = typeof rawId === "string" && rawId.length > 0;

  const parsed = agentSchema.safeParse({
    ...formDataToObject(formData),
    specialties: parseList(formData.get("specialties")),
    is_active: checkbox(formData.get("is_active")),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  if (isUpdate) {
    const idCheck = uuidSchema.safeParse(rawId);
    if (!idCheck.success) return { status: "error", message: "Invalid advisor id." };

    const { error } = await supabase.from("agents").update(parsed.data).eq("id", idCheck.data);
    if (error) return { status: "error", message: error.message };
  } else {
    const { error } = await supabase.from("agents").insert(parsed.data);
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/team");
  revalidatePath("/");
  revalidatePath("/about");

  if (!isUpdate) redirect("/admin/settings?saved=1#team");
  return { status: "success", message: "Advisor saved." };
}

export async function deleteAgent(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/team");
  revalidatePath("/");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Website settings
// ---------------------------------------------------------------------------

export async function saveSettings(
  _previous: CrudFormState,
  formData: FormData,
): Promise<CrudFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const {
    instagram,
    facebook,
    linkedin,
    youtube,
    ...rest
  } = parsed.data;

  const socialLinks: Record<string, string> = {};
  if (instagram) socialLinks.instagram = instagram;
  if (facebook) socialLinks.facebook = facebook;
  if (linkedin) socialLinks.linkedin = linkedin;
  if (youtube) socialLinks.youtube = youtube;

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ ...rest, social_links: socialLinks })
    .eq("id", 1);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { status: "success", message: "Website settings saved." };
}
