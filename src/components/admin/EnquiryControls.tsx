"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, LoaderCircle, Plus, Trash } from "lucide-react";

import {
  addEnquiryNote,
  deleteEnquiry,
  deleteEnquiryNote,
  updateEnquiryStatus,
} from "@/actions/enquiries";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EnquiryStatus } from "@/types/database";

/**
 * Lead workflow controls.
 *
 * Every control is a thin wrapper over a server action that re-checks the
 * administrator session and revalidates the enquiries routes; the router
 * refresh simply makes the new state visible without a full page load.
 */
export function EnquiryStatusControl({
  enquiryId,
  status,
}: {
  enquiryId: string;
  status: EnquiryStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<EnquiryStatus>(status);

  function apply(next: EnquiryStatus) {
    setError(null);
    const previous = current;
    setCurrent(next);
    startTransition(async () => {
      const result = await updateEnquiryStatus(enquiryId, next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error ?? "Could not update the status.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ENQUIRY_STATUS_OPTIONS.map((option) => {
          const active = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              disabled={pending && active}
              onClick={() => apply(option.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 border px-4 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                active
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-hairline bg-white text-stone hover:border-charcoal hover:text-charcoal",
              )}
            >
              {active ? <Check className="h-3 w-3" strokeWidth={2.2} /> : null}
              {ENQUIRY_STATUS_LABELS[option.value]}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-3 font-sans text-[0.78rem] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryNoteComposer({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!note.trim()) return;
        setError(null);
        startTransition(async () => {
          const result = await addEnquiryNote(enquiryId, note);
          if (!result.ok) {
            setError(result.error ?? "Could not save that note.");
            return;
          }
          setNote("");
          router.refresh();
        });
      }}
      className="space-y-3"
    >
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Add a private note — calls made, viewings booked, next steps…"
        className="w-full border border-hairline bg-white px-4 py-3 font-sans text-[0.88rem] leading-relaxed text-charcoal placeholder:text-mist focus:border-gold focus:outline-none"
      />
      {error ? (
        <p role="alert" className="font-sans text-[0.78rem] text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !note.trim()}
        className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink disabled:opacity-50"
      >
        {pending ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
        )}
        {pending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}

export function DeleteNoteButton({
  noteId,
  enquiryId,
}: {
  noteId: string;
  enquiryId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this note?")) return;
        startTransition(async () => {
          await deleteEnquiryNote(noteId, enquiryId);
          router.refresh();
        });
      }}
      aria-label="Delete note"
      className="flex h-7 w-7 items-center justify-center text-mist transition-colors hover:text-red-700 disabled:opacity-40"
    >
      <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
    </button>
  );
}

export function DeleteEnquiryButton({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Delete this enquiry permanently? Its notes go with it. This cannot be undone.",
            )
          ) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await deleteEnquiry(enquiryId);
            if (!result.ok) {
              setError(result.error ?? "Could not delete that enquiry.");
              return;
            }
            router.push("/admin/enquiries");
          });
        }}
        className="inline-flex items-center gap-2 border border-red-300 bg-white px-5 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-red-700 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
      >
        <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
        {pending ? "Deleting…" : "Delete enquiry"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 font-sans text-[0.78rem] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Read-only list of notes rendered by the detail page (server component). */
