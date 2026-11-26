"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import {
  BEDROOM_OPTIONS,
  PRICE_BRACKETS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PropertySearchBarProps {
  cities?: string[];
  variant?: "hero" | "panel";
  className?: string;
  defaults?: {
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    beds?: string;
  };
}

export function PropertySearchBar({
  cities = [],
  variant = "hero",
  className,
  defaults = {},
}: PropertySearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState(defaults.q ?? "");
  const [bracket, setBracket] = useState(() => {
    const index = PRICE_BRACKETS.findIndex(
      (item) => (item.min || "") === (defaults.minPrice ?? "") && (item.max || "") === (defaults.maxPrice ?? ""),
    );
    return index >= 0 ? String(index) : "0";
  });
  const [type, setType] = useState(defaults.type ?? "");
  const [beds, setBeds] = useState(defaults.beds ?? "");

  const isHero = variant === "hero";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("q", location.trim());

    const selected = PRICE_BRACKETS[Number(bracket)] ?? PRICE_BRACKETS[0]!;
    if (selected.min) params.set("minPrice", String(selected.min));
    if (selected.max) params.set("maxPrice", String(selected.max));
    if (type) params.set("type", type);
    if (beds) params.set("beds", beds);

    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  const fieldClass = cn(
    "w-full border-0 border-b bg-transparent px-0 py-3 font-sans text-[0.92rem] outline-none transition-colors",
    isHero
      ? "border-white/25 text-white placeholder:text-white/50 focus:border-gold-soft [&>option]:text-charcoal"
      : "border-hairline text-charcoal placeholder:text-mist focus:border-gold",
  );

  const labelClass = cn(
    "eyebrow mb-1 block text-[0.58rem]",
    isHero ? "text-white/60" : "text-stone",
  );

  const chevron = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="none"><path d="M1 1.5 6 6.5l5-5" stroke="${
      isHero ? "%23ffffff" : "%236f6d66"
    }" stroke-width="1.4"/></svg>`,
  );

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Property search"
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end lg:gap-8",
        isHero ? "lg:gap-9" : "border border-hairline bg-paper p-6 lg:p-8",
        className,
      )}
    >
      <div>
        <label className={labelClass} htmlFor="search-location">
          Location
        </label>
        <input
          id="search-location"
          name="q"
          list="search-cities"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City, neighborhood or ZIP"
          className={fieldClass}
        />
        {cities.length > 0 ? (
          <datalist id="search-cities">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="search-price">
          Price range
        </label>
        <select
          id="search-price"
          name="price"
          value={bracket}
          onChange={(event) => setBracket(event.target.value)}
          className={cn(fieldClass, "appearance-none pr-6")}
          style={{
            backgroundImage: `url("data:image/svg+xml,${chevron}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0 center",
            backgroundSize: "11px",
          }}
        >
          {PRICE_BRACKETS.map((item, index) => (
            <option key={item.label} value={String(index)}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="search-type">
          Property type
        </label>
        <select
          id="search-type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className={cn(fieldClass, "appearance-none pr-6")}
          style={{
            backgroundImage: `url("data:image/svg+xml,${chevron}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0 center",
            backgroundSize: "11px",
          }}
        >
          <option value="">Any type</option>
          {PROPERTY_TYPE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="search-beds">
          Bedrooms
        </label>
        <select
          id="search-beds"
          name="beds"
          value={beds}
          onChange={(event) => setBeds(event.target.value)}
          className={cn(fieldClass, "appearance-none pr-6")}
          style={{
            backgroundImage: `url("data:image/svg+xml,${chevron}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0 center",
            backgroundSize: "11px",
          }}
        >
          {BEDROOM_OPTIONS.map((item) => (
            <option key={item.label} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={cn(
          "inline-flex items-center justify-center gap-2 px-8 py-3.5 font-sans text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-300",
          isHero
            ? "bg-white text-ink hover:bg-gold hover:text-white"
            : "bg-charcoal text-white hover:bg-ink",
          "h-[46px] w-full sm:col-span-2 lg:col-span-1 lg:w-auto",
        )}
      >
        <Search className="h-4 w-4" strokeWidth={1.5} />
        Search
      </button>
    </form>
  );
}
