import "server-only";

import { Resend } from "resend";

import {
  getFallbackNotificationEmail,
  getResendApiKey,
  getResendFromEmail,
  getSiteUrl,
} from "@/lib/env";
import {
  CONTACT_METHOD_LABELS,
  ENQUIRY_TYPE_LABELS,
  SITE_NAME,
} from "@/lib/constants";

export interface EnquiryNotification {
  reference: string;
  fullName: string;
  email: string;
  phone: string | null;
  enquiryType: keyof typeof ENQUIRY_TYPE_LABELS;
  preferredContactMethod: keyof typeof CONTACT_METHOD_LABELS;
  message: string | null;
  propertyTitle: string | null;
  propertyUrl: string | null;
  sourcePage: string | null;
  submittedAt: string;
  notificationEmail: string | null;
}

export interface EmailResult {
  /** true when Resend accepted the message. */
  sent: boolean;
  /** true when no API key is configured — the enquiry is still saved. */
  skipped: boolean;
  error?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string | null | undefined, options: { link?: boolean } = {}) {
  if (!value) return "";
  const safe = escapeHtml(value);
  const content = options.link
    ? `<a href="${escapeHtml(value)}" style="color:#9a7b3f;text-decoration:none;">${safe}</a>`
    : safe;
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eeece7;color:#6b6b66;font-size:12px;letter-spacing:.08em;text-transform:uppercase;width:180px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eeece7;color:#141414;font-size:15px;vertical-align:top;">${content}</td>
    </tr>`;
}

function buildHtml(payload: EnquiryNotification): string {
  const propertyLine = payload.propertyTitle
    ? payload.propertyUrl
      ? `${escapeHtml(payload.propertyTitle)} — <a href="${escapeHtml(payload.propertyUrl)}" style="color:#9a7b3f;">view listing</a>`
      : escapeHtml(payload.propertyTitle)
    : "Not linked to a specific listing";

  const adminUrl = `${getSiteUrl()}/admin/enquiries`;

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f2ee;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e6e2da;">
            <tr>
              <td style="padding:36px 40px 20px 40px;">
                <div style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#9a7b3f;font-family:Helvetica,Arial,sans-serif;">
                  ${escapeHtml(SITE_NAME)}
                </div>
                <h1 style="margin:16px 0 0 0;font-size:26px;font-weight:400;color:#141414;line-height:1.25;">
                  New ${escapeHtml(ENQUIRY_TYPE_LABELS[payload.enquiryType].toLowerCase())}
                </h1>
                <p style="margin:10px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6b6b66;">
                  Reference ${escapeHtml(payload.reference)} &middot; ${escapeHtml(payload.submittedAt)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 8px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;">
                  ${row("Name", payload.fullName)}
                  ${row("Email", payload.email, { link: true })}
                  ${row("Phone", payload.phone)}
                  ${row("Preferred contact", CONTACT_METHOD_LABELS[payload.preferredContactMethod])}
                  ${row("Listing", payload.propertyTitle ? payload.propertyTitle : null)}
                  ${row("Page", payload.sourcePage)}
                </table>
                <div style="margin-top:24px;padding:20px;background:#faf9f6;border-left:3px solid #9a7b3f;">
                  <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b6b66;margin-bottom:8px;">Message</div>
                  <div style="font-size:16px;line-height:1.6;color:#141414;white-space:pre-wrap;">${escapeHtml(payload.message ?? "—")}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 40px 40px;font-family:Helvetica,Arial,sans-serif;">
                <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:.12em;text-transform:uppercase;padding:14px 26px;">
                  Open in dashboard
                </a>
                <p style="margin:18px 0 0 0;font-size:12px;color:#8d8d87;line-height:1.6;">
                  Sent automatically when the enquiry form on ${escapeHtml(SITE_NAME)} was submitted.
                  Reply directly to this email to reach the prospect.
                </p>
              </td>
            </tr>
          </table>
          <div style="max-width:640px;margin-top:16px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9a9a94;text-align:left;">
            ${propertyLine}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(payload: EnquiryNotification): string {
  return [
    `${SITE_NAME} — new ${ENQUIRY_TYPE_LABELS[payload.enquiryType].toLowerCase()}`,
    `Reference: ${payload.reference}`,
    `Submitted: ${payload.submittedAt}`,
    "",
    `Name:    ${payload.fullName}`,
    `Email:   ${payload.email}`,
    `Phone:   ${payload.phone ?? "—"}`,
    `Prefers: ${CONTACT_METHOD_LABELS[payload.preferredContactMethod]}`,
    `Listing: ${payload.propertyTitle ?? "—"}`,
    `Page:    ${payload.sourcePage ?? "—"}`,
    "",
    "Message:",
    payload.message ?? "—",
    "",
    `Open the dashboard: ${getSiteUrl()}/admin/enquiries`,
  ].join("\n");
}

/**
 * Sends the "new enquiry" notification.
 *
 * Never throws: a failing mail provider must not cost us a lead. The enquiry is
 * already committed to the database before this is called, and any failure is
 * recorded on the enquiry row so the dashboard can surface it.
 */
export async function sendEnquiryNotification(
  payload: EnquiryNotification,
): Promise<EmailResult> {
  const apiKey = getResendApiKey();
  const recipient = payload.notificationEmail ?? getFallbackNotificationEmail();

  if (!apiKey) {
    return { sent: false, skipped: true, error: "RESEND_API_KEY is not configured" };
  }
  if (!recipient) {
    return {
      sent: false,
      skipped: true,
      error: "No notification email configured (set it in Admin → Settings)",
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [recipient],
      replyTo: payload.email,
      subject: `${payload.fullName} — ${ENQUIRY_TYPE_LABELS[payload.enquiryType]}${payload.propertyTitle ? ` · ${payload.propertyTitle}` : ""}`,
      html: buildHtml(payload),
      text: buildText(payload),
    });

    if (error) {
      return { sent: false, skipped: false, error: error.message };
    }
    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
