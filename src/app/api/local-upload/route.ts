import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const UPLOAD_DIRECTORY = join(process.cwd(), "public", "uploads");

function localModeUnavailable() {
  return (
    process.env.NODE_ENV !== "development" ||
    isSupabaseConfigured()
  );
}

export async function POST(request: Request) {
  if (localModeUnavailable()) {
    return NextResponse.json({ error: "Local uploads are only available in local test mode." }, { status: 404 });
  }

  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Supported image formats are JPEG, PNG, WebP and AVIF." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Images must be between 1 byte and 15 MB." }, { status: 400 });
  }

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(
    join(UPLOAD_DIRECTORY, filename),
    Buffer.from(await file.arrayBuffer()),
    { flag: "wx" },
  );

  return NextResponse.json({
    url: `/uploads/${filename}`,
    storage_path: filename,
  });
}

export async function DELETE(request: Request) {
  if (localModeUnavailable()) {
    return NextResponse.json({ error: "Local uploads are only available in local test mode." }, { status: 404 });
  }

  await requireAdmin();
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/i.test(path)) {
    return NextResponse.json({ error: "Invalid local image path." }, { status: 400 });
  }

  try {
    await unlink(join(UPLOAD_DIRECTORY, path));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  return NextResponse.json({ ok: true });
}
