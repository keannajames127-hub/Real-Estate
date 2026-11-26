"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Media } from "@/components/site/Media";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt_text?: string | null;
}

export function Gallery({
  images,
  title,
  statusSlot,
}: {
  images: GalleryImage[];
  title: string;
  statusSlot?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = images.length;
  const go = useCallback(
    (delta: number) => setActive((current) => (current + delta + total) % total),
    [total],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bone">
        <Media src={null} alt={title} sizes="100vw" />
        {statusSlot ? <div className="absolute left-5 top-5">{statusSlot}</div> : null}
      </div>
    );
  }

  const current = images[Math.min(active, total - 1)]!;

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bone">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open larger images"
          className="absolute inset-0 z-10 cursor-zoom-in"
        />
        <Media
          src={current.url}
          alt={current.alt_text || `${title} — photograph ${active + 1}`}
          sizes="100vw"
          priority
          className="transition-opacity duration-500"
          imageClassName=""
        />
        {statusSlot ? <div className="absolute left-5 top-5 z-20">{statusSlot}</div> : null}

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photograph"
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/85 text-charcoal backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photograph"
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/85 text-charcoal backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="absolute bottom-5 right-5 z-20 bg-ink/70 px-3 py-1.5 font-sans text-[0.68rem] tracking-[0.14em] text-white backdrop-blur-sm">
              {active + 1} / {total}
            </div>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photograph ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden border transition-all duration-300",
                index === active
                  ? "border-gold opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Media
                src={image.url}
                alt=""
                sizes="112px"
                imageClassName="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photographs`}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/97"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
              {active + 1} / {total}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close gallery"
              className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-white"
            >
              <X className="h-6 w-6" strokeWidth={1.4} />
            </button>
          </div>

          <div className="relative flex-1">
            <Media
              src={current.url}
              alt={current.alt_text || `${title} — photograph ${active + 1}`}
              sizes="100vw"
              imageClassName="object-contain"
            />
            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photograph"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white"
                >
                  <ChevronLeft className="h-7 w-7" strokeWidth={1.2} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photograph"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/70 transition-colors hover:text-white"
                >
                  <ChevronRight className="h-7 w-7" strokeWidth={1.2} />
                </button>
              </>
            ) : null}
          </div>

          <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-6 py-5">
            {images.map((image, index) => (
              <button
                key={`lb-${image.url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photograph ${index + 1}`}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden border transition-opacity",
                  index === active ? "border-gold" : "border-transparent opacity-50 hover:opacity-90",
                )}
              >
                <Media src={image.url} alt="" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
