import { STORAGE_BUCKET } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export interface UploadedImage {
  url: string;
  storage_path: string;
}

/** Raised when a photograph could not be stored, with a message safe to show an admin. */
export class ImageUploadError extends Error {}

function extensionFor(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  return ext || "jpg";
}

/**
 * Stores one photograph.
 *
 * Live deployments write into the Supabase storage bucket; local test mode writes
 * into `public/uploads` through the development-only `/api/local-upload` route.
 */
export async function uploadImageFile(file: File, folder = ""): Promise<UploadedImage> {
  if (isSupabaseConfigured()) {
    const key = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${extensionFor(file.name)}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(key, file, { cacheControl: "31536000", upsert: false, contentType: file.type });

    if (error) {
      const refused =
        error.message.includes("row-level security") || error.message.includes("policy");
      throw new ImageUploadError(
        refused
          ? "Upload refused by storage policy. Confirm you are signed in as an administrator."
          : `Could not upload “${file.name}”: ${error.message}`,
      );
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(key);
    return { url: data.publicUrl, storage_path: key };
  }

  const body = new FormData();
  body.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/local-upload", { method: "POST", body });
  } catch {
    throw new ImageUploadError(`Could not upload “${file.name}” to this computer.`);
  }

  const result = (await response.json().catch(() => ({}))) as {
    url?: string;
    storage_path?: string;
    error?: string;
  };
  if (!response.ok || !result.url || !result.storage_path) {
    throw new ImageUploadError(result.error ?? `Could not upload “${file.name}”.`);
  }
  return { url: result.url, storage_path: result.storage_path };
}

/** Best-effort removal so replaced photographs do not linger in storage. */
export async function deleteImageFile(storagePath: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return;
  }
  await fetch(`/api/local-upload?path=${encodeURIComponent(storagePath)}`, { method: "DELETE" });
}
