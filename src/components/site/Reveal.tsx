"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealTag = "div" | "section" | "article" | "li" | "span" | "figure";

/**
 * Fades and lifts its children into view the first time they enter the
 * viewport. Pure CSS transitions driven by one IntersectionObserver — no
 * animation library, so the cost stays close to zero.
 *
 * Users who prefer reduced motion get the content immediately (see globals.css).
 */
export function Reveal({
  as = "div",
  className,
  delay = 0,
  children,
}: {
  as?: RevealTag;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = as as "div";

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("reveal", visible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
