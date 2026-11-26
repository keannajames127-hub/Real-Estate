"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { sendEnquiryNotification } from "@/lib/email";
import type { EnquiryFormState } from "@/lib/form-state";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { enquirySchema, enquiryUpdateSchema, fieldErrors, formDataToObject } from "@/lib/validation/schemas";
import type { EnquiryStatus } from "@/types/database";
import { getSiteUrl } from "@/lib/env";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    headerList.get("x-real-ip") ??
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

/**
 * Handles every public enquiry form on the site.
 *
 * Order of operations matters: the enquiry is written to Postgres *first* (via
 * the service-role client, because anonymous visitors have no write access to
 * that table), and only then is the notification email attempted. A mail outage
 * therefore costs a notification, never a lead — and the failure is recorded on
 * the row so it shows up in the dashboard.
 */
export async function submitEnquiry(
  _previous: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const parsed = enquirySchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const input = parsed.data;

  // Honeypot: hidden from real users, irresistible to bots.
  if (input.company_website) {
    return { status: "success", message: "Thank you.", reference: "—" };
  }

  const ip = await clientIp();
  const limit = rateLimit(`enquiry:${ip}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many enquiries from this connection. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s), or call us directly.`,
    };
  }

  const propertyId = input.property_id && UUID_PATTERN.test(input.property_id) ? input.property_id : null;

  try {
    const supabase = createAdminClient();

    // Resolve the listing title server-side so the snapshot can never be
    // spoofed by the client, and fall back gracefully if it was deleted.
    let propertyTitle = input.property_title_snapshot;
    let propertySlug: string | null = null;

    if (propertyId) {
      const { data: property } = await supabase
        .from("properties")
        .select("title, slug")
        .eq("id", propertyId)
        .maybeSingle<{ title: string; slug: string }>();
      if (property) {
        propertyTitle = property.title;
        propertySlug = property.slug;
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from("enquiries")
      .insert({
        property_id: propertyId,
        property_title_snapshot: propertyTitle ?? null,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone,
        enquiry_type: input.enquiry_type,
        preferred_contact_method: input.preferred_contact_method,
        message: input.message,
        source_page: input.source_page ?? null,
      })
      .select("id, reference")
      .single<{ id: string; reference: string }>();

    if (insertError || !inserted) {
      console.error("[enquiry] insert failed", insertError);
      return {
        status: "error",
        message:
          "We could not save your enquiry just now. Please try again, or email us directly and we will respond personally.",
      };
    }

    // Notification email — best effort, never fatal.
    const { data: settings } = await supabase
      .from("site_settings")
      .select("notification_email")
      .eq("id", 1)
      .maybeSingle<{ notification_email: string | null }>();

    const result = await sendEnquiryNotification({
      reference: inserted.reference,
      fullName: input.full_name,
      email: input.email,
      phone: input.phone,
      enquiryType: input.enquiry_type,
      preferredContactMethod: input.preferred_contact_method,
      message: input.message,
      propertyTitle: propertyTitle ?? null,
      propertyUrl: propertySlug ? `${getSiteUrl()}/properties/${propertySlug}` : null,
      sourcePage: input.source_page ?? null,
      submittedAt: new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/New_York",
      }).format(new Date()),
      notificationEmail: settings?.notification_email ?? null,
    });

    await supabase
      .from("enquiries")
      .update(
        result.sent
          ? { email_notified_at: new Date().toISOString(), email_error: null }
          : { email_error: result.error ?? "Notification not sent" },
      )
      .eq("id", inserted.id);

    if (!result.sent && !result.skipped) {
      console.error("[enquiry] notification email failed", result.error);
    }

    return {
      status: "success",
      reference: inserted.reference,
      message:
        "Thank you — your enquiry is with us. One of our advisors will be in touch within one business day.",
    };
  } catch (error) {
    console.error("[enquiry] unexpected failure", error);
    return {
      status: "error",
      message:
        "Something went wrong on our side. Please try again shortly, or call the office and we will help you directly.",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin: lead management
// ---------------------------------------------------------------------------

export async function updateEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const parsed = enquiryUpdateSchema.safeParse({ status });
  if (!parsed.success || !parsed.data.status) {
    return { ok: false, error: "Unknown status" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status: parsed.data.status })
    .eq("id", enquiryId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function addEnquiryNote(
  enquiryId: string,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();

  const parsed = enquiryUpdateSchema.safeParse({ note });
  if (!parsed.success || !parsed.data.note) {
    return { ok: false, error: "Write something first." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiry_notes").insert({
    enquiry_id: enquiryId,
    author_id: session.admin.id,
    author_name: session.admin.full_name ?? session.admin.username,
    note: parsed.data.note,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return { ok: true };
}

export async function deleteEnquiryNote(
  noteId: string,
  enquiryId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("enquiry_notes").delete().eq("id", noteId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return { ok: true };
}

export async function deleteEnquiry(enquiryId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", enquiryId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true };
}
