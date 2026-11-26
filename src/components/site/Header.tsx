"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Menu, X } from "lucide-react";

import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { Logo } from "@/components/site/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn, whatsappHref } from "@/lib/utils";
import type { PublicSiteSettings } from "@/types/database";

interface HeaderProps {
  settings: PublicSiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // The public number is WhatsApp-only — no `tel:` links anywhere on the site.
  const whatsapp = whatsappHref(settings.contact_phone);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar — always dark, sets the tone before the nav slides in. */}
      <div className="hidden bg-ink text-white/70 md:block">
        <div className="mx-auto flex w-full max-w-[92rem] items-center justify-between px-6 py-2.5 sm:px-8 lg:px-12">
          <p className="eyebrow text-[0.6rem] text-white/55">
            {settings.tagline ?? "Private brokerage for exceptional homes"}
          </p>
          <div className="flex items-center gap-7">
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with ${settings.business_name} on WhatsApp`}
                className="flex items-center gap-2 font-sans text-[0.72rem] tracking-[0.08em] text-white/75 transition-colors hover:text-gold-soft"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp · {settings.contact_phone}
              </a>
            ) : null}
            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="font-sans text-[0.72rem] tracking-[0.08em] text-white/75 transition-colors hover:text-gold-soft"
              >
                {settings.contact_email}
              </a>
            ) : null}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-white"
            >
              <Lock className="h-3 w-3" strokeWidth={1.6} />
              Admin
            </Link>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
          scrolled
            ? "border-hairline bg-paper/95 backdrop-blur-md"
            : "border-transparent bg-paper",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[92rem] items-center justify-between px-6 transition-all duration-500 sm:px-8 lg:px-12",
            scrolled ? "py-3.5" : "py-5 lg:py-6",
          )}
        >
          <Link href="/" className="group flex flex-col leading-none" aria-label={`${settings.business_name} — home`}>
            <Logo variant="dark" withSubtitle />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "eyebrow link-underline py-1 text-[0.68rem] transition-colors duration-300",
                  isActive(link.href)
                    ? "text-ink link-underline-static"
                    : "text-stone hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden border border-charcoal px-6 py-3 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-white sm:inline-flex"
            >
              Private consultation
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 items-center justify-center border border-hairline text-charcoal transition-colors hover:border-charcoal lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/60 transition-opacity duration-400",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <span className="font-display text-[1.3rem] text-ink">{settings.business_name}</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center text-charcoal"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="block border-b border-hairline py-4 font-display text-[1.5rem] text-charcoal"
                >
                  Home
                </Link>
              </li>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block border-b border-hairline py-4 font-display text-[1.5rem]",
                      isActive(link.href) ? "text-gold" : "text-charcoal",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="mt-8 inline-flex w-full items-center justify-center border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-white"
            >
              Private consultation
            </Link>
          </nav>

          <div className="border-t border-hairline px-6 py-6">
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with ${settings.business_name} on WhatsApp`}
                className="flex items-center gap-2 font-sans text-[0.85rem] text-charcoal"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                WhatsApp · {settings.contact_phone}
              </a>
            ) : null}
            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-3 block font-sans text-[0.85rem] text-stone"
              >
                {settings.contact_email}
              </a>
            ) : null}
            <Link
              href="/admin"
              className="mt-4 inline-flex items-center gap-1.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-ink"
            >
              <Lock className="h-3.5 w-3.5" strokeWidth={1.6} />
              Admin login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
