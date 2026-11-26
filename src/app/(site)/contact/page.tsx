import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";

import { EnquiryBox } from "@/components/site/EnquiryBox";
import { Reveal } from "@/components/site/Reveal";
import { SocialLinks, WhatsAppIcon } from "@/components/site/SocialIcons";
import { PageHeader } from "@/components/ui/Layout";
import { getPublicSettings } from "@/lib/queries/settings";
import { whatsappHref } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Danish Home Properties to enquire about a residence, request a valuation or arrange a private viewing.",
  alternates: { canonical: "/contact" },
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const advisor = first(params.advisor).slice(0, 80);

  const settings = await getPublicSettings();
  const whatsapp = whatsappHref(settings.contact_phone);
  const mapQuery = encodeURIComponent(settings.office_address ?? "Garden Grove, CA");

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Begin the conversation"
        description="An advisor will respond personally, usually within one business day."
      />

      <div className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          <Reveal>
            <h2 className="font-display text-[1.8rem] leading-snug text-ink">The private office</h2>
            <p className="mt-5 font-sans text-[0.98rem] leading-relaxed text-stone">
              {settings.tagline ??
                "Send a note, message the office on WhatsApp, or arrange to meet an advisor in person."}
            </p>

            <ul className="mt-10 space-y-7 border-t border-hairline pt-9">
              {settings.office_address ? (
                <li className="flex gap-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                  <div>
                    <p className="eyebrow text-[0.55rem] text-mist">Office</p>
                    <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-charcoal">
                      {settings.office_address}
                    </p>
                  </div>
                </li>
              ) : null}
              {whatsapp ? (
                <li className="flex gap-4">
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="eyebrow text-[0.55rem] text-mist">WhatsApp</p>
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Chat with ${settings.business_name} on WhatsApp`}
                      className="mt-2 block font-sans text-[0.92rem] text-charcoal transition-colors hover:text-gold"
                    >
                      {settings.contact_phone}
                    </a>
                    <p className="mt-1 font-sans text-[0.8rem] text-mist">
                      Messages only — start a chat and we will reply.
                    </p>
                  </div>
                </li>
              ) : null}
              {settings.contact_email ? (
                <li className="flex gap-4">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                  <div>
                    <p className="eyebrow text-[0.55rem] text-mist">Email</p>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="mt-2 block font-sans text-[0.92rem] break-all text-charcoal transition-colors hover:text-gold"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                </li>
              ) : null}
              <li className="flex gap-4">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                <div>
                  <p className="eyebrow text-[0.55rem] text-mist">Hours</p>
                  <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-charcoal">
                    Monday – Friday, 9am – 6pm
                    <br />
                    Saturday and evening viewings by appointment
                  </p>
                </div>
              </li>
            </ul>

            <SocialLinks
              links={settings.social_links ?? {}}
              className="mt-10 flex items-center gap-5 text-charcoal"
              iconClassName="h-[1.05rem] w-[1.05rem]"
            />

            <div className="mt-12 aspect-[4/3] w-full overflow-hidden border border-hairline bg-bone">
              <iframe
                title="Map of our office"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="border border-hairline bg-shell p-6 sm:p-10">
            <EnquiryBox
              heading={advisor ? `Message ${advisor}` : "Send us a note"}
              description="Tell us what you are looking for and the best way to reach you. Every enquiry is answered personally."
            />
          </Reveal>
        </div>
      </div>
    </>
  );
}
