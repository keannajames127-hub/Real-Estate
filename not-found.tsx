import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="eyebrow text-gold">Error 404</p>
        <h1 className="mt-6 font-display text-[2.4rem] leading-tight text-ink sm:text-[3rem]">
          This address is off the market.
        </h1>
        <p className="mt-5 font-sans text-[0.95rem] leading-relaxed text-stone">
          The page you were looking for has been moved, withdrawn or never existed. Let us help
          you find something exceptional instead.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/properties"
            className="inline-flex items-center bg-charcoal px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"
          >
            Browse listings
          </Link>
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
