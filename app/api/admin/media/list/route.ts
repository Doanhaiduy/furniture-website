import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireEditorOrAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url, format, size_bytes, width, height, original_filename, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch media assets" }, { status: 500 });
  }

  return NextResponse.json({ assets: data ?? [] });
}
