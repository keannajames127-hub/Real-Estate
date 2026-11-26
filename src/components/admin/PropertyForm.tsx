"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Check, Plus, Save, X } from "lucide-react";

import { createProperty, updateProperty } from "@/actions/properties";
import { ImageUploader, type UploaderImage } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormBanner, Input, Label, Select, Textarea } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Layout";
import {
  AMENITY_SUGGESTIONS,
  LISTING_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  US_STATES,
} from "@/lib/constants";
import { initialPropertyState } from "@/lib/form-state";
import { cn } from "@/lib/utils";
import type { ListingStatus, Property } from "@/types/database";

export interface PropertyFormValues {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  price?: string;
  price_period?: Property["price_period"];
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  property_type?: Property["property_type"];
  listing_status?: ListingStatus;
  bedrooms?: string;
  bathrooms?: string;
  square_feet?: string;
  lot_size?: string;
  lot_size_unit?: string;
  year_built?: string;
  latitude?: string;
  longitude?: string;
  amenities?: string[];
  is_featured?: boolean;
  is_published?: boolean;
  hero_image_url?: string;
  images?: UploaderImage[];
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-hairline bg-paper">
      <div className="border-b border-hairline px-6 py-5">
        <h2 className="font-display text-[1.2rem] text-charcoal">{title}</h2>
        {description ? (
          <p className="mt-1.5 font-sans text-[0.82rem] text-stone">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-6 px-6 py-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SaveBar({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <Save className="h-3.5 w-3.5" strokeWidth={1.6} />
        )}
        {pending ? "Saving…" : mode === "create" ? "Publish listing" : "Save changes"}
      </Button>
      <Link
        href="/admin/properties"
        className="font-sans text-[0.72rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal"
      >
        Cancel
      </Link>
    </div>
  );
}

function AmenityPicker({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");

  function toggle(value: string) {
    setSelected((current) =>
      current.some((item) => item.toLowerCase() === value.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...current, value],
    );
  }

  function addDraft(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    toggle(value);
    setDraft("");
  }

  const remaining = AMENITY_SUGGESTIONS.filter(
    (suggestion) => !selected.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div className="sm:col-span-2">
      {/* The server splits this back into an array. */}
      <input type="hidden" name="amenities" value={selected.join(", ")} />

      <Label>Features &amp; amenities</Label>

      {selected.length > 0 ? (
        <ul className="mb-4 flex flex-wrap gap-2">
          {selected.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                className="inline-flex items-center gap-2 border border-gold/40 bg-gold-pale/40 px-3 py-1.5 font-sans text-[0.78rem] text-charcoal transition-colors hover:border-gold"
              >
                <Check className="h-3 w-3 text-gold" strokeWidth={2} />
                {item}
                <X className="h-3 w-3 text-mist" strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 font-sans text-[0.82rem] text-mist">
          Nothing selected yet — click a suggestion below or type your own.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addDraft(event);
          }}
          placeholder="Add a feature, e.g. Heated pool"
          className="w-full max-w-xs border border-hairline bg-white px-3 py-2 font-sans text-[0.84rem] text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={addDraft}
          className="inline-flex items-center gap-1.5 border border-charcoal/25 px-3 py-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal"
        >
          <Plus className="h-3 w-3" strokeWidth={1.8} />
          Add
        </button>
      </div>

      {remaining.length > 0 ? (
        <div className="mt-5">
          <p className="eyebrow mb-3 text-[0.55rem] text-mist">Suggestions</p>
          <ul className="flex flex-wrap gap-2">
            {remaining.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => toggle(suggestion)}
                  className="border border-hairline bg-shell px-3 py-1.5 font-sans text-[0.78rem] text-stone transition-colors hover:border-charcoal/40 hover:text-charcoal"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PropertyForm({
  mode,
  values = {},
}: {
  mode: "create" | "edit";
  values?: PropertyFormValues;
}) {
  const [state, formAction] = useActionState(
    mode === "create" ? createProperty : updateProperty,
    initialPropertyState,
  );
  const errors = state.fieldErrors ?? {};
  const [title, setTitle] = useState(values.title ?? "");

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      {state.status === "error" && state.message ? (
        <FormBanner tone="error">{state.message}</FormBanner>
      ) : null}

      <Panel
        title="The listing"
        description="How the property is titled and introduced on the public site."
      >
        <Field label="Property title" htmlFor="title" required error={errors.title} className="sm:col-span-2">
          <Input
            id="title"
            name="title"
            required
            maxLength={160}
            defaultValue={values.title}
            placeholder="Cliffside Modern Estate"
            invalid={Boolean(errors.title)}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>

        <Field
          label="URL slug"
          htmlFor="slug"
          error={errors.slug}
          hint="Leave blank to generate one from the title."
          className="sm:col-span-2"
        >
          <Input
            id="slug"
            name="slug"
            defaultValue={values.slug}
            placeholder="cliffside-modern-estate"
            invalid={Boolean(errors.slug)}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="description"
          required
          error={errors.description}
          hint="A short editorial paragraph, at least a few sentences."
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            name="description"
            required
            rows={7}
            maxLength={8000}
            defaultValue={values.description}
            placeholder="Set behind a private gated entry, this residence pairs clean modern lines with warm natural materials…"
            invalid={Boolean(errors.description)}
          />
        </Field>
      </Panel>

      <Panel
        title="Price &amp; status"
        description="Determines the price shown on cards and how the listing is labelled."
      >
        <Field label="Price (USD)" htmlFor="price" required error={errors.price}>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            required
            defaultValue={values.price}
            placeholder="8,500,000"
            invalid={Boolean(errors.price)}
          />
        </Field>

        <Field label="Price period" htmlFor="price_period" required error={errors.price_period}>
          <Select id="price_period" name="price_period" defaultValue={values.price_period ?? "total"}>
            <option value="total">Total (sale price)</option>
            <option value="month">Per month (rental)</option>
            <option value="year">Per year (rental)</option>
          </Select>
        </Field>

        <Field label="Property type" htmlFor="property_type" required error={errors.property_type}>
          <Select
            id="property_type"
            name="property_type"
            defaultValue={values.property_type ?? "house"}
          >
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Listing status" htmlFor="listing_status" required error={errors.listing_status}>
          <Select
            id="listing_status"
            name="listing_status"
            defaultValue={values.listing_status ?? "for_sale"}
          >
            {LISTING_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="space-y-4 sm:col-span-2">
          <Checkbox
            name="is_published"
            label="Published"
            description="Visible on the public website."
            defaultChecked={values.is_published ?? mode === "create"}
          />
          <Checkbox
            name="is_featured"
            label="Featured"
            description="Highlighted in the featured rail on the homepage."
            defaultChecked={values.is_featured ?? false}
          />
        </div>
      </Panel>

      <Panel title="Location" description="Used for search, filtering and the map on the detail page.">
        <Field
          label="Street address"
          htmlFor="street_address"
          required
          error={errors.street_address}
          className="sm:col-span-2"
        >
          <Input
            id="street_address"
            name="street_address"
            required
            defaultValue={values.street_address}
            placeholder="1200 Crestline Drive NW"
            invalid={Boolean(errors.street_address)}
          />
        </Field>

        <Field label="City" htmlFor="city" required error={errors.city}>
          <Input
            id="city"
            name="city"
            required
            defaultValue={values.city}
            placeholder="Garden Grove"
            invalid={Boolean(errors.city)}
          />
        </Field>

        <Field label="State" htmlFor="state" required error={errors.state}>
          <Select id="state" name="state" defaultValue={values.state ?? "GA"}>
            {US_STATES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="ZIP code" htmlFor="zip_code" required error={errors.zip_code}>
          <Input
            id="zip_code"
            name="zip_code"
            required
            defaultValue={values.zip_code}
            placeholder="30327"
            invalid={Boolean(errors.zip_code)}
          />
        </Field>

        <Field
          label="Neighborhood"
          htmlFor="neighborhood"
          error={errors.neighborhood}
          hint="Optional. Groups the listing with a featured neighborhood."
        >
          <Input
            id="neighborhood"
            name="neighborhood"
            defaultValue={values.neighborhood}
            placeholder="Buckhead"
            invalid={Boolean(errors.neighborhood)}
          />
        </Field>

        <Field label="Latitude" htmlFor="latitude" error={errors.latitude} hint="Optional.">
          <Input
            id="latitude"
            name="latitude"
            inputMode="decimal"
            defaultValue={values.latitude}
            placeholder="33.8400"
            invalid={Boolean(errors.latitude)}
          />
        </Field>

        <Field label="Longitude" htmlFor="longitude" error={errors.longitude} hint="Optional.">
          <Input
            id="longitude"
            name="longitude"
            inputMode="decimal"
            defaultValue={values.longitude}
            placeholder="-84.3900"
            invalid={Boolean(errors.longitude)}
          />
        </Field>
      </Panel>

      <Panel title="Specification" description="Beds, baths and the headline measurements.">
        <Field label="Bedrooms" htmlFor="bedrooms" required error={errors.bedrooms}>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={0}
            max={100}
            step={1}
            required
            defaultValue={values.bedrooms ?? "4"}
            invalid={Boolean(errors.bedrooms)}
          />
        </Field>

        <Field label="Bathrooms" htmlFor="bathrooms" required error={errors.bathrooms}>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min={0}
            max={100}
            step={0.5}
            required
            defaultValue={values.bathrooms ?? "4"}
            invalid={Boolean(errors.bathrooms)}
          />
        </Field>

        <Field
          label="Interior square footage"
          htmlFor="square_feet"
          error={errors.square_feet}
          hint="Optional."
        >
          <Input
            id="square_feet"
            name="square_feet"
            inputMode="numeric"
            defaultValue={values.square_feet}
            placeholder="8600"
            invalid={Boolean(errors.square_feet)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Lot size" htmlFor="lot_size" error={errors.lot_size} hint="Optional.">
            <Input
              id="lot_size"
              name="lot_size"
              inputMode="decimal"
              defaultValue={values.lot_size}
              placeholder="1.8"
              invalid={Boolean(errors.lot_size)}
            />
          </Field>
          <Field label="Unit" htmlFor="lot_size_unit" error={errors.lot_size_unit}>
            <Select id="lot_size_unit" name="lot_size_unit" defaultValue={values.lot_size_unit ?? "acres"}>
              <option value="sqft">sq ft</option>
              <option value="acres">acres</option>
              <option value="hectares">hectares</option>
            </Select>
          </Field>
        </div>

        <Field label="Year built" htmlFor="year_built" error={errors.year_built} hint="Optional.">
          <Input
            id="year_built"
            name="year_built"
            type="number"
            min={1500}
            max={2200}
            step={1}
            defaultValue={values.year_built}
            placeholder="2019"
            invalid={Boolean(errors.year_built)}
          />
        </Field>
      </Panel>

      <Panel title="Features &amp; amenities">
        <AmenityPicker initial={values.amenities ?? []} />
      </Panel>

      <div id="photography" className="scroll-mt-24">
        <Panel
          title="Photography"
          description="The cover image is used on every card. Additional images fill the gallery."
        >
          <div className="sm:col-span-2">
            <ImageUploader initialImages={values.images ?? []} propertyTitle={title} />
          </div>

          <Field
            label="Hero image URL"
            htmlFor="hero_image_url"
            error={errors.hero_image_url}
            hint="Optional. Only used when a listing has no photographs in the gallery."
            className="sm:col-span-2"
          >
            <Input
              id="hero_image_url"
              name="hero_image_url"
              defaultValue={values.hero_image_url}
              placeholder="https://…"
              invalid={Boolean(errors.hero_image_url)}
            />
          </Field>
        </Panel>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SaveBar mode={mode} />
        {mode === "edit" && values.slug ? (
          <Link
            href={`/properties/${values.slug}`}
            target="_blank"
            className={cn(
              "inline-flex items-center gap-1.5 font-sans text-[0.72rem] uppercase tracking-[0.16em]",
              "text-stone transition-colors hover:text-charcoal",
            )}
          >
            View on site
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
          </Link>
        ) : null}
      </div>
    </form>
  );
}
