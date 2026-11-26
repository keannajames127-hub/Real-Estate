"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the fault in the server logs / browser console for diagnosis.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow text-gold">Something went wrong</p>
        <h1 className="mt-6 font-display text-[2.4rem] leading-tight text-ink sm:text-[3rem]">
          We hit an unexpected snag.
        </h1>
        <p className="mt-5 font-sans text-[0.95rem] leading-relaxed text-stone">
          The page could not be displayed just now. Please try again — if the problem persists,
          contact us and we will look into it.
        </p>

        {error.digest ? (
          <p className="mt-5 font-mono text-[0.72rem] text-mist">Reference: {error.digest}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center bg-charcoal px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center border border-hairline bg-paper px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-charcoal transition-colors hover:border-charcoal"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
