"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Building,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { cn, initials } from "@/lib/utils";
import type { AdminRole } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  exact?: boolean;
}

export function AdminShell({
  children,
  businessName,
  adminName,
  adminRole,
  newEnquiries,
  canManageTeam,
}: {
  children: ReactNode;
  businessName: string;
  adminName: string;
  adminRole: AdminRole;
  newEnquiries: number;
  canManageTeam: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/properties", label: "Properties", icon: Building },
    { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: newEnquiries },
    ...(canManageTeam
      ? [{ href: "/admin/settings", label: "Team & settings", icon: Users } satisfies NavItem]
      : [{ href: "/admin/settings", label: "Settings", icon: Settings } satisfies NavItem]),
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-3 font-sans text-[0.86rem] transition-colors duration-200",
              active
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white/90",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold-soft" : "")} strokeWidth={1.5} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-gold px-1.5 py-0.5 font-sans text-[0.65rem] font-semibold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-4 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 font-sans text-[0.72rem] font-semibold text-gold-soft">
          {initials(adminName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[0.85rem] text-white/90">{adminName}</p>
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white/40">
            {adminRole}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 font-sans text-[0.82rem] text-white/50 transition-colors hover:text-white/90"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
          View public site
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 font-sans text-[0.82rem] text-white/50 transition-colors hover:text-white/90"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-shell">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[16.5rem] flex-col bg-ink lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/admin" className="block">
            <span className="font-display text-[1.15rem] leading-tight text-white">
              {businessName}
            </span>
            <span className="eyebrow mt-1.5 block text-[0.55rem] text-gold-soft">
              Admin dashboard
            </span>
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-paper px-5 py-3.5 lg:hidden">
        <Link href="/admin" className="font-display text-[1.1rem] text-ink">
          {businessName}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dashboard menu"
          className="flex h-10 w-10 items-center justify-center border border-hairline text-charcoal"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] flex-col bg-ink">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <span className="font-display text-[1.1rem] text-white">{businessName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center text-white/60"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      <div className="min-w-0 flex-1 lg:pl-[16.5rem]">
        <div className="mx-auto w-full max-w-[80rem] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
