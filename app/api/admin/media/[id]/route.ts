import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/supabase/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    const session = await requireEditorOrAdmin();
    userId = session.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
  }

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) {
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();

  // Fetch the media asset first (for public_url in audit logs and physical deletion)
  const { data: media } = await supabase
    .from("media_assets")
    .select("public_url, cloudinary_public_id, storage_provider, resource_type")
    .eq("id", id)
    .maybeSingle();

  // If stored in Cloudinary, delete physical file first
  if (media && media.storage_provider === "cloudinary" && media.cloudinary_public_id) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        // Determine correct resource_type for Cloudinary destroy ('image', 'video', or 'raw')
        const resourceType = media.resource_type === "video" ? "video" : "image";
        
        await cloudinary.uploader.destroy(media.cloudinary_public_id, {
          resource_type: resourceType,
        });
      } catch (cloudinaryErr) {
        console.error("Failed to delete physical file from Cloudinary:", cloudinaryErr);
      }
    }
  }

  // Soft delete: status = 'archived', deleted_at = new Date().toISOString()
  const { error } = await supabase
    .from("media_assets")
    .update({
      status: "archived",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to soft delete media asset:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset from database", detail: error.message },
      { status: 500 }
    );
  }

  // Write audit log
  try {
    await writeAuditLog(supabase, {
      actorId: userId,
      action: "delete",
      entityType: "media",
      entityId: id,
      metadata: { public_url: media?.public_url || "unknown" },
    });
  } catch (auditErr) {
    console.warn("Audit log failed for media deletion, continuing anyway:", auditErr);
  }

  return NextResponse.json({ success: true });
}
