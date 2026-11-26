import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  action?: ReactNode;
}) {
  const isLight = tone === "light";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? (
          <p className={cn("eyebrow mb-4", isLight ? "text-gold-soft" : "text-gold")}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-[2rem] leading-[1.12] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]",
            isLight ? "text-white" : "text-charcoal",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-[1rem] leading-relaxed",
              align === "center" && "mx-auto",
              isLight ? "text-white/70" : "text-stone",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <header
      className={cn(
        "border-b",
        isLight
          ? "border-white/10 bg-charcoal text-white"
          : "border-hairline bg-bone text-charcoal",
      )}
    >
      <div className="mx-auto w-full max-w-[92rem] px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        {eyebrow ? (
          <p className={cn("eyebrow mb-5", isLight ? "text-gold-soft" : "text-gold")}>
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "max-w-4xl text-[2.25rem] leading-[1.08] tracking-[-0.025em] sm:text-[3rem] lg:text-[3.75rem]",
            isLight ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-6 max-w-2xl text-[1.02rem] leading-relaxed",
              isLight ? "text-white/70" : "text-stone",
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-hairline bg-shell px-8 py-20 text-center",
        className,
      )}
    >
      <h3 className="text-[1.5rem] text-charcoal">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md font-sans text-[0.9rem] text-stone">{description}</p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages: number[] = [];
  const window = 2;
  for (let i = 1; i <= pageCount; i += 1) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= window) pages.push(i);
  }

  const items: Array<number | "gap"> = [];
  let previous = 0;
  for (const value of pages) {
    if (previous && value - previous > 1) items.push("gap");
    items.push(value);
    previous = value;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex flex-wrap items-center justify-center gap-1 border-t border-hairline pt-10"
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="mr-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-stone transition-colors hover:text-charcoal"
          rel="prev"
        >
          Prev
        </Link>
      ) : null}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-2 font-sans text-mist">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "flex h-10 w-10 items-center justify-center border font-sans text-[0.8rem] transition-colors",
              item === page
                ? "border-charcoal bg-charcoal text-white"
                : "border-hairline text-stone hover:border-charcoal hover:text-charcoal",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={buildHref(page + 1)}
          className="ml-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-stone transition-colors hover:text-charcoal"
          rel="next"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
