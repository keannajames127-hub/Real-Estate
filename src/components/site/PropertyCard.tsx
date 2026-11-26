import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Media } from "@/components/site/Media";
import { PropertySpecs, StatusPill } from "@/components/ui/Indicators";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { Property } from "@/types/database";
import { cn, coverImage, formatPrice, propertyAddress, truncate } from "@/lib/utils";

type CardProperty = Pick<
  Property,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "price_period"
  | "street_address"
  | "city"
  | "state"
  | "zip_code"
  | "neighborhood"
  | "property_type"
  | "listing_status"
  | "bedrooms"
  | "bathrooms"
  | "square_feet"
  | "hero_image_url"
  | "is_featured"
> & {
  property_images?: Array<{ url: string; is_cover: boolean; sort_order: number }> | null;
};

interface PropertyCardProps {
  property: CardProperty;
  variant?: "grid" | "list" | "feature";
  priority?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  variant = "grid",
  priority = false,
  className,
}: PropertyCardProps) {
  const image = coverImage(property);
  const href = `/properties/${property.slug}`;
  const price = formatPrice(property.price, property.price_period);

  if (variant === "list") {
    return (
      <article
        className={cn(
          "group grid gap-0 border border-hairline bg-paper transition-colors duration-300 hover:border-charcoal/30 sm:grid-cols-[minmax(0,20rem)_1fr]",
          className,
        )}
      >
        <Link href={href} className="image-zoom relative block aspect-[4/3] overflow-hidden bg-bone sm:aspect-auto sm:h-full">
          <Media
            src={image}
            alt={property.title}
            sizes="(max-width: 640px) 100vw, 20rem"
            priority={priority}
          />
          <div className="absolute left-4 top-4">
            <StatusPill status={property.listing_status} />
          </div>
        </Link>

        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-start justify-between gap-6">
              <p className="font-display text-[1.75rem] leading-none text-ink">{price}</p>
              <span className="eyebrow shrink-0 pt-1 text-[0.6rem] text-stone">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </span>
            </div>
            <h3 className="mt-4 font-display text-[1.35rem] leading-snug text-charcoal">
              <Link href={href} className="link-underline">
                {property.title}
              </Link>
            </h3>
            <p className="mt-2 flex items-center gap-2 font-sans text-[0.85rem] text-stone">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.4} />
              {propertyAddress(property)}
            </p>
            {property.description ? (
              <p className="mt-4 hidden max-w-2xl font-sans text-[0.88rem] leading-relaxed text-stone md:block">
                {truncate(property.description, 190)}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-hairline pt-5">
            <PropertySpecs
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              squareFeet={property.square_feet}
            />
            <Link
              href={href}
              className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:text-gold"
            >
              View details
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={href}
        className={cn(
          "image-zoom relative block overflow-hidden bg-bone",
          isFeature ? "aspect-[3/4]" : "aspect-[4/3]",
        )}
      >
        <Media
          src={image}
          alt={property.title}
          sizes={
            isFeature
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <StatusPill status={property.listing_status} />
          {property.is_featured ? (
            <span className="inline-flex items-center bg-white/90 px-2.5 py-1 font-sans text-[0.6rem] font-medium uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
              Featured
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-[1.6rem] leading-none text-white drop-shadow-sm">
            {price}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-display text-[1.25rem] leading-snug text-charcoal">
          <Link href={href} className="link-underline">
            {property.title}
          </Link>
        </h3>
        <p className="mt-2 flex items-start gap-2 font-sans text-[0.82rem] leading-relaxed text-stone">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.4} />
          <span>
            {property.neighborhood ? `${property.neighborhood}, ` : ""}
            {property.city}, {property.state}
          </span>
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-4">
          <PropertySpecs
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            squareFeet={property.square_feet}
          />
          <span className="eyebrow text-[0.58rem] text-mist">
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </span>
        </div>
      </div>
    </article>
  );
}
