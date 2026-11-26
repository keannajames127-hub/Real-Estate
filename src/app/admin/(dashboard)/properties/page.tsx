import Link from "next/link";
import { Building, ImagePlus, Plus, Search, SlidersHorizontal } from "lucide-react";

import { PropertyRowActions } from "@/components/admin/PropertyRowActions";
import { Media } from "@/components/site/Media";
import { StatusPill } from "@/components/ui/Indicators";
import { EmptyState, Pagination } from "@/components/ui/Layout";
import { requireAdmin } from "@/lib/auth";
import {
  ADMIN_PAGE_SIZE,
  LISTING_STATUS_OPTIONS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/constants";
import { listAdminProperties } from "@/lib/queries/admin-properties";
import { buildQueryString, coverImage, formatDateTime, formatPrice, shortAddress } from "@/lib/utils";
import type { ListingStatus, PropertyType, PropertyWithImages } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata = { title: "Properties" };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Cover thumbnail for a listing row — the same image the public card shows. */
function PropertyThumb({ property }: { property: PropertyWithImages }) {
  const src = coverImage(property);

  return (
    <span className="relative block h-14 w-20 shrink-0 overflow-hidden border border-hairline bg-bone">
      {src ? (
        <Media src={src} alt={`${property.title} — cover photograph`} sizes="80px" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-mist">
          <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
        </span>
      )}
    </span>
  );
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin("/admin/properties");
  const params = await searchParams;

  const q = first(params.q).slice(0, 80);
  const status = first(params.status) as ListingStatus | "";
  const type = first(params.type) as PropertyType | "";
  const published = (first(params.published) || "all") as "all" | "published" | "draft";
  const page = Math.max(1, Number(first(params.page)) || 1);

  const result = await listAdminProperties({
    q,
    status: LISTING_STATUS_OPTIONS.some((option) => option.value === status) ? status : "",
    type: PROPERTY_TYPE_OPTIONS.some((option) => option.value === type) ? type : "",
    published,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  const baseQuery = { q, status, type, published: published === "all" ? "" : published };
  const buildHref = (target: number) =>
    `/admin/properties${buildQueryString({ ...baseQuery, page: target > 1 ? target : "" })}`;

  const hasFilters = Boolean(q || status || type || published !== "all");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold">Portfolio</p>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
            Properties
          </h1>
          <p className="mt-3 font-sans text-[0.9rem] text-stone">
            {result.total === 0
              ? "No listings match this view."
              : `${result.total} listing${result.total === 1 ? "" : "s"} — edits publish to the public site immediately.`}
          </p>
          <p className="mt-2 font-sans text-[0.8rem] text-mist">
            Photographs are added inside each listing — open one and use &ldquo;Add / manage photos&rdquo;.
          </p>
        </div>

        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          Add a property
        </Link>
      </header>

      {/* Filters — a plain GET form so it works without JavaScript */}
      <form
        method="get"
        action="/admin/properties"
        className="grid gap-3 border border-hairline bg-paper p-5 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search listings</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
            strokeWidth={1.5}
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Title, street, city or ZIP"
            className="w-full border border-hairline bg-white py-2.5 pl-10 pr-4 font-sans text-[0.86rem] text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="sr-only">Listing status</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full border border-hairline bg-white px-3 py-2.5 font-sans text-[0.86rem] text-charcoal focus:border-gold focus:outline-none"
          >
            <option value="">Any status</option>
            {LISTING_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Property type</span>
          <select
            name="type"
            defaultValue={type}
            className="w-full border border-hairline bg-white px-3 py-2.5 font-sans text-[0.86rem] text-charcoal focus:border-gold focus:outline-none"
          >
            <option value="">Any type</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Visibility</span>
          <select
            name="published"
            defaultValue={published}
            className="w-full border border-hairline bg-white px-3 py-2.5 font-sans text-[0.86rem] text-charcoal focus:border-gold focus:outline-none"
          >
            <option value="all">Published &amp; draft</option>
            <option value="published">Published only</option>
            <option value="draft">Drafts only</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
            Filter
          </button>
          {hasFilters ? (
            <Link
              href="/admin/properties"
              className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {result.properties.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nothing matches those filters" : "No listings yet"}
          description={
            hasFilters
              ? "Try widening the search, or clear the filters to see every listing."
              : "Add your first property and it will appear here and on the public site."
          }
          action={
            hasFilters ? (
              <Link
                href="/admin/properties"
                className="inline-flex items-center gap-2 border border-charcoal/25 px-6 py-3 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal"
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center gap-2 bg-charcoal px-6 py-3 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                Add a property
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden border border-hairline bg-paper lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-shell">
                  <th className="eyebrow px-5 py-4 text-[0.55rem] text-stone">Listing</th>
                  <th className="eyebrow px-5 py-4 text-[0.55rem] text-stone">Type</th>
                  <th className="eyebrow px-5 py-4 text-[0.55rem] text-stone">Price</th>
                  <th className="eyebrow px-5 py-4 text-[0.55rem] text-stone">Status</th>
                  <th className="eyebrow px-5 py-4 text-right text-[0.55rem] text-stone">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {result.properties.map((property) => (
                  <tr key={property.id} className="align-top transition-colors hover:bg-shell">
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <PropertyThumb property={property} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="font-sans text-[0.92rem] text-charcoal hover:text-gold-deep"
                          >
                            {property.title}
                          </Link>
                          <p className="mt-1 font-sans text-[0.76rem] text-mist">
                            {shortAddress(property)} · updated {formatDateTime(property.updated_at)}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 font-sans text-[0.72rem] text-mist">
                            {property.is_published ? (
                              <span className="text-emerald-700">Published</span>
                            ) : (
                              <span className="text-amber-700">Draft</span>
                            )}
                            {property.is_featured ? <span className="text-gold-deep">Featured</span> : null}
                            {property.bedrooms} bd · {property.bathrooms} ba
                          </p>
                          <Link
                            href={`/admin/properties/${property.id}/edit#photography`}
                            className="mt-2 inline-flex items-center gap-1.5 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-gold-deep underline underline-offset-4 transition-colors hover:text-charcoal"
                          >
                            <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.6} />
                            Add / manage photos
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-sans text-[0.82rem] text-stone">
                      {PROPERTY_TYPE_LABELS[property.property_type]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-sans text-[0.86rem] text-charcoal">
                      {formatPrice(property.price, property.price_period)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={property.listing_status} />
                    </td>
                    <td className="px-5 py-4">
                      <PropertyRowActions
                        id={property.id}
                        isPublished={property.is_published}
                        isFeatured={property.is_featured}
                        listingStatus={property.listing_status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-4 lg:hidden">
            {result.properties.map((property) => (
              <li key={property.id} className="border border-hairline bg-paper p-5">
                <div className="flex gap-4">
                  <PropertyThumb property={property} />
                  <div className="min-w-0">
                    <Link
                      href={`/admin/properties/${property.id}/edit`}
                      className="font-display text-[1.15rem] text-charcoal"
                    >
                      {property.title}
                    </Link>
                    <p className="mt-1.5 font-sans text-[0.8rem] text-mist">
                      {shortAddress(property)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={property.listing_status} />
                  {property.is_published ? (
                    <span className="font-sans text-[0.68rem] uppercase tracking-[0.14em] text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="font-sans text-[0.68rem] uppercase tracking-[0.14em] text-amber-700">
                      Draft
                    </span>
                  )}
                  {property.is_featured ? (
                    <span className="font-sans text-[0.68rem] uppercase tracking-[0.14em] text-gold-deep">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 font-sans text-[0.9rem] text-charcoal">
                  {formatPrice(property.price, property.price_period)}
                </p>
                <Link
                  href={`/admin/properties/${property.id}/edit#photography`}
                  className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-gold-deep underline underline-offset-4 transition-colors hover:text-charcoal"
                >
                  <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.6} />
                  Add / manage photos
                </Link>
                <div className="mt-4 border-t border-hairline pt-4">
                  <PropertyRowActions
                    id={property.id}
                    isPublished={property.is_published}
                    isFeatured={property.is_featured}
                    listingStatus={property.listing_status}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Pagination page={result.page} pageCount={result.pageCount} buildHref={buildHref} />
        </>
      )}

      <p className="flex items-center gap-2 font-sans text-[0.78rem] text-mist">
        <Building className="h-3.5 w-3.5" strokeWidth={1.6} />
        Listing changes revalidate the homepage, listings page and any saved slug automatically.
      </p>
    </div>
  );
}
