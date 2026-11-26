import Link from "next/link";
import {
  ArrowUpRight,
  Building,
  Clock,
  Inbox,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { StatusPill } from "@/components/ui/Indicators";
import { EmptyState } from "@/components/ui/Layout";
import {
  ENQUIRY_STATUS_BADGE_STYLES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPE_LABELS,
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { getRecentlyUpdatedProperties } from "@/lib/queries/admin-properties";
import { getDashboardStats, getRecentEnquiries } from "@/lib/queries/enquiries";
import { cn, formatNumber, formatRelative, formatPrice, shortAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatTile({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <p className="eyebrow text-[0.55rem] text-mist">{label}</p>
      <p
        className={cn(
          "mt-3 font-display text-[2.2rem] leading-none",
          accent ? "text-gold" : "text-ink",
        )}
      >
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-2 font-sans text-[0.78rem] text-stone">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group border border-hairline bg-paper p-6 transition-colors duration-300 hover:border-charcoal/30"
      >
        {body}
        <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-stone transition-colors group-hover:text-charcoal">
          View
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
        </span>
      </Link>
    );
  }

  return <div className="border border-hairline bg-paper p-6">{body}</div>;
}

export default async function AdminOverviewPage() {
  const session = await requireAdmin("/admin");

  const [stats, recentProperties, recentEnquiries] = await Promise.all([
    getDashboardStats(),
    getRecentlyUpdatedProperties(5),
    getRecentEnquiries(6),
  ]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-gold">Overview</p>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
            {greeting}, {(session.admin.full_name ?? session.admin.username).split(" ")[0]}.
          </h1>
          <p className="mt-3 font-sans text-[0.9rem] text-stone">
            {stats.newEnquiries > 0
              ? `${formatNumber(stats.newEnquiries)} new enquir${stats.newEnquiries === 1 ? "y" : "ies"} waiting for a reply.`
              : "Every enquiry has been answered. Nothing is waiting."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Add a property
          </Link>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-2 border border-charcoal/25 px-6 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-white"
          >
            <Inbox className="h-3.5 w-3.5" strokeWidth={1.6} />
            Enquiries
          </Link>
        </div>
      </header>

      {/* Property counters */}
      <section>
        <h2 className="eyebrow mb-5 flex items-center gap-2 text-charcoal">
          <Building className="h-3.5 w-3.5" strokeWidth={1.6} />
          Portfolio
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total listings" value={stats.totalProperties} href="/admin/properties" />
          <StatTile
            label="Active / published"
            value={stats.publishedProperties}
            hint={`${formatNumber(stats.draftProperties)} draft${stats.draftProperties === 1 ? "" : "s"}`}
            href="/admin/properties?published=published"
          />
          <StatTile label="Sold" value={stats.sold} href="/admin/properties?status=sold" />
          <StatTile label="Pending" value={stats.pending} href="/admin/properties?status=pending" />
        </div>
      </section>

      {/* Lead counters */}
      <section>
        <h2 className="eyebrow mb-5 flex items-center gap-2 text-charcoal">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.6} />
          Leads
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Total enquiries"
            value={stats.totalEnquiries}
            href="/admin/enquiries"
          />
          <StatTile
            label="New — uncontacted"
            value={stats.newEnquiries}
            accent={stats.newEnquiries > 0}
            href="/admin/enquiries?status=new"
          />
          <StatTile
            label="In conversation"
            value={stats.activeLeads}
            hint="Contacted or in progress"
            href="/admin/enquiries?status=in_progress"
          />
          <StatTile
            label="Last 7 days"
            value={stats.enquiriesLast7Days}
            hint={`${formatNumber(stats.closedEnquiries)} closed to date`}
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_1fr]">
        {/* Recent listings */}
        <section className="border border-hairline bg-paper">
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <h2 className="font-display text-[1.25rem] text-charcoal">Recent listings</h2>
            <Link
              href="/admin/properties"
              className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
            >
              All properties
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No listings yet"
                description="Add your first property and it will appear here and on the public site."
                action={
                  <Link
                    href="/admin/properties/new"
                    className="inline-flex items-center gap-2 bg-charcoal px-6 py-3 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Add a property
                  </Link>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {recentProperties.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/admin/properties/${property.id}/edit`}
                    className="flex items-center gap-5 px-6 py-5 transition-colors hover:bg-shell"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-[0.92rem] text-charcoal">
                        {property.title}
                      </p>
                      <p className="mt-1 truncate font-sans text-[0.78rem] text-mist">
                        {shortAddress(property)} · updated {formatRelative(property.updated_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-sans text-[0.86rem] text-charcoal">
                        {formatPrice(property.price, property.price_period)}
                      </p>
                      <div className="mt-1.5 flex items-center justify-end gap-2">
                        {!property.is_published ? (
                          <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-amber-700">
                            Draft
                          </span>
                        ) : null}
                        {property.is_featured ? (
                          <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={1.6} />
                        ) : null}
                        <StatusPill status={property.listing_status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent enquiries */}
        <section className="border border-hairline bg-paper">
          <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
            <h2 className="font-display text-[1.25rem] text-charcoal">Prospect enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-stone transition-colors hover:text-charcoal"
            >
              Manage leads
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No enquiries yet"
                description="Every enquiry submitted on the public site lands here automatically."
              />
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className={cn(
                      "block px-6 py-5 transition-colors hover:bg-shell",
                      enquiry.status === "new" && "border-l-2 border-l-gold bg-gold-pale/25",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-sans text-[0.92rem] text-charcoal">
                          {enquiry.full_name}
                        </p>
                        <p className="mt-0.5 truncate font-sans text-[0.78rem] text-mist">
                          {ENQUIRY_TYPE_LABELS[enquiry.enquiry_type]}
                          {enquiry.property ? ` · ${enquiry.property.title}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 px-2 py-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.14em]",
                          ENQUIRY_STATUS_BADGE_STYLES[enquiry.status],
                        )}
                      >
                        {ENQUIRY_STATUS_LABELS[enquiry.status]}
                      </span>
                    </div>
                    {enquiry.message ? (
                      <p className="mt-2 line-clamp-2 font-sans text-[0.8rem] leading-relaxed text-stone">
                        {enquiry.message}
                      </p>
                    ) : null}
                    <p className="mt-2 flex items-center gap-1.5 font-sans text-[0.72rem] text-mist">
                      <Clock className="h-3 w-3" strokeWidth={1.6} />
                      {formatRelative(enquiry.created_at)} · {enquiry.reference}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
