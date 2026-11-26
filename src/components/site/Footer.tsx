import Link from "next/link";
import { Lock, Mail, MapPin } from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { SocialLinks, WhatsAppIcon } from "@/components/site/SocialIcons";
import { NAV_LINKS } from "@/lib/constants";
import { whatsappHref } from "@/lib/utils";
import type { PublicSiteSettings } from "@/types/database";

interface FooterProps {
  settings: PublicSiteSettings;
  neighborhoods?: Array<{ slug: string; label: string }>;
}

export function Footer({ settings, neighborhoods = [] }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsapp = whatsappHref(settings.contact_phone);

  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto w-full max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block">
              <Logo variant="light" withSubtitle />
            </Link>
            <p className="mt-6 max-w-md font-sans text-[0.9rem] leading-relaxed text-white/55">
              {settings.about_text
                ? settings.about_text.split("\n")[0]
                : "A private brokerage representing architecturally significant homes and extraordinary estates across California."}
            </p>
            <SocialLinks
              links={settings.social_links ?? {}}
              className="mt-8 flex items-center gap-3"
              iconClassName="h-4 w-4"
            />
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow mb-6 text-gold-soft">Explore</h2>
            <ul className="space-y-3">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-[0.88rem] text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/properties?status=for_sale"
                  className="font-sans text-[0.88rem] text-white/60 transition-colors duration-300 hover:text-white"
                >
                  For Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?status=for_rent"
                  className="font-sans text-[0.88rem] text-white/60 transition-colors duration-300 hover:text-white"
                >
                  For Rent
                </Link>
              </li>
            </ul>
          </div>

          {neighborhoods.length > 0 ? (
            <div className="lg:col-span-2">
              <h2 className="eyebrow mb-6 text-gold-soft">Neighborhoods</h2>
              <ul className="space-y-3">
                {neighborhoods.slice(0, 6).map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/properties?q=${encodeURIComponent(item.label)}`}
                      className="font-sans text-[0.88rem] text-white/60 transition-colors duration-300 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={neighborhoods.length > 0 ? "lg:col-span-2" : "lg:col-span-4"}>
            <h2 className="eyebrow mb-6 text-gold-soft">Private office</h2>
            <ul className="space-y-4">
              {settings.office_address ? (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" strokeWidth={1.4} />
                  <span className="font-sans text-[0.88rem] leading-relaxed text-white/60">
                    {settings.office_address}
                  </span>
                </li>
              ) : null}
              {whatsapp ? (
                <li className="flex gap-3">
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat with ${settings.business_name} on WhatsApp`}
                    className="font-sans text-[0.88rem] text-white/60 transition-colors hover:text-[#25D366]"
                  >
                    WhatsApp · {settings.contact_phone}
                  </a>
                </li>
              ) : null}
              {settings.contact_email ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" strokeWidth={1.4} />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="font-sans text-[0.88rem] break-all text-white/60 transition-colors hover:text-white"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="font-sans text-[0.78rem] text-white/40">
              © {year} {settings.business_name}. All rights reserved.{" "}
              {settings.footer_note ?? "Equal Housing Opportunity."}
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link
                href="/properties"
                className="font-sans text-[0.78rem] text-white/40 transition-colors hover:text-white/70"
              >
                All listings
              </Link>
              <Link
                href="/contact"
                className="font-sans text-[0.78rem] text-white/40 transition-colors hover:text-white/70"
              >
                Contact
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 font-sans text-[0.78rem] text-white/60 transition-colors hover:text-white"
              >
                <Lock className="h-3 w-3" strokeWidth={1.6} />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
