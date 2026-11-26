import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Media } from "@/components/site/Media";
import { Reveal } from "@/components/site/Reveal";
import { EmptyState, PageHeader } from "@/components/ui/Layout";
import { getNeighborhoods } from "@/lib/queries/properties";
import { formatPriceCompact } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Neighborhoods",
  description:
    "Explore the neighborhoods, districts and resort communities where Danish Home Properties represents homes.",
  alternates: { canonical: "/neighborhoods" },
};

export default async function NeighborhoodsPage() {
  let neighborhoods: Awaited<ReturnType<typeof getNeighborhoods>> = [];
  try {
    neighborhoods = await getNeighborhoods(24);
  } catch {
    neighborhoods = [];
  }

  return (
    <>
      <PageHeader
        eyebrow="Where we work"
        title="Featured Neighborhoods"
        description="From intown historic districts to mountain and coastal retreats — the places our clients ask for by name."
      />

      <div className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        {neighborhoods.length === 0 ? (
          <EmptyState
            title="Neighborhood guides are being prepared"
            description="Once listings are published, this page builds itself from the live catalogue — no maintenance required."
          />
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((item, index) => (
              <Reveal key={item.slug} delay={(index % 3) * 100}>
                <article className="flex h-full flex-col">
                  <Link
                    href={`/properties?q=${encodeURIComponent(item.label)}`}
                    className="image-zoom group relative block aspect-[5/4] overflow-hidden bg-bone"
                  >
                    <Media
                      src={item.image}
                      alt={`${item.label}, ${item.city}`}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="eyebrow text-gold-soft">
                        {item.city}, {item.state}
                      </p>
                      <h2 className="mt-2 font-display text-[1.7rem] leading-tight text-white">
                        {item.label}
                      </h2>
                    </div>
                  </Link>

                  <dl className="mt-6 flex flex-1 flex-col justify-between">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <dt className="eyebrow text-[0.55rem] text-mist">Residences</dt>
                        <dd className="mt-1.5 font-display text-[1.35rem] text-charcoal">
                          {item.count}
                        </dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-[0.55rem] text-mist">Average price</dt>
                        <dd className="mt-1.5 font-display text-[1.35rem] text-charcoal">
                          {formatPriceCompact(Math.round(item.averagePrice))}
                        </dd>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
                      <p className="font-sans text-[0.8rem] text-stone">
                        {formatPriceCompact(Math.round(item.minPrice))} –{" "}
                        {formatPriceCompact(Math.round(item.maxPrice))}
                      </p>
                      <Link
                        href={`/properties?q=${encodeURIComponent(item.label)}`}
                        className="inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-charcoal transition-colors hover:text-gold"
                      >
                        Browse
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                      </Link>
                    </div>
                  </dl>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
