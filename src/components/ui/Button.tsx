import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "outlineLight" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-charcoal text-white hover:bg-ink border border-charcoal hover:border-ink",
  gold: "bg-gold text-white hover:bg-gold-deep border border-gold hover:border-gold-deep",
  outline:
    "border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white",
  outlineLight:
    "border border-white/35 text-white hover:bg-white hover:text-ink hover:border-white",
  ghost: "border border-transparent text-charcoal hover:bg-bone",
  danger:
    "border border-red-300 bg-white text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.7rem] tracking-[0.16em]",
  md: "px-6 py-3 text-[0.72rem] tracking-[0.18em]",
  lg: "px-9 py-4 text-[0.75rem] tracking-[0.2em]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-medium uppercase " +
  "transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "disabled:cursor-not-allowed disabled:opacity-50 select-none";

export interface ButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
