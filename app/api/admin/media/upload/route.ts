import { NextResponse, type NextRequest } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_FORMATS = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg",
  "mp4", "webm",
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  // Auth check
  let userId: string;
  try {
    const session = await requireEditorOrAdmin();
    userId = session.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    public_id?: string;
    secure_url?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    original_filename?: string;
    resource_type?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { public_id, secure_url, format, bytes, width, height, original_filename, resource_type } = body;

  // Validate required fields
  if (!public_id || !secure_url || !format) {
    return NextResponse.json(
      { error: "Missing required fields: public_id, secure_url, format" },
      { status: 400 }
    );
  }

  // Validate format whitelist
  const normalizedFormat = format.toLowerCase().replace(".", "");
  if (!ALLOWED_FORMATS.has(normalizedFormat)) {
    return NextResponse.json(
      { error: `Format '${format}' is not allowed. Allowed formats: ${[...ALLOWED_FORMATS].join(", ")}` },
      { status: 400 }
    );
  }

  // Validate file size
  if (bytes && bytes > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File size ${bytes} bytes exceeds maximum of ${MAX_SIZE_BYTES} bytes (50MB)` },
      { status: 400 }
    );
  }

  // Validate URL is from Cloudinary
  if (!secure_url.startsWith("https://res.cloudinary.com/")) {
    return NextResponse.json(
      { error: "URL must be from Cloudinary" },
      { status: 400 }
    );
  }

  // Determine MIME type from format
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  const mimeType = mimeMap[normalizedFormat] || `${resource_type || "image"}/${normalizedFormat}`;

  // Persist to media_assets
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("media_assets")
    .insert({
      storage_provider: "cloudinary",
      public_id,
      public_url: secure_url,
      size_bytes: bytes ?? 0,
      mime_type: mimeType,
      format: normalizedFormat,
      width: width ?? null,
      height: height ?? null,
      original_filename: original_filename ?? null,
      uploaded_by: userId,
    })
    .select("id, public_url, created_at")
    .single();

  if (error || !inserted) {
    console.error("Failed to persist media_assets row:", error);
    return NextResponse.json(
      { error: "Failed to save media asset to database", detail: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: inserted.id,
    public_url: inserted.public_url,
    created_at: inserted.created_at,
  });
}
