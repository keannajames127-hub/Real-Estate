import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Photography wrapper.
 *
 * Handles the two kinds of image the site serves:
 *   - Supabase Storage URLs, which go through Next's optimiser (AVIF/WebP,
 *     responsive srcset)
 *   - same-origin `/api/...` paths, which are served directly because
 *     re-encoding an on-demand endpoint through the optimiser is pointless
 *   - `null`, which renders a quiet placeholder rather than a broken image
 */
export function Media({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = "100vw",
  className,
  imageClassName,
  priority = false,
  quality = 78,
}: {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  quality?: number;
}) {
  const isLocalApiAsset = Boolean(src && src.startsWith("/api/"));

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center bg-bone text-mist",
          fill && "absolute inset-0",
          className,
        )}
      >
        <span className="eyebrow text-[0.6rem]">Photography to follow</span>
      </div>
    );
  }

  return (
    <span className={cn(fill ? "absolute inset-0 block" : "relative block", className)}>
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width: width ?? 1200, height: height ?? 800 })}
        sizes={sizes}
        priority={priority}
        quality={quality}
        unoptimized={isLocalApiAsset}
        className={cn("object-cover", imageClassName)}
      />
    </span>
  );
}
