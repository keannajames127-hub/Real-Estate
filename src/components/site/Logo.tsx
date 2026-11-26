import { cn } from "@/lib/utils";

interface LogoProps {
  /** "dark" renders for light backgrounds (navy mark), "light" for dark backgrounds (cream mark). */
  variant?: "dark" | "light";
  /** Show the "DANISH HOME PROPERTIES" subtitle under the wordmark. */
  withSubtitle?: boolean;
  className?: string;
}

/**
 * The DSHP wordmark — a house-in-circle mark paired with the brokerage name.
 *
 * The mark is drawn as inline SVG so it scales crisply and recolours with the
 * `variant` prop. On dark surfaces (footer, hero) the mark is cream; on light
 * surfaces (header, cards) it is the brand navy.
 */
export function Logo({ variant = "dark", withSubtitle = true, className }: LogoProps) {
  const isLight = variant === "light";
  const mark = isLight ? "#faf3e3" : "#052b4f";
  const title = isLight ? "#ffffff" : "#052b4f";
  const subtitle = isLight ? "rgba(255,255,255,0.6)" : "#6f6d66";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 48 48"
        className="h-12 w-12 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="24" cy="22" r="15" fill="none" stroke={mark} strokeWidth="1.6" />
        <path
          d="M14 25 L24 14 L34 25 L31.5 25 L31.5 36 L16.5 36 L16.5 25 Z"
          fill={mark}
        />
        <rect x="19.8" y="21.5" width="2.7" height="2.7" fill={variant === "light" ? "#052b4f" : "#ffffff"} />
        <rect x="25.5" y="21.5" width="2.7" height="2.7" fill={variant === "light" ? "#052b4f" : "#ffffff"} />
        <rect x="19.8" y="25.5" width="2.7" height="2.7" fill={variant === "light" ? "#052b4f" : "#ffffff"} />
        <rect x="25.5" y="25.5" width="2.7" height="2.7" fill={variant === "light" ? "#052b4f" : "#ffffff"} />
        <rect x="30.5" y="17.5" width="3.4" height="7.5" fill={mark} />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.35rem] tracking-[0.02em] sm:text-[1.5rem]"
          style={{ color: title }}
        >
          DSHP
        </span>
        {withSubtitle ? (
          <span
            className="eyebrow mt-1 text-[0.52rem] tracking-[0.24em]"
            style={{ color: subtitle }}
          >
            DANISH HOME PROPERTIES
          </span>
        ) : null}
      </span>
    </span>
  );
}
