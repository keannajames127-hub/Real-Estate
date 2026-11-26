import type { ReactNode } from "react";
import { Bath, BedDouble, Maximize } from "lucide-react";

import { LISTING_STATUS_LABELS, LISTING_STATUS_STYLES } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import type { ListingStatus } from "@/types/database";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** "For Sale" / "For Rent" / "Pending" / "Sold" pill used on every card. */
export function StatusPill({
  status,
  className,
}: {
  status: ListingStatus;
  className?: string;
}) {
  return (
    <Badge className={cn("backdrop-blur-sm", LISTING_STATUS_STYLES[status], className)}>
      {LISTING_STATUS_LABELS[status]}
    </Badge>
  );
}

/** Bed / bath / square-footage row shared by cards and the detail page. */
export function PropertySpecs({
  bedrooms,
  bathrooms,
  squareFeet,
  className,
  tone = "dark",
}: {
  bedrooms: number;
  bathrooms: number;
  squareFeet: number | null;
  className?: string;
  tone?: "dark" | "light";
}) {
  const muted = tone === "light" ? "text-white/70" : "text-stone";
  const strong = tone === "light" ? "text-white" : "text-charcoal";

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      <li className={cn("flex items-center gap-2 font-sans text-[0.8rem]", muted)}>
        <BedDouble className="h-4 w-4 shrink-0" strokeWidth={1.4} />
        <span className={strong}>{bedrooms}</span>
        <span className="sr-only">bedrooms</span>
        <span aria-hidden="true">bd</span>
      </li>
      <li className={cn("flex items-center gap-2 font-sans text-[0.8rem]", muted)}>
        <Bath className="h-4 w-4 shrink-0" strokeWidth={1.4} />
        <span className={strong}>{bathrooms}</span>
        <span className="sr-only">bathrooms</span>
        <span aria-hidden="true">ba</span>
      </li>
      {squareFeet ? (
        <li className={cn("flex items-center gap-2 font-sans text-[0.8rem]", muted)}>
          <Maximize className="h-4 w-4 shrink-0" strokeWidth={1.4} />
          <span className={strong}>{formatNumber(squareFeet)}</span>
          <span className="sr-only">square feet</span>
          <span aria-hidden="true">sqft</span>
        </li>
      ) : null}
    </ul>
  );
}
