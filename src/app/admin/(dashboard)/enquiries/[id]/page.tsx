import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

import {
  DeleteEnquiryButton,
  DeleteNoteButton,
  EnquiryNoteComposer,
  EnquiryStatusControl,
} from "@/components/admin/EnquiryControls";
import { requireAdmin } from "@/lib/auth";
import {
  CONTACT_METHOD_LABELS,
  ENQUIRY_STATUS_BADGE_STYLES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPE_LABELS,
} from "@/lib/constants";
import { getEnquiryById, getEnquiryNotes } from "@/lib/queries/enquiries";
import { cn, formatDateTime, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getEnquiryById(id).catch(() => null);
  return { title: enquiry ? `Enquiry · ${enquiry.full_name}` : "Enquiry" };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-hairline py-3.5 last:border-b-0">
      <p className="eyebrow text-[0.5rem] text-mist">{label}</p>
      <div className="mt-2 font-sans text-[0.9rem] text-charcoal">{children}</div>
    </div>
  );
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("/admin/enquiries");
  const { id } = await params;

  const enquiry = await getEnquiryById(id);
  if (!enquiry) notFound();

  const notes = await getEnquiryNotes(enquiry.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            All enquiries
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
              {enquiry.full_name}
            </h1>
            <span
              className={cn(
                "px-2.5 py-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em]",
                ENQUIRY_STATUS_BADGE_STYLES[enquiry.status],
              )}
            >
              {ENQUIRY_STATUS_LABELS[enquiry.status]}
            </span>
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[0.84rem] text-stone">
            <span className="font-mono text-[0.78rem]">{enquiry.reference}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              {formatDateTime(enquiry.created_at)} · {formatRelative(enquiry.created_at)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${enquiry.email}?subject=Re: your enquiry ${enquiry.reference}`}
            className="inline-flex items-center gap-2 bg-charcoal px-5 py-3 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.6} />
            Reply by email
          </a>
          {enquiry.phone ? (
            <a
              href={`tel:${enquiry.phone}`}
              className="inline-flex items-center gap-2 border border-charcoal/25 px-5 py-3 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.6} />
              Call
            </a>
          ) : null}
        </div>
      </header>

      {enquiry.email_error ? (
        <div className="border border-amber-200 bg-amber-50 px-5 py-4 font-sans text-[0.84rem] text-amber-900">
          <p className="font-medium">The notification email did not send.</p>
          <p className="mt-1">
            The enquiry itself was saved safely — only the automatic email failed. Details:{" "}
            <span className="font-mono text-[0.78rem]">{enquiry.email_error}</span>
          </p>
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {/* The enquiry itself */}
          <section className="border border-hairline bg-paper">
            <div className="border-b border-hairline px-6 py-5">
              <h2 className="font-display text-[1.2rem] text-charcoal">The enquiry</h2>
            </div>
            <div className="px-6 py-6">
              <p className="eyebrow flex items-center gap-2 text-[0.5rem] text-mist">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.6} />
                Message
              </p>
              <p className="mt-3 whitespace-pre-line font-sans text-[0.94rem] leading-relaxed text-charcoal">
                {enquiry.message ?? "No message was included."}
              </p>
            </div>
          </section>

          {/* Notes */}
          <section className="border border-hairline bg-paper">
            <div className="border-b border-hairline px-6 py-5">
              <h2 className="font-display text-[1.2rem] text-charcoal">Private notes</h2>
              <p className="mt-1.5 font-sans text-[0.82rem] text-stone">
                Visible only to administrators. Use these to track calls, viewings and next steps.
              </p>
            </div>

            <div className="space-y-6 px-6 py-6">
              <EnquiryNoteComposer enquiryId={enquiry.id} />

              {notes.length === 0 ? (
                <p className="font-sans text-[0.84rem] text-mist">
                  No notes yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li key={note.id} className="border border-hairline bg-shell px-4 py-3.5">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-sans text-[0.72rem] uppercase tracking-[0.14em] text-mist">
                          {note.author_name ?? "Administrator"} · {formatDateTime(note.created_at)}
                        </p>
                        <DeleteNoteButton noteId={note.id} enquiryId={enquiry.id} />
                      </div>
                      <p className="mt-2 whitespace-pre-line font-sans text-[0.88rem] leading-relaxed text-charcoal">
                        {note.note}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <DeleteEnquiryButton enquiryId={enquiry.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="border border-hairline bg-paper">
            <div className="border-b border-hairline px-6 py-5">
              <h2 className="font-display text-[1.2rem] text-charcoal">Prospect</h2>
            </div>
            <div className="px-6 py-3">
              <Fact label="Full name">{enquiry.full_name}</Fact>
              <Fact label="Email">
                <a href={`mailto:${enquiry.email}`} className="link-underline">
                  {enquiry.email}
                </a>
              </Fact>
              <Fact label="Phone">
                {enquiry.phone ? (
                  <a href={`tel:${enquiry.phone}`} className="link-underline">
                    {enquiry.phone}
                  </a>
                ) : (
                  <span className="text-mist">Not provided</span>
                )}
              </Fact>
              <Fact label="Preferred contact method">
                {CONTACT_METHOD_LABELS[enquiry.preferred_contact_method]}
              </Fact>
              <Fact label="Enquiry type">{ENQUIRY_TYPE_LABELS[enquiry.enquiry_type]}</Fact>
              <Fact label="Property of interest">
                {enquiry.property ? (
                  <Link
                    href={`/properties/${enquiry.property.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 hover:text-gold-deep"
                  >
                    {enquiry.property.title}
                    <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
                  </Link>
                ) : enquiry.property_title_snapshot ? (
                  enquiry.property_title_snapshot
                ) : (
                  <span className="text-mist">General enquiry — no particular listing</span>
                )}
              </Fact>
              <Fact label="Submitted">
                {formatDateTime(enquiry.created_at)}
                <span className="mt-1 block font-sans text-[0.8rem] text-mist">
                  {formatRelative(enquiry.created_at)}
                </span>
              </Fact>
              {enquiry.source_page ? (
                <Fact label="Source page">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.78rem]">
                    <MapPin className="h-3.5 w-3.5 text-mist" strokeWidth={1.6} />
                    {enquiry.source_page}
                  </span>
                </Fact>
              ) : null}
              <Fact label="Notification email">
                {enquiry.email_notified_at ? (
                  <span className="text-emerald-700">
                    Sent {formatDateTime(enquiry.email_notified_at)}
                  </span>
                ) : (
                  <span className="text-amber-700">Not sent</span>
                )}
              </Fact>
            </div>
          </section>

          <section className="border border-hairline bg-paper">
            <div className="border-b border-hairline px-6 py-5">
              <h2 className="font-display text-[1.2rem] text-charcoal">Lead status</h2>
              <p className="mt-1.5 font-sans text-[0.82rem] text-stone">
                Move the lead through your pipeline as you follow up.
              </p>
            </div>
            <div className="px-6 py-6">
              <EnquiryStatusControl enquiryId={enquiry.id} status={enquiry.status} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
