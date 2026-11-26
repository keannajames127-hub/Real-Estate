import type { Metadata } from "next";
import { Award, HeartHandshake, Landmark, ShieldCheck } from "lucide-react";

import { Media } from "@/components/site/Media";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader, SectionHeading } from "@/components/ui/Layout";
import { getPublicSettings } from "@/lib/queries/settings";
import { countPublishedProperties } from "@/lib/queries/properties";
import { formatNumber, whatsappHref } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "About",
  description:
    "Danish Home Properties is a private brokerage representing architecturally significant homes across California.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    Icon: Landmark,
    title: "Architecture first",
    body: "We represent houses that were designed with intent — and we describe them with the same care their architects applied.",
  },
  {
    Icon: ShieldCheck,
    title: "Discretion as standard",
    body: "Many of our engagements are never advertised. Confidentiality is assumed, not requested.",
  },
  {
    Icon: HeartHandshake,
    title: "One advisor, start to finish",
    body: "The person who shows you the house is the person who negotiates it. Nothing is handed off.",
  },
  {
    Icon: Award,
    title: "Priced to the market, not the mood",
    body: "Every valuation is supported by comparable evidence, not optimism.",
  },
];

export default async function AboutPage() {
  const settings = await getPublicSettings();
  const listingCount = await countPublishedProperties().catch(() => 0);

  const paragraphs = (
    settings.about_text ??
    "Danish Home Properties was founded on a simple conviction: the sale of a remarkable home deserves the same care as its design. We work with a deliberately small number of clients each year so that every listing receives the attention, photography and discretion it warrants.\n\nFrom hillside landmarks to mountain retreats and oceanfront estates, our advisors bring local fluency, quiet negotiation and an international network to every engagement.\n\nWe are licensed in California, and we work regularly with buyers moving from New York, Texas and London — most of whom are introduced to us by clients we have already served."
  )
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="The brokerage"
        title="Quietly exceptional representation"
        description={settings.tagline ?? undefined}
      />

      <section className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid items-start gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <Reveal>
            <div className="space-y-6 font-sans text-[1.02rem] leading-[1.85] text-slate-stone">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-hairline pt-10">
              <div>
                <p className="font-display text-[2.4rem] leading-none text-ink">24</p>
                <p className="mt-2 font-sans text-[0.78rem] uppercase tracking-[0.14em] text-mist">
                  Years advising
                </p>
              </div>
              <div>
                <p className="font-display text-[2.4rem] leading-none text-ink">
                  {formatNumber(listingCount)}
                </p>
                <p className="mt-2 font-sans text-[0.78rem] uppercase tracking-[0.14em] text-mist">
                  Live residences
                </p>
              </div>
              <div>
                <p className="font-display text-[2.4rem] leading-none text-ink">98%</p>
                <p className="mt-2 font-sans text-[0.78rem] uppercase tracking-[0.14em] text-mist">
                  List-to-ask ratio
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
              <Media
                src="/office-building.jpg"
                alt={`${settings.business_name} — our private office`}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="mt-6 border border-hairline bg-shell p-6">
              <p className="eyebrow text-gold">Private office</p>
              <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-stone">
                {settings.office_address ?? "By appointment."}
              </p>
              {whatsappHref(settings.contact_phone) ? (
                <a
                  href={whatsappHref(settings.contact_phone) ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat with ${settings.business_name} on WhatsApp`}
                  className="mt-3 inline-flex items-center gap-2 font-sans text-[0.9rem] text-charcoal transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  {settings.contact_phone}
                </a>
              ) : null}
              <div className="mt-6">
                <ButtonLink href="/contact" variant="outline" size="sm">
                  Arrange a meeting
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-hairline bg-shell">
        <div className="mx-auto w-full max-w-[92rem] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="How we work"
              title="Four principles, no exceptions"
              align="center"
            />
          </Reveal>

          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 90}>
                <Icon className="h-6 w-6 text-gold" strokeWidth={1.3} />
                <h3 className="mt-6 font-display text-[1.3rem] leading-snug text-charcoal">{title}</h3>
                <p className="mt-3 font-sans text-[0.88rem] leading-relaxed text-stone">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex w-full max-w-[92rem] flex-col items-start gap-8 px-6 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-soft">Considering a sale</p>
            <h2 className="mt-5 text-[2rem] leading-[1.12] tracking-[-0.02em] text-white sm:text-[2.6rem]">
              Request a confidential valuation
            </h2>
            <p className="mt-5 font-sans text-[0.98rem] leading-relaxed text-white/65">
              A written opinion of value, prepared by a senior advisor, with no obligation and no
              publicity.
            </p>
          </div>
          <ButtonLink href="/contact" variant="gold" size="lg">
            Request valuation
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
