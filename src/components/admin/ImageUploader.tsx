"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash,
  Triangle,
} from "lucide-react";

import { Media } from "@/components/site/Media";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";
import { isLocalTestMode, isSupabaseConfigured } from "@/lib/env";
import { ImageUploadError, deleteImageFile, uploadImageFile } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

export interface UploaderImage {
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
}

function humanSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploader({
  initialImages,
  propertyTitle,
}: {
  initialImages: UploaderImage[];
  propertyTitle: string;
}) {
  const [images, setImages] = useState<UploaderImage[]>(initialImages);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabaseConfigured = isSupabaseConfigured();
  const localTestMode = isLocalTestMode();
  const canManageImages = supabaseConfigured || localTestMode;

  function normalise(next: UploaderImage[]): UploaderImage[] {
    const withCover = next.length > 0 && !next.some((image) => image.is_cover);
    return next.map((image, index) => ({
      ...image,
      sort_order: index,
      is_cover: withCover ? index === 0 : image.is_cover,
    }));
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    if (!canManageImages) {
      setError("Photo uploads are unavailable until a live storage provider is configured.");
      return;
    }

    setError(null);
    setBusy(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: UploaderImage[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]!;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`“${file.name}” is not a supported image (JPEG, PNG, WebP or AVIF).`);
        setProgress({ done: index + 1, total: files.length });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`“${file.name}” is ${humanSize(file.size)} — the limit is 15 MB.`);
        setProgress({ done: index + 1, total: files.length });
        continue;
      }

      try {
        const stored = await uploadImageFile(file, new Date().toISOString().slice(0, 10));
        uploaded.push({
          url: stored.url,
          storage_path: stored.storage_path,
          alt_text: propertyTitle || null,
          sort_order: 0,
          is_cover: false,
        });
      } catch (uploadError) {
        setError(
          uploadError instanceof ImageUploadError
            ? uploadError.message
            : `Could not upload “${file.name}”.`,
        );
      }
      setProgress({ done: index + 1, total: files.length });
    }

    setImages((current) => normalise([...current, ...uploaded]));
    setBusy(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addByUrl() {
    if (!canManageImages) {
      setError("Photo changes are unavailable until a live database is configured.");
      return;
    }

    const value = window.prompt("Paste an image URL");
    if (!value) return;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) {
      setError("That does not look like a valid image URL.");
      return;
    }
    setError(null);
    setImages((current) =>
      normalise([
        ...current,
        {
          url: trimmed,
          storage_path: null,
          alt_text: propertyTitle || null,
          sort_order: current.length,
          is_cover: false,
        },
      ]),
    );
  }

  function move(index: number, delta: number) {
    setImages((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return normalise(next);
    });
  }

  function setCover(index: number) {
    setImages((current) =>
      current.map((image, position) => ({ ...image, is_cover: position === index })),
    );
  }

  async function remove(index: number) {
    const target = images[index];
    setImages((current) => normalise(current.filter((_, position) => position !== index)));

    // Best-effort cleanup so the bucket does not accumulate orphaned objects.
    if (target?.storage_path) {
      await deleteImageFile(target.storage_path).catch(() => {});
    }
  }

  return (
    <div className="space-y-5">
      <input type="hidden" name="images_json" value={JSON.stringify(images)} />

      {localTestMode ? (
        <p role="status" className="border border-gold/30 bg-gold-pale/30 px-4 py-3 font-sans text-[0.82rem] text-charcoal">
          Local test mode: property changes and photos are saved on this PC only. They are not sent to a live website.
        </p>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files) void uploadFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-gold bg-gold-pale/30" : "border-hairline bg-shell",
        )}
      >
        <ImagePlus className="h-6 w-6 text-gold" strokeWidth={1.4} />
        <p className="mt-4 font-sans text-[0.9rem] text-charcoal">
          Drag photographs here, or choose files
        </p>
        <p className="mt-2 font-sans text-[0.76rem] text-mist">
          JPEG, PNG, WebP or AVIF · up to 15 MB each · the first image is the cover
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={busy || !canManageImages}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-ink disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.6} />}
            {busy && progress ? `Uploading ${progress.done}/${progress.total}` : "Choose files"}
          </button>
          <button
            type="button"
            disabled={busy || !canManageImages}
            onClick={addByUrl}
            className="font-sans text-[0.72rem] uppercase tracking-[0.16em] text-stone underline underline-offset-4 transition-colors hover:text-charcoal disabled:opacity-50"
          >
            Add by URL
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          disabled={!canManageImages}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files);
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 font-sans text-[0.82rem] text-red-800">
          <Triangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      ) : null}

      {images.length === 0 ? (
        <p className="font-sans text-[0.82rem] text-mist">
          No photographs yet. A listing without photography will show a placeholder on the public
          site.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="border border-hairline bg-paper">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-bone">
                <Media src={image.url} alt={image.alt_text ?? ""} sizes="(max-width: 640px) 50vw, 240px" />
                {image.is_cover ? (
                  <span className="absolute left-2 top-2 bg-gold px-2 py-1 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-white">
                    Cover
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-1 border-t border-hairline px-2 py-2">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-charcoal disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move later"
                    className="flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-charcoal disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    disabled={image.is_cover}
                    aria-label="Make cover image"
                    className="flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-gold disabled:opacity-30"
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(index)}
                    aria-label="Remove photograph"
                    className="flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-red-700"
                  >
                    <Trash className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
