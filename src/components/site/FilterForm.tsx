"use client";

import { useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  LISTING_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/constants";

export interface FilterValues {
  q: string;
  minPrice: string;
  maxPrice: string;
  type: string;
  status: string;
  beds: string;
  baths: string;
}

const CONTROL =
  "w-full border border-hairline bg-white px-3.5 py-2.5 font-sans text-[0.85rem] text-charcoal " +
  "outline-none transition-colors focus:border-gold";

/**
 * A plain GET form, progressively enhanced: changing any select re-submits so
 * results update immediately, while the explicit Apply button keeps the form
 * fully usable without JavaScript.
 */
export function FilterForm({
  values,
  view,
  sort,
}: {
  values: FilterValues;
  view: "grid" | "list";
  sort: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} method="get" action="/properties" className="space-y-6">
      {/* Preserve the presentation preferences across a filter change. */}
      <input type="hidden" name="view" value={view} />
      {sort && sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}

      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <p className="eyebrow flex items-center gap-2 text-charcoal">
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          Refine
        </p>
      </div>

      <div>
        <label htmlFor="filter-q" className="eyebrow mb-2 block text-[0.58rem] text-stone">
          Location
        </label>
        <input
          id="filter-q"
          name="q"
          defaultValue={values.q}
          placeholder="City, neighborhood, address or ZIP"
          className={CONTROL}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="filter-min" className="eyebrow mb-2 block text-[0.58rem] text-stone">
            Min price
          </label>
          <input
            id="filter-min"
            name="minPrice"
            type="number"
            min={0}
            step={50000}
            defaultValue={values.minPrice}
            placeholder="0"
            className={CONTROL}
          />
        </div>
        <div>
          <label htmlFor="filter-max" className="eyebrow mb-2 block text-[0.58rem] text-stone">
            Max price
          </label>
          <input
            id="filter-max"
            name="maxPrice"
            type="number"
            min={0}
            step={50000}
            defaultValue={values.maxPrice}
            placeholder="Any"
            className={CONTROL}
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-type" className="eyebrow mb-2 block text-[0.58rem] text-stone">
          Property type
        </label>
        <select id="filter-type" name="type" defaultValue={values.type} onChange={submit} className={CONTROL}>
          <option value="">Any type</option>
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className="eyebrow mb-2 block text-[0.58rem] text-stone">
          Listing status
        </label>
        <select
          id="filter-status"
          name="status"
          defaultValue={values.status}
          onChange={submit}
          className={CONTROL}
        >
          <option value="">Any status</option>
          {LISTING_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="filter-beds" className="eyebrow mb-2 block text-[0.58rem] text-stone">
            Bedrooms
          </label>
          <select id="filter-beds" name="beds" defaultValue={values.beds} onChange={submit} className={CONTROL}>
            {BEDROOM_OPTIONS.map((option) => (
              <option key={`beds-${option.label}`} value={option.value}>
                {option.value ? option.label : "Any"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-baths" className="eyebrow mb-2 block text-[0.58rem] text-stone">
            Bathrooms
          </label>
          <select id="filter-baths" name="baths" defaultValue={values.baths} onChange={submit} className={CONTROL}>
            {BATHROOM_OPTIONS.map((option) => (
              <option key={`baths-${option.label}`} value={option.value}>
                {option.value ? option.label : "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="w-full bg-charcoal px-6 py-3 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
        >
          Apply filters
        </button>
        <a
          href="/properties"
          className="inline-flex items-center justify-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          Clear all
        </a>
      </div>
    </form>
  );
}
