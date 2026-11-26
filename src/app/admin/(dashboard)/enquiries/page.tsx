import Link from "next/link";
import { Clock, Download, Mail, Phone, Search, SlidersHorizontal } from "lucide-react";

import { EmptyState, Pagination } from "@/components/ui/Layout";
import { requireAdmin } from "@/lib/auth";
import {
  CONTACT_METHOD_LABELS,
  ENQUIRY_STATUS_BADGE_STYLES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_OPTIONS,
  ENQUIRY_TYPE_LABELS,
  ENQUIRY_TYPE_OPTIONS,
} from "@/lib/constants";
import { searchEnquiries } from "@/lib/queries/enquiries";
import { buildQueryString, cn, formatDateTime, formatRelative } from "@/lib/utils";
import type { EnquiryStatus, EnquiryType } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Enquiries" };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const PAGE_SIZE = 20;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin("/admin/enquiries");
  const params = await searchParams;

  const q = first(params.q).slice(0, 80);
  const status = first(params.status) as EnquiryStatus | "";
  const type = first(params.type) as EnquiryType | "";
  const from = first(params.from);
  const to = first(params.to);
  const page = Math.max(1, Number(first(params.page)) || 1);

  const result = await searchEnquiries({
    q,
    status: ENQUIRY_STATUS_OPTIONS.some((option) => option.value === status) ? status : "",
    type: ENQUIRY_TYPE_OPTIONS.some((option) => option.value === type) ? type : "",
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const filters = { q, status, type, from, to };
  const buildHref = (target: number) =>
    `/admin/enquiries${buildQueryString({ ...filters, page: target > 1 ? target : "" })}`;
  const exportHref = `/api/enquiries/export${buildQueryString(filters)}`;

  const hasFilters = Boolean(q || status || type || from || to);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold">Leads</p>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
            Enquiries
          </h1>
          <p className="mt-3 font-sans text-[0.9rem] text-stone">
            {result.total === 0
              ? "No enquiries match this view."
              : `${result.total} enquir${result.total === 1 ? "y" : "ies"}${result.newCount > 0 ? ` · ${result.newCount} not yet contacted` : ""}`}
          </p>
        </div>

        <a
          href={exportHref}
          className="inline-flex items-center gap-2 border border-charcoal/25 px-6 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-white"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
          Export CSV
        </a>
      </header>

      <form
        method="get"
        action="/admin/enquiries"
        className="grid gap-3 border border-hairline bg-paper p-5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search enquiries</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
            strokeWidth={1.5}
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email, phone or property"
            className="w-full border border-hairline bg-white py-2.5 pl-10 pr-4 font-sans text-[0.86rem] text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="sr-only">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full border border-hairline bg-white px-3 py-2.5 font-sans text-[0.86rem] text-charcoal focus:border-gold focus:outline-none"
          >
            <option value="">Any status</option>
            {ENQUIRY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Enquiry type</span>
          <select
            name="type"
            defaultValue={type}
            className="w-full border border-hairline bg-white px-3 py-2.5 font-sans text-[0.86rem] text-charcoal focus:border-gold focus:outline-none"
          >
            <option value="">Any type</option>
            {ENQUIRY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="eyebrow mb-1.5 block text-[0.5rem] text-mist">From</span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="w-full border border-hairline bg-white px-3 py-2 font-sans text-[0.84rem] text-charcoal focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow mb-1.5 block text-[0.5rem] text-mist">To</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="w-full border border-hairline bg-white px-3 py-2 font-sans text-[0.84rem] text-charcoal focus:border-gold focus:outline-none"
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
            Filter
          </button>
          {hasFilters ? (
            <Link
              href="/admin/enquiries"
              className="pb-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {result.enquiries.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nothing matches those filters" : "No enquiries yet"}
          description={
            hasFilters
              ? "Try widening the date range or clearing the filters."
              : "Every enquiry submitted on the public site lands here automatically, along with an email notification."
          }
          action={
            hasFilters ? (
              <Link
                href="/admin/enquiries"
                className="inline-flex items-center gap-2 border border-charcoal/25 px-6 py-3 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal"
              >
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {result.enquiries.map((enquiry) => {
              const isNew = enquiry.status === "new";
              return (
                <li key={enquiry.id}>
                  <article
                    className={cn(
                      "border bg-paper px-5 py-5 transition-colors hover:border-charcoal/30",
                      isNew ? "border-l-4 border-l-gold border-hairline" : "border-hairline",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/admin/enquiries/${enquiry.id}`}
                            className="font-display text-[1.2rem] leading-tight text-charcoal hover:text-gold-deep"
                          >
                            {enquiry.full_name}
                          </Link>
                          {isNew ? (
                            <span className="bg-gold px-2 py-1 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white">
                              New
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-sans text-[0.82rem] text-stone">
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <a href={`mailto:${enquiry.email}`} className="hover:text-charcoal">
                              {enquiry.email}
                            </a>
                          </span>
                          {enquiry.phone ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                              <a href={`tel:${enquiry.phone}`} className="hover:text-charcoal">
                                {enquiry.phone}
                              </a>
                            </span>
                          ) : null}
                          <span className="text-mist">
                            Prefers{" "}
                            {CONTACT_METHOD_LABELS[enquiry.preferred_contact_method].toLowerCase()}
                          </span>
                        </p>

                        <p className="mt-2 font-sans text-[0.82rem] text-stone">
                          {ENQUIRY_TYPE_LABELS[enquiry.enquiry_type]}
                          {enquiry.property
                            ? ` · ${enquiry.property.title}`
                            : enquiry.property_title_snapshot
                              ? ` · ${enquiry.property_title_snapshot}`
                              : ""}
                        </p>

                        {enquiry.message ? (
                          <p className="mt-3 line-clamp-2 max-w-3xl font-sans text-[0.84rem] leading-relaxed text-stone">
                            {enquiry.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em]",
                            ENQUIRY_STATUS_BADGE_STYLES[enquiry.status],
                          )}
                        >
                          {ENQUIRY_STATUS_LABELS[enquiry.status]}
                        </span>
                        <p className="mt-2 font-sans text-[0.74rem] text-mist">
                          {formatRelative(enquiry.created_at)}
                        </p>
                        <p className="mt-0.5 font-sans text-[0.7rem] text-mist">
                          {formatDateTime(enquiry.created_at)}
                        </p>
                        <p className="mt-1 font-mono text-[0.68rem] text-mist">
                          {enquiry.reference}
                        </p>
                        <Link
                          href={`/admin/enquiries/${enquiry.id}`}
                          className="mt-3 inline-block font-sans text-[0.68rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal"
                        >
                          Open
                        </Link>
                      </div>
                    </div>

                    {enquiry.email_error ? (
                      <p className="mt-3 inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-3 py-1.5 font-sans text-[0.74rem] text-amber-900">
                        <Clock className="h-3 w-3" strokeWidth={1.6} />
                        Notification email failed — the lead itself is safe.
                      </p>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>

          <Pagination page={result.page} pageCount={result.pageCount} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}
