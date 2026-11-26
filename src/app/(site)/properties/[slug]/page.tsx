import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, MapPin } from "lucide-react";

import { EnquiryBox } from "@/components/site/EnquiryBox";
import { Gallery } from "@/components/site/Gallery";
import { Media } from "@/components/site/Media";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Reveal } from "@/components/site/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PropertySpecs, StatusPill } from "@/components/ui/Indicators";
import { SectionHeading } from "@/components/ui/Layout";
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants";
import {
  getPropertyBySlug,
  getSimilarProperties,
} from "@/lib/queries/properties";
import { getPublicSettings } from "@/lib/queries/settings";
import {
  absoluteUrl,
  coverImage,
  formatNumber,
  formatPrice,
  propertyAddress,
  truncate,
} from "@/lib/utils";
import type { PropertyWithImages } from "@/types/database";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let property: PropertyWithImages | null = null;
  try {
    property = await getPropertyBySlug(slug);
  } catch {
    property = null;
  }

  if (!property) {
    return { title: "Residence not found" };
  }

  const description = truncate(
    property.description ??
      `${property.title} — ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms in ${property.city}, ${property.state}.`,
    158,
  );

  const socialImage = coverImage(property);

  return {
    title: property.title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: property.title,
      description,
      type: "article",
      url: absoluteUrl(`/properties/${property.slug}`),
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let property: PropertyWithImages | null = null;
  try {
    property = await getPropertyBySlug(slug);
  } catch {
    property = null;
  }

  if (!property) notFound();

  const [settings, similar] = await Promise.all([
    getPublicSettings(),
    getSimilarProperties(property, 3).catch(() => [] as PropertyWithImages[]),
  ]);

  const images =
    property.property_images && property.property_images.length > 0
      ? property.property_images.map((image) => ({
          url: image.url,
          alt_text: image.alt_text,
        }))
      : property.hero_image_url
        ? [{ url: property.hero_image_url, alt_text: property.title }]
        : [];

  const address = propertyAddress(property);
  const mapQuery = encodeURIComponent(
    property.latitude && property.longitude
      ? `${property.latitude},${property.longitude}`
      : address,
  );

  const facts: Array<{ label: string; value: string }> = [
    { label: "Property type", value: PROPERTY_TYPE_LABELS[property.property_type] },
    { label: "Status", value: LISTING_STATUS_LABELS[property.listing_status] },
    { label: "Bedrooms", value: formatNumber(property.bedrooms) },
    { label: "Bathrooms", value: String(property.bathrooms) },
    {
      label: "Interior",
      value: property.square_feet ? `${formatNumber(property.square_feet)} sq ft` : "—",
    },
    {
      label: "Lot size",
      value: property.lot_size
        ? `${formatNumber(property.lot_size)} ${property.lot_size_unit}`
        : "—",
    },
    { label: "Year built", value: property.year_built ? String(property.year_built) : "—" },
    { label: "Neighborhood", value: property.neighborhood ?? property.city },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description ?? undefined,
    url: absoluteUrl(`/properties/${property.slug}`),
    image: images.map((image) => image.url).slice(0, 6),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.street_address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zip_code,
      addressCountry: property.country,
    },
    ...(property.latitude && property.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude } }
      : {}),
    numberOfRooms: property.bedrooms,
    floorSize: property.square_feet
      ? { "@type": "QuantitativeValue", value: property.square_feet, unitCode: "FTK" }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is generated from our own database values.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-[92rem] px-6 pt-8 sm:px-8 lg:px-12">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-stone transition-colors hover:text-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to the collection
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[92rem] px-6 pt-6 sm:px-8 lg:px-12">
        <Gallery images={images} title={property.title} statusSlot={<StatusPill status={property.listing_status} />} />
      </div>

      <div className="mx-auto w-full max-w-[92rem] px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-16 lg:grid-cols-[1.55fr_1fr] lg:gap-20">
          {/* ---------------- Main column ---------------- */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="font-display text-[2.4rem] leading-none text-ink sm:text-[3rem]">
                  {formatPrice(property.price, property.price_period)}
                </p>
                <h1 className="mt-5 max-w-2xl text-[1.5rem] leading-snug tracking-[-0.01em] text-charcoal sm:text-[1.85rem]">
                  {property.title}
                </h1>
                <p className="mt-4 flex items-start gap-2 font-sans text-[0.92rem] text-stone">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                  {address}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <ButtonLink href="#schedule-viewing" variant="gold" size="md">
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.6} />
                  Schedule a private viewing
                </ButtonLink>
                <ButtonLink href="#enquire" variant="outline" size="md">
                  Request more information
                </ButtonLink>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-8 border-y border-hairline py-6">
              <PropertySpecs
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                squareFeet={property.square_feet}
                className="text-[0.9rem]"
              />
              <span className="eyebrow text-[0.6rem] text-mist">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </span>
            </div>

            {property.description ? (
              <section className="mt-12">
                <h2 className="eyebrow text-gold">About this residence</h2>
                <div className="mt-6 space-y-5 font-sans text-[1rem] leading-[1.85] text-slate-stone">
                  {property.description
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                </div>
              </section>
            ) : null}

            <section className="mt-14">
              <h2 className="eyebrow text-gold">Specification</h2>
              <dl className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-baseline justify-between gap-6 border-b border-hairline py-4"
                  >
                    <dt className="font-sans text-[0.82rem] uppercase tracking-[0.12em] text-mist">
                      {fact.label}
                    </dt>
                    <dd className="font-sans text-[0.95rem] text-charcoal">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {property.amenities.length > 0 ? (
              <section className="mt-14">
                <h2 className="eyebrow text-gold">Features & amenities</h2>
                <ul className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2} />
                      <span className="font-sans text-[0.9rem] text-slate-stone">{amenity}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {images.length > 1 ? (
              <section className="mt-14">
                <h2 className="eyebrow text-gold">Additional photography</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {images.slice(1).map((image, index) => (
                    <figure
                      key={`${image.url}-${index}`}
                      className="image-zoom relative aspect-[4/3] overflow-hidden bg-bone"
                    >
                      <Media
                        src={image.url}
                        alt={image.alt_text ?? property.title}
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-14">
              <h2 className="eyebrow text-gold">Location</h2>
              <p className="mt-5 font-sans text-[0.92rem] text-stone">{address}</p>
              <div className="mt-6 aspect-[16/9] w-full overflow-hidden border border-hairline bg-bone">
                <iframe
                  title={`Map of ${address}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                />
              </div>
              <p className="mt-3 font-sans text-[0.75rem] text-mist">
                Exact location shared on request.{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-hairline underline-offset-4 hover:decoration-gold"
                >
                  Open in Google Maps
                </a>
              </p>
            </section>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-hairline bg-shell p-6 sm:p-8">
              <p className="eyebrow text-gold">Private enquiry</p>
              <p className="mt-3 font-display text-[1.5rem] leading-snug text-ink">
                {settings.business_name}
              </p>
              <p className="mt-3 font-sans text-[0.85rem] leading-relaxed text-stone">
                Ask about {property.title} and an advisor will respond personally within one
                business day.
              </p>

              <div className="mt-7 border-t border-hairline pt-7">
                <EnquiryBox />
              </div>
            </div>

            <div id="schedule-viewing" className="mt-8 border border-hairline bg-paper p-6 sm:p-8">
              <p className="eyebrow text-gold">Private viewing</p>
              <h2 className="mt-3 font-display text-[1.4rem] leading-snug text-charcoal">
                Arrange a time to see it
              </h2>
              <p className="mt-3 font-sans text-[0.85rem] leading-relaxed text-stone">
                Viewings are private and by appointment. Tell us when suits you and we will confirm
                directly.
              </p>
              <div className="mt-6 border-t border-hairline pt-6">
                <EnquiryBox />
              </div>
            </div>

            <div id="enquire" className="mt-8 border border-hairline bg-bone p-6 sm:p-8">
              <p className="eyebrow text-gold">Documents</p>
              <p className="mt-3 font-sans text-[0.85rem] leading-relaxed text-stone">
                Floor plans, disclosure packages and a written opinion of value are available to
                qualified buyers.
              </p>
              <div className="mt-5">
                <ButtonLink
                  href={`mailto:${settings.contact_email ?? ""}?subject=${encodeURIComponent(
                    `Document request — ${property.title}`,
                  )}`}
                  variant="outline"
                  size="sm"
                >
                  Request the pack
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="border-t border-hairline bg-shell">
          <div className="mx-auto w-full max-w-[92rem] px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
            <Reveal>
              <SectionHeading
                eyebrow="You may also like"
                title="Comparable residences"
              />
            </Reveal>
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item, index) => (
                <Reveal key={item.id} delay={index * 100}>
                  <PropertyCard property={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
