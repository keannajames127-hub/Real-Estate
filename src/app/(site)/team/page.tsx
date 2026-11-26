import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { Media } from "@/components/site/Media";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Layout";
import { getActiveAgents } from "@/lib/queries/settings";
import { whatsappHref } from "@/lib/utils";
import type { Agent } from "@/types/database";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Our Advisors",
  description:
    "Meet the advisors of Danish Home Properties — a deliberately small team of senior luxury real estate professionals.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  let agents: Agent[] = [];
  try {
    agents = await getActiveAgents();
  } catch {
    agents = [];
  }

  return (
    <>
      <PageHeader
        eyebrow="The team"
        title="Your advisors"
        description="A deliberately small team. You will work directly with a senior advisor from first viewing to closing."
      />

      <div className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        {agents.length === 0 ? (
          <EmptyState
            title="Our team profiles are being prepared"
            description="Advisor biographies are managed from the admin dashboard and will appear here as soon as they are published."
          />
        ) : (
          <div className="space-y-20 lg:space-y-28">
            {agents.map((agent, index) => (
              <Reveal key={agent.id}>
                <article
                  className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                    index % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
                    <Media
                      src={agent.photo_url}
                      alt={agent.name}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                  </figure>

                  <div>
                    <h2 className="font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
                      {agent.name}
                    </h2>
                    {agent.title ? (
                      <p className="mt-3 font-sans text-[0.78rem] uppercase tracking-[0.2em] text-gold">
                        {agent.title}
                      </p>
                    ) : null}

                    {agent.bio ? (
                      <div className="mt-7 space-y-4 font-sans text-[0.95rem] leading-[1.8] text-slate-stone">
                        {agent.bio
                          .split(/\n{2,}/)
                          .filter(Boolean)
                          .map((paragraph) => (
                            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                          ))}
                      </div>
                    ) : null}

                    {agent.specialties.length > 0 ? (
                      <ul className="mt-7 flex flex-wrap gap-2">
                        {agent.specialties.map((specialty) => (
                          <li
                            key={specialty}
                            className="border border-hairline bg-shell px-3 py-1.5 font-sans text-[0.72rem] uppercase tracking-[0.12em] text-stone"
                          >
                            {specialty}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <dl className="mt-8 space-y-3 border-t border-hairline pt-7">
                      {agent.email ? (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                          <a
                            href={`mailto:${agent.email}`}
                            className="font-sans text-[0.88rem] text-charcoal underline decoration-hairline underline-offset-4 transition-colors hover:decoration-gold"
                          >
                            {agent.email}
                          </a>
                        </div>
                      ) : null}
                      {whatsappHref(agent.phone) ? (
                        <div className="flex items-center gap-3">
                          <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                          <a
                            href={whatsappHref(agent.phone) ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chat with ${agent.name} on WhatsApp`}
                            className="font-sans text-[0.88rem] text-charcoal"
                          >
                            {agent.phone}
                          </a>
                        </div>
                      ) : null}
                      {agent.license_number ? (
                        <div className="flex items-center gap-3">
                          <span className="eyebrow text-[0.55rem] text-mist">Licence</span>
                          <span className="font-sans text-[0.85rem] text-stone">
                            {agent.license_number}
                          </span>
                        </div>
                      ) : null}
                    </dl>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <ButtonLink
                        href={`/contact?advisor=${encodeURIComponent(agent.name)}`}
                        variant="primary"
                        size="sm"
                      >
                        Contact {agent.name.split(" ")[0]}
                      </ButtonLink>
                      <ButtonLink href="/properties" variant="outline" size="sm">
                        Their listings
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
