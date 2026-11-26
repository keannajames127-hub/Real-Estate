import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

import { FilterForm, type FilterValues } from "@/components/site/FilterForm";
import { PropertyCard } from "@/components/site/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageHeader, Pagination } from "@/components/ui/Layout";
import {
  LISTING_STATUS_LABELS,
  PAGE_SIZE,
  PROPERTY_SORT_LABELS,
  PROPERTY_SORT_OPTIONS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants";
import { searchProperties } from "@/lib/queries/properties";
import { getPublicSettings } from "@/lib/queries/settings";
import { buildQueryString, cn, formatNumber } from "@/lib/utils";
import type { ListingStatus, PropertySort, PropertyType, PropertyWithImages } from "@/types/database";

export const revalidate = 120;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = first(params.q);
  const city = first(params.city);

  const title = q
    ? `Properties matching “${q}”`
    : city
      ? `Properties in ${city}`
      : "The Collection";

  return {
    title,
    description:
      "Browse the full collection of luxury homes, estates and private residences represented by Danish Home Properties.",
    alternates: { canonical: `/properties${buildQueryString({ q, city })}` },
  };
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const ALLOWED_SORTS: PropertySort[] = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "beds_desc",
  "sqft_desc",
];

const ALLOWED_TYPES: PropertyType[] = [
  "house",
  "villa",
  "apartment",
  "penthouse",
  "townhouse",
  "estate",
  "land",
];

const ALLOWED_STATUSES: ListingStatus[] = ["for_sale", "for_rent", "pending", "sold"];

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const q = first(params.q).slice(0, 120);
  const city = first(params.city).slice(0, 80);
  const neighborhood = first(params.neighborhood).slice(0, 120);
  const zip = first(params.zip).slice(0, 12);
  const minPriceRaw = first(params.minPrice);
  const maxPriceRaw = first(params.maxPrice);
  const typeRaw = first(params.type);
  const statusRaw = first(params.status);
  const bedsRaw = first(params.beds);
  const bathsRaw = first(params.baths);
  const featured = first(params.featured) === "1";
  const sortRaw = first(params.sort);
  const view = first(params.view) === "list" ? "list" : "grid";
  const page = Math.max(1, Number.parseInt(first(params.page) || "1", 10) || 1);

  const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;
  const beds = bedsRaw ? Number(bedsRaw) : null;
  const baths = bathsRaw ? Number(bathsRaw) : null;

  const propertyType = ALLOWED_TYPES.includes(typeRaw as PropertyType)
    ? (typeRaw as PropertyType)
    : "";
  const listingStatus = ALLOWED_STATUSES.includes(statusRaw as ListingStatus)
    ? (statusRaw as ListingStatus)
    : "";
  const sort = ALLOWED_SORTS.includes(sortRaw as PropertySort)
    ? (sortRaw as PropertySort)
    : "newest";

  const settings = await getPublicSettings();

  let result = {
    properties: [] as PropertyWithImages[],
    total: 0,
    page,
    pageSize: PAGE_SIZE,
    pageCount: 1,
  };
  let loadError: string | null = null;

  try {
    result = await searchProperties({
      q,
      city,
      neighborhood,
      zip,
      propertyType,
      listingStatus,
      minPrice: Number.isFinite(minPrice) ? minPrice : null,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : null,
      beds: Number.isFinite(beds) ? beds : null,
      baths: Number.isFinite(baths) ? baths : null,
      featuredOnly: featured,
      sort,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "The collection could not be loaded just now.";
  }

  const filterValues: FilterValues = {
    q,
    minPrice: minPriceRaw,
    maxPrice: maxPriceRaw,
    type: propertyType,
    status: listingStatus,
    beds: bedsRaw,
    baths: bathsRaw,
  };

  const baseParams = {
    q,
    city,
    neighborhood,
    zip,
    minPrice: minPriceRaw,
    maxPrice: maxPriceRaw,
    type: propertyType,
    status: listingStatus,
    beds: bedsRaw,
    baths: bathsRaw,
    featured: featured ? "1" : "",
  };

  const sortHref = (value: PropertySort) =>
    `/properties${buildQueryString({ ...baseParams, sort: value, view })}`;
  const viewHref = (value: "grid" | "list") =>
    `/properties${buildQueryString({ ...baseParams, sort: sort === "newest" ? "" : sort, view: value })}`;
  const pageHref = (value: number) =>
    `/properties${buildQueryString({
      ...baseParams,
      sort: sort === "newest" ? "" : sort,
      view,
      page: value > 1 ? value : "",
    })}`;

  const activeChips: Array<{ label: string; href: string }> = [];
  if (q) activeChips.push({ label: `“${q}”`, href: `/properties${buildQueryString({ ...baseParams, q: "", sort, view })}` });
  if (propertyType)
    activeChips.push({
      label: PROPERTY_TYPE_LABELS[propertyType],
      href: `/properties${buildQueryString({ ...baseParams, type: "", sort, view })}`,
    });
  if (listingStatus)
    activeChips.push({
      label: LISTING_STATUS_LABELS[listingStatus],
      href: `/properties${buildQueryString({ ...baseParams, status: "", sort, view })}`,
    });
  if (featured)
    activeChips.push({
      label: "Featured only",
      href: `/properties${buildQueryString({ ...baseParams, featured: "", sort, view })}`,
    });
  if (minPriceRaw || maxPriceRaw)
    activeChips.push({
      label: `$${formatNumber(minPrice ?? 0)} – ${maxPriceRaw ? `$${formatNumber(maxPrice ?? 0)}` : "any"}`,
      href: `/properties${buildQueryString({ ...baseParams, minPrice: "", maxPrice: "", sort, view })}`,
    });
  if (bedsRaw)
    activeChips.push({
      label: `${bedsRaw}+ beds`,
      href: `/properties${buildQueryString({ ...baseParams, beds: "", sort, view })}`,
    });
  if (bathsRaw)
    activeChips.push({
      label: `${bathsRaw}+ baths`,
      href: `/properties${buildQueryString({ ...baseParams, baths: "", sort, view })}`,
    });

  return (
    <>
      <PageHeader
        eyebrow="The Collection"
        title={q ? `Properties matching “${q}”` : "Exceptional Properties"}
        description={
          settings.tagline ??
          "Every residence in our portfolio, searchable by location, price and configuration."
        }
      />

      <div className="mx-auto w-full max-w-[92rem] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[17rem_1fr] lg:gap-14">
          {/* ---------- Filters ---------- */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <details
              className="group border border-hairline bg-shell lg:border-0 lg:bg-transparent"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal lg:hidden">
                Filters & sorting
                <span className="text-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="border-t border-hairline px-5 py-6 lg:border-0 lg:px-0 lg:py-0">
                <FilterForm values={filterValues} view={view} sort={sort === "newest" ? "" : sort} />
              </div>
            </details>
          </aside>

          {/* ---------- Results ---------- */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-hairline pb-5">
              <p className="font-sans text-[0.85rem] text-stone">
                {loadError ? (
                  <span className="text-red-700">{loadError}</span>
                ) : (
                  <>
                    <span className="font-medium text-charcoal">{formatNumber(result.total)}</span>{" "}
                    {result.total === 1 ? "residence" : "residences"}
                    {result.total > 0 ? (
                      <>
                        {" "}
                        · showing {(result.page - 1) * result.pageSize + 1}–
                        {Math.min(result.page * result.pageSize, result.total)}
                      </>
                    ) : null}
                  </>
                )}
              </p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="eyebrow hidden text-[0.58rem] text-mist sm:block">Sort</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {PROPERTY_SORT_OPTIONS.slice(0, 4).map((option) => (
                      <Link
                        key={option.value}
                        href={sortHref(option.value)}
                        aria-current={sort === option.value ? "true" : undefined}
                        className={cn(
                          "font-sans text-[0.78rem] transition-colors",
                          sort === option.value
                            ? "text-charcoal underline decoration-gold underline-offset-4"
                            : "text-stone hover:text-charcoal",
                        )}
                      >
                        {PROPERTY_SORT_LABELS[option.value]}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center border border-hairline">
                  <Link
                    href={viewHref("grid")}
                    aria-label="Grid view"
                    aria-current={view === "grid" ? "true" : undefined}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center transition-colors",
                      view === "grid" ? "bg-charcoal text-white" : "text-stone hover:text-charcoal",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={viewHref("list")}
                    aria-label="List view"
                    aria-current={view === "list" ? "true" : undefined}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center transition-colors",
                      view === "list" ? "bg-charcoal text-white" : "text-stone hover:text-charcoal",
                    )}
                  >
                    <List className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>

            {activeChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 pt-5">
                {activeChips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="inline-flex items-center gap-2 border border-hairline bg-shell px-3 py-1.5 font-sans text-[0.75rem] text-stone transition-colors hover:border-charcoal hover:text-charcoal"
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </Link>
                ))}
              </div>
            ) : null}

            {result.properties.length === 0 ? (
              <div className="mt-12">
                <EmptyState
                  title={loadError ? "The collection is unavailable" : "No residences match those filters"}
                  description={
                    loadError
                      ? "Please refresh the page in a moment. If it persists, contact the office and we will help directly."
                      : "Try widening the price range or removing a filter — or let us know what you are looking for and we will search off-market on your behalf."
                  }
                  action={
                    loadError ? (
                      <ButtonLink href="/properties" variant="outline">
                        Reset the search
                      </ButtonLink>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <ButtonLink href="/properties" variant="outline">
                          Clear filters
                        </ButtonLink>
                        <ButtonLink href="/contact" variant="primary">
                          Send a brief
                        </ButtonLink>
                      </div>
                    )
                  }
                />
              </div>
            ) : view === "list" ? (
              <div className="mt-10 space-y-8">
                {result.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} variant="list" />
                ))}
              </div>
            ) : (
              <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                {result.properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} priority={index < 3} />
                ))}
              </div>
            )}

            <Pagination page={result.page} pageCount={result.pageCount} buildHref={pageHref} />
          </div>
        </div>
      </div>
    </>
  );
}
