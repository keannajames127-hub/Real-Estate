"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Triangle, X } from "lucide-react";

import { Media } from "@/components/site/Media";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";
import { isLocalTestMode, isSupabaseConfigured } from "@/lib/env";
import { ImageUploadError, deleteImageFile, uploadImageFile } from "@/lib/upload-image";

/**
 * Portrait picker for a team member (founder, co-founder or advisor).
 *
 * The chosen image is carried in a hidden `photo_url` field, so `saveAgent`
 * stores it exactly like a pasted URL — but the admin uploads a file from this
 * computer instead of having to host the picture elsewhere first.
 */
export function PortraitUploader({
  initialUrl,
  inputId,
  alt = "",
}: {
  initialUrl?: string | null;
  inputId?: string;
  alt?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canUpload = isSupabaseConfigured() || isLocalTestMode();

  async function pick(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is larger than 15 MB.");
      return;
    }

    setError(null);
    setBusy(true);
    const previous = storagePath;

    try {
      const stored = await uploadImageFile(file, "advisors");
      setUrl(stored.url);
      setStoragePath(stored.storage_path);
      if (previous) await deleteImageFile(previous).catch(() => {});
    } catch (uploadError) {
      setError(
        uploadError instanceof ImageUploadError
          ? uploadError.message
          : "Could not upload that image.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function clear() {
    const previous = storagePath;
    setUrl("");
    setStoragePath(null);
    setError(null);
    if (previous) await deleteImageFile(previous).catch(() => {});
  }

  function addByUrl() {
    const value = window.prompt("Paste an image URL");
    if (!value) return;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) {
      setError("That does not look like a valid image URL.");
      return;
    }
    setError(null);
    setUrl(trimmed);
    setStoragePath(null);
  }

  const buttonClass =
    "inline-flex items-center gap-2 border border-charcoal/25 px-4 py-2 font-sans text-[0.66rem] uppercase tracking-[0.16em] text-charcoal transition-colors hover:border-charcoal disabled:opacity-50";

  return (
    <div className="space-y-3">
      <input type="hidden" name="photo_url" value={url} />

      {url ? (
        <div className="flex items-start gap-4">
          <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden border border-hairline bg-bone">
            <Media src={url} alt={alt} sizes="96px" />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              disabled={busy || !canUpload}
              onClick={() => inputRef.current?.click()}
              className={buttonClass}
            >
              {busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.6} />
              )}
              {busy ? "Uploading…" : "Replace photo"}
            </button>
            <button
              type="button"
              disabled={busy || !canUpload}
              onClick={addByUrl}
              className="font-sans text-[0.66rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal disabled:opacity-50"
            >
              Use image URL
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void clear()}
              className="inline-flex items-center gap-2 font-sans text-[0.66rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-red-700 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.6} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 border border-dashed border-hairline bg-shell px-5 py-4">
          <ImagePlus className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.86rem] text-charcoal">No portrait yet</p>
            <p className="mt-0.5 font-sans text-[0.74rem] text-mist">
              JPEG, PNG, WebP or AVIF · up to 15 MB
            </p>
          </div>
          <button
            type="button"
            disabled={busy || !canUpload}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 font-sans text-[0.66rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.6} />
            )}
            {busy ? "Uploading…" : "Upload photo"}
          </button>
          <button
            type="button"
            disabled={busy || !canUpload}
            onClick={addByUrl}
            className="font-sans text-[0.66rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal disabled:opacity-50"
          >
            Use image URL
          </button>
        </div>
      )}

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 font-sans text-[0.82rem] text-red-800"
        >
          <Triangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        disabled={!canUpload}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void pick(file);
        }}
      />
    </div>
  );
}
