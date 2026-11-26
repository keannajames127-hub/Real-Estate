import type { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/auth";
import {
  CONTACT_METHOD_LABELS,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPE_LABELS,
  ENQUIRY_STATUS_OPTIONS,
  ENQUIRY_TYPE_OPTIONS,
} from "@/lib/constants";
import { getEnquiriesForExport } from "@/lib/queries/enquiries";
import type { EnquiryStatus, EnquiryType } from "@/types/database";

export const dynamic = "force-dynamic";

/** Quotes a CSV cell and neutralises newlines so one lead stays on one row. */
function cell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

const COLUMNS = [
  "Reference",
  "Submitted",
  "Full name",
  "Email",
  "Phone",
  "Enquiry type",
  "Property of interest",
  "Preferred contact method",
  "Status",
  "Message",
  "Notification email sent at",
  "Notification error",
  "Source page",
];

/**
 * CSV export for the leads workspace.
 *
 * Re-checks the administrator session itself rather than trusting that the
 * middleware ran — a route handler is a public HTTP endpoint, so it must be
 * authorized on its own. RLS provides a second layer: a non-admin session
 * would simply read zero rows.
 */
export async function GET(request: NextRequest) {
  // A Supabase outage must read as "not signed in", never as a partial export.
  const session = await getAdminSession().catch(() => null);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status") ?? "";
  const type = params.get("type") ?? "";

  let enquiries;
  try {
    enquiries = await getEnquiriesForExport({
      q: params.get("q") ?? undefined,
      status: ENQUIRY_STATUS_OPTIONS.some((option) => option.value === status)
        ? (status as EnquiryStatus)
        : "",
      type: ENQUIRY_TYPE_OPTIONS.some((option) => option.value === type)
        ? (type as EnquiryType)
        : "",
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    });
  } catch (error) {
    console.error("[export] enquiry export failed", error);
    return new Response("Could not build the export.", { status: 500 });
  }

  const rows = enquiries.map((enquiry) =>
    [
      enquiry.reference,
      new Date(enquiry.created_at).toISOString(),
      enquiry.full_name,
      enquiry.email,
      enquiry.phone ?? "",
      ENQUIRY_TYPE_LABELS[enquiry.enquiry_type],
      enquiry.property?.title ?? enquiry.property_title_snapshot ?? "",
      CONTACT_METHOD_LABELS[enquiry.preferred_contact_method],
      ENQUIRY_STATUS_LABELS[enquiry.status],
      enquiry.message ?? "",
      enquiry.email_notified_at ?? "",
      enquiry.email_error ?? "",
      enquiry.source_page ?? "",
    ]
      .map(cell)
      .join(","),
  );

  // The BOM makes Excel read the file as UTF-8 rather than guessing.
  const csv = `\uFEFF${[COLUMNS.map(cell).join(","), ...rows].join("\r\n")}\r\n`;
  const filename = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
