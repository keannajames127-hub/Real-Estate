import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Quote, Search } from "lucide-react";

import { EnquiryBox } from "@/components/site/EnquiryBox";
import { Media } from "@/components/site/Media";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertySearchBar } from "@/components/site/PropertySearchBar";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Layout";
import {
  getAvailableCities,
  getFeaturedProperties,
  getLuxuryProperties,
  getNeighborhoods,
  getRecentProperties,
  type NeighborhoodSummary,
} from "@/lib/queries/properties";
import { getActiveAgents, getPublicSettings } from "@/lib/queries/settings";
import { coverImage, formatNumber, whatsappHref } from "@/lib/utils";
import type { Agent, PropertyWithImages } from "@/types/database";

export const revalidate = 300;

const SECTION = "mx-auto w-full max-w-[92rem] px-6 sm:px-8 lg:px-12";

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [settings, featured, recent, luxury, neighborhoods, cities, agents] =
    await Promise.all([
      getPublicSettings(),
      safe(getFeaturedProperties(3), [] as PropertyWithImages[]),
      safe(getRecentProperties(6), [] as PropertyWithImages[]),
      safe(getLuxuryProperties(3), [] as PropertyWithImages[]),
      safe(getNeighborhoods(6), [] as NeighborhoodSummary[]),
      safe(getAvailableCities(), [] as string[]),
      safe(getActiveAgents(), [] as Agent[]),
    ]);

  const heroImage =
    settings.hero_image_url ??
    (featured[0] ? coverImage(featured[0]) : null) ??
    (recent[0] ? coverImage(recent[0]) : null);

  const spotlight = luxury[0] ?? featured[0] ?? recent[0] ?? null;
  const boutique = settings.business_name;

  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate flex min-h-[calc(100vh-6rem)] items-center overflow-hidden bg-ink">
        <div className="absolute inset-0 animate-slow-zoom">
          <Media
            src={heroImage}
            alt="A luxury estate represented by Danish Home Properties"
            sizes="100vw"
            priority
            quality={85}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/45 to-ink/85" />

        <div className={SECTION + " relative z-10 py-20 lg:py-28"}>
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow-lg text-gold-soft">{boutique}</p>
            <h1 className="mt-6 text-[2.6rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-[3.6rem] lg:text-[4.5rem]">
              {settings.hero_headline ?? "Discover Exceptional Properties"}
            </h1>
            <p className="mt-7 max-w-xl font-sans text-[1rem] leading-relaxed text-white/75 sm:text-[1.06rem]">
              {settings.hero_subheadline ??
                "A curated collection of California's finest homes, presented with discretion and care."}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/properties" variant="gold" size="lg">
                Browse the collection
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outlineLight" size="lg">
                Speak with an advisor
              </ButtonLink>
            </div>
          </div>

          <div className="mt-16 max-w-5xl border-t border-white/15 pt-10 lg:mt-20">
            <p className="mb-6 font-sans text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
              Search the collection
            </p>
            <PropertySearchBar cities={cities} variant="hero" />
          </div>
        </div>
      </section>

      {/* ================= Marquee stats ================= */}
      <section className="border-b border-hairline bg-shell">
        <div className={SECTION + " grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4"}>
          {[
            { value: "24", suffix: "Years", label: "Advising on exceptional homes" },
            { value: "$2.4", suffix: "Billion", label: "In career sales volume" },
            { value: "24", suffix: "Hours", label: "Average response to a new enquiry" },
            { value: "11", suffix: "Counties", label: "Across Southern California" },
          ].map((stat, index) => (
            <Reveal key={stat.label} delay={index * 90}>
              <p className="font-display text-[2.6rem] leading-none text-ink">
                {stat.value}
                <span className="ml-2 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-gold">
                  {stat.suffix}
                </span>
              </p>
              <p className="mt-3 max-w-[14rem] font-sans text-[0.85rem] leading-relaxed text-stone">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= Featured ================= */}
      {featured.length > 0 ? (
        <section className="bg-paper">
          <div className={SECTION + " py-20 lg:py-28"}>
            <Reveal>
              <SectionHeading
                eyebrow="Featured residences"
                title="A private selection, chosen by our advisors"
                description="Each residence is visited, vetted and photographed by our team before it is presented here."
                action={
                  <Link
                    href="/properties?featured=1"
                    className="eyebrow link-underline inline-flex items-center gap-2 text-charcoal"
                  >
                    View all featured
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {featured.map((property, index) => (
                <Reveal key={property.id} delay={index * 110}>
                  <PropertyCard property={property} variant="feature" priority={index === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= About ================= */}
      <section className="border-y border-hairline bg-bone">
        <div className={SECTION + " grid items-center gap-14 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28"}>
          <Reveal className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
              <Media
                src={spotlight?.hero_image_url ?? heroImage}
                alt="An advisor welcoming clients to a private viewing"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden max-w-[16rem] border border-hairline bg-paper p-6 shadow-xl sm:block lg:-right-8">
              <Quote className="h-5 w-5 text-gold" strokeWidth={1.4} />
              <p className="mt-3 font-display text-[1.05rem] leading-snug text-charcoal">
                “They understood the house before we did.”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-hairline bg-bone">
                  <Media
                    src="/testimonial-bel-air-seller.jpg"
                    alt="Portrait of the Bel Air seller"
                    sizes="40px"
                  />
                </span>
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.16em] text-mist">
                  Bel Air seller
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow text-gold">About the brokerage</p>
            <h2 className="mt-5 text-[2rem] leading-[1.12] tracking-[-0.02em] text-ink sm:text-[2.6rem]">
              Quietly exceptional representation
            </h2>
            <div className="mt-7 space-y-5 font-sans text-[0.96rem] leading-relaxed text-stone">
              {(settings.about_text ??
                "Danish Home Properties was founded on a simple conviction: the sale of a remarkable home deserves the same care as its design. We work with a deliberately small number of clients each year so that every listing receives the attention, photography and discretion it warrants.\n\nFrom hillside landmarks to mountain retreats and oceanfront estates, our advisors bring local fluency, quiet negotiation and an international network to every engagement.")
                .split("\n")
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-hairline pt-8">
              <div>
                <dt className="eyebrow text-mist">Licensed in</dt>
                <dd className="mt-2 font-display text-[1.4rem] text-charcoal">California</dd>
              </div>
              <div>
                <dt className="eyebrow text-mist">Members of</dt>
                <dd className="mt-2 font-display text-[1.4rem] text-charcoal">California REALTORS®</dd>
              </div>
            </dl>

            <div className="mt-10">
              <ButtonLink href="/about" variant="outline" size="md">
                Our approach
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Recently listed ================= */}
      {recent.length > 0 ? (
        <section className="bg-paper">
          <div className={SECTION + " py-20 lg:py-28"}>
            <Reveal>
              <SectionHeading
                eyebrow="New to market"
                title="Recently listed"
                action={
                  <Link
                    href="/properties?sort=newest"
                    className="eyebrow link-underline inline-flex items-center gap-2 text-charcoal"
                  >
                    All new listings
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((property, index) => (
                <Reveal key={property.id} delay={(index % 3) * 110}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Luxury ================= */}
      {luxury.length > 0 ? (
        <section className="bg-ink text-white">
          <div className={SECTION + " py-20 lg:py-28"}>
            <Reveal>
              <SectionHeading
                eyebrow="The luxury collection"
                title="Homes above three million"
                description="Estate-calibre properties with the land, provenance and privacy that define the very top of the market."
                tone="light"
                action={
                  <Link
                    href="/properties?minPrice=3000000&sort=price_desc"
                    className="eyebrow link-underline inline-flex items-center gap-2 text-gold-soft"
                  >
                    Enter the collection
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                }
              />
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
              {luxury.map((property, index) => (
                <Reveal key={property.id} delay={index * 110} className="[&_h3]:text-white">
                  <PropertyCard property={property} variant="feature" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Neighborhoods ================= */}
      {neighborhoods.length > 0 ? (
        <section className="bg-paper">
          <div className={SECTION + " py-20 lg:py-28"}>
            <Reveal>
              <SectionHeading
                eyebrow="Where we work"
                title="Featured neighborhoods"
                description="Local knowledge is the difference between a good price and the right one."
                action={
                  <Link
                    href="/neighborhoods"
                    className="eyebrow link-underline inline-flex items-center gap-2 text-charcoal"
                  >
                    All neighborhoods
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {neighborhoods.map((item, index) => (
                <Reveal key={item.slug} delay={(index % 3) * 100}>
                  <Link
                    href={`/properties?q=${encodeURIComponent(item.label)}`}
                    className="image-zoom group relative block aspect-[5/4] overflow-hidden bg-bone"
                  >
                    <Media src={item.image} alt={`${item.label}, ${item.city}`} sizes="(max-width: 640px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="eyebrow text-gold-soft">{item.state}</p>
                      <h3 className="mt-2 font-display text-[1.6rem] leading-tight text-white">
                        {item.label}
                      </h3>
                      <p className="mt-2 font-sans text-[0.8rem] text-white/65">
                        {item.count} {item.count === 1 ? "residence" : "residences"} · from{" "}
                        {formatNumber(Math.round(item.minPrice))}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Team ================= */}
      {agents.length > 0 ? (
        <section className="border-y border-hairline bg-shell">
          <div className={SECTION + " py-20 lg:py-28"}>
            <Reveal>
              <SectionHeading
                eyebrow="Your advisors"
                title="A small team, deliberately"
                description="Every client works directly with a senior advisor — never a call centre."
                action={
                  <Link
                    href="/team"
                    className="eyebrow link-underline inline-flex items-center gap-2 text-charcoal"
                  >
                    Meet the team
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </Link>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {agents.slice(0, 4).map((agent, index) => (
                <Reveal key={agent.id} delay={index * 90}>
                  <article>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-bone">
                      <Media
                        src={agent.photo_url}
                        alt={agent.name}
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    </div>
                    <h3 className="mt-5 font-display text-[1.3rem] text-charcoal">{agent.name}</h3>
                    {agent.title ? (
                      <p className="mt-1 font-sans text-[0.78rem] uppercase tracking-[0.16em] text-gold">
                        {agent.title}
                      </p>
                    ) : null}
                    {agent.specialties.length > 0 ? (
                      <p className="mt-3 font-sans text-[0.82rem] leading-relaxed text-stone">
                        {agent.specialties.slice(0, 3).join(" · ")}
                      </p>
                    ) : null}
                    {agent.email ? (
                      <a
                        href={`mailto:${agent.email}`}
                        className="mt-4 inline-block font-sans text-[0.8rem] text-charcoal underline decoration-hairline underline-offset-4 transition-colors hover:decoration-gold"
                      >
                        {agent.email}
                      </a>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= CTA ================= */}
      <section className="bg-paper">
        <div className={SECTION + " py-20 lg:py-28"}>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
            <Reveal>
              <p className="eyebrow text-gold">Begin the conversation</p>
              <h2 className="mt-5 text-[2rem] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[2.75rem]">
                Tell us what you are looking for
              </h2>
              <p className="mt-6 max-w-md font-sans text-[0.98rem] leading-relaxed text-stone">
                Whether you are buying, selling or simply curious about the value of your home, an
                advisor will respond personally. Many of our finest residences are never publicly
                advertised.
              </p>

              <ul className="mt-10 space-y-6 border-t border-hairline pt-9">
                <li className="flex items-start gap-4">
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-[0.9rem] font-medium text-charcoal">Off-market access</p>
                    <p className="mt-1 font-sans text-[0.85rem] text-stone">
                      A private register of homes not yet listed.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-[0.9rem] font-medium text-charcoal">Neighborhood counsel</p>
                    <p className="mt-1 font-sans text-[0.85rem] text-stone">
                      School catchments, lot lines, quiet streets — the detail that matters.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-[0.9rem] font-medium text-charcoal">Confidential valuation</p>
                    <p className="mt-1 font-sans text-[0.85rem] text-stone">
                      A written opinion of value, with no obligation.
                    </p>
                  </div>
                </li>
              </ul>

              {whatsappHref(settings.contact_phone) ? (
                <p className="mt-10 font-sans text-[0.85rem] text-stone">
                  Prefer to chat?{" "}
                  <a
                    href={whatsappHref(settings.contact_phone) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="inline-flex items-center gap-1.5 text-charcoal underline decoration-gold underline-offset-4"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                    Message us on WhatsApp
                  </a>
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={120} className="border border-hairline bg-shell p-6 sm:p-10">
              <EnquiryBox
                heading="Send a private enquiry"
                description="Share a few details and the right advisor will come back to you within one business day."
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
