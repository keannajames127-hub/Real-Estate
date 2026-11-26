import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const CONTROL =
  "w-full border border-hairline bg-white px-4 py-3 font-sans text-[0.9rem] text-charcoal " +
  "transition-colors duration-200 placeholder:text-mist " +
  "focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-bone disabled:text-mist";

export function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("eyebrow mb-2 block text-stone", className)}
    >
      {children}
      {required ? <span className="ml-1 text-gold">*</span> : null}
    </label>
  );
}

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label + control + error/hint, with consistent vertical rhythm. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="mt-2 font-sans text-[0.78rem] text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 font-sans text-[0.78rem] text-mist">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(CONTROL, invalid && "border-red-400 focus:border-red-600", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        CONTROL,
        "min-h-[140px] resize-y leading-relaxed",
        invalid && "border-red-400 focus:border-red-600",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          CONTROL,
          "appearance-none pr-10",
          invalid && "border-red-400 focus:border-red-600",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-stone"
        fill="none"
      >
        <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

export function Checkbox({
  className,
  label,
  description,
  ...props
}: ComponentProps<"input"> & { label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 select-none">
      <input
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-gold)]",
          className,
        )}
        {...props}
      />
      <span className="font-sans text-[0.88rem] leading-snug text-charcoal">
        {label}
        {description ? (
          <span className="mt-0.5 block text-[0.78rem] text-mist">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

/** Inline form-level error / success banner. */
export function FormBanner({
  tone,
  title,
  children,
}: {
  tone: "error" | "success" | "info";
  title?: string;
  children?: ReactNode;
}) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    info: "border-hairline bg-bone text-charcoal",
  } as const;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("border px-4 py-3 font-sans text-[0.85rem]", tones[tone])}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
    </div>
  );
}
