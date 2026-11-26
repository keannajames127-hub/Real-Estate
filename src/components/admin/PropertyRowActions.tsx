"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Sparkles, Trash } from "lucide-react";

import {
  deleteProperty,
  setFeaturedState,
  setListingStatus,
  setPublishState,
} from "@/actions/properties";
import { LISTING_STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types/database";

/**
 * Inline controls for one row of the admin listings table.
 *
 * Every action revalidates the public catalogue on the server, then we refresh
 * the router so the table itself reflects the new state immediately.
 */
export function PropertyRowActions({
  id,
  isPublished,
  isFeatured,
  listingStatus,
}: {
  id: string;
  isPublished: boolean;
  isFeatured: boolean;
  listingStatus: ListingStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(task: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "That did not work.");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {error ? (
        <p role="alert" className="w-full text-right font-sans text-[0.7rem] text-red-700">
          {error}
        </p>
      ) : null}

      <select
        aria-label="Listing status"
        value={listingStatus}
        disabled={pending}
        onChange={(event) =>
          run(() => setListingStatus(id, event.target.value as ListingStatus))
        }
        className="border border-hairline bg-white px-2 py-1.5 font-sans text-[0.72rem] text-charcoal focus:border-gold focus:outline-none disabled:opacity-50"
      >
        {LISTING_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setPublishState(id, !isPublished))}
        title={isPublished ? "Unpublish" : "Publish"}
        className={cn(
          "flex h-8 w-8 items-center justify-center border transition-colors disabled:opacity-40",
          isPublished
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-600"
            : "border-hairline text-stone hover:border-charcoal hover:text-charcoal",
        )}
      >
        {isPublished ? (
          <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />
        ) : (
          <EyeOff className="h-3.5 w-3.5" strokeWidth={1.6} />
        )}
        <span className="sr-only">{isPublished ? "Unpublish" : "Publish"}</span>
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setFeaturedState(id, !isFeatured))}
        title={isFeatured ? "Remove from featured" : "Mark as featured"}
        className={cn(
          "flex h-8 w-8 items-center justify-center border transition-colors disabled:opacity-40",
          isFeatured
            ? "border-gold/50 bg-gold-pale/50 text-gold-deep hover:border-gold"
            : "border-hairline text-mist hover:border-charcoal hover:text-charcoal",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
        <span className="sr-only">{isFeatured ? "Unfeature" : "Feature"}</span>
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Delete this listing permanently? Its photographs stay in storage but the listing and its gallery are removed.",
            )
          ) {
            return;
          }
          run(() => deleteProperty(id));
        }}
        title="Delete listing"
        className="flex h-8 w-8 items-center justify-center border border-hairline text-stone transition-colors hover:border-red-600 hover:text-red-700 disabled:opacity-40"
      >
        <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
        <span className="sr-only">Delete</span>
      </button>
    </div>
  );
}
