import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema
vi.mock("@/lib/env/schema", () => {
  const fs = require("fs");
  const path = require("path");
  const localEnv: Record<string, string> = {};
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line: string) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        localEnv[key] = value.trim();
        process.env[key] = value.trim();
      }
    });
  }
  return {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: localEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: localEnv.SUPABASE_SERVICE_ROLE_KEY,
    },
    validateEnv: () => ({}),
  };
});

// Mock requireEditorOrAdmin to bypass API-level auth
vi.mock("@/lib/supabase/auth", () => ({
  requireEditorOrAdmin: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000001", email: "test-editor@furniture.com" }),
}));

import { GET } from "@/app/api/admin/media/list/route";
import { DELETE } from "@/app/api/admin/media/[id]/route";
import { createAdminClient } from "@/lib/supabase/server";

// Mock createClient to return admin client to bypass RLS in vitest environment
vi.mock("@/lib/supabase/server", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/supabase/server")>();
  return {
    ...original,
    createClient: () => original.createAdminClient(),
  };
});

describe("Admin Media Actions API Integration Tests", () => {
  beforeEach(() => {
    // Delete Cloudinary keys to bypass external API calls during integration tests
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });
  it("GET /api/admin/media/list should return list of assets", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.assets).toBeDefined();
    expect(Array.isArray(json.assets)).toBe(true);
  });

  it("DELETE /api/admin/media/[id] should soft delete assets", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
    const supabase = createAdminClient();

    // Insert a temp media asset
    const uniqueId = `temp_delete_test_${Date.now()}`;
    const { data: asset, error: insertError } = await supabase
      .from("media_assets")
      .insert({
        public_url: `https://res.cloudinary.com/dcmhbxcgq/image/upload/v12345/${uniqueId}.png`,
        cloudinary_public_id: uniqueId,
        storage_provider: "cloudinary",
        resource_type: "image",
        mime_type: "image/png", // satisfies not-null constraint
        original_filename: `${uniqueId}.png`, // satisfies not-null constraint
        format: "png",
        size_bytes: 1024,
        width: 100,
        height: 100,
      })
      .select("id")
      .single();

    expect(insertError).toBeNull();
    expect(asset).toBeDefined();
    if (!asset) throw new Error("asset is null");

    // Call DELETE API
    const response = await DELETE(new Request(`http://localhost/api/admin/media/${asset.id}`), {
      params: Promise.resolve({ id: asset.id }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify it is archived and deleted_at is set in DB
    const { data: updatedAsset } = await supabase
      .from("media_assets")
      .select("status, deleted_at")
      .eq("id", asset.id)
      .single();

    if (!updatedAsset) throw new Error("updatedAsset is null");
    expect(updatedAsset.status).toBe("archived");
    expect(updatedAsset.deleted_at).not.toBeNull();

    // Clean up completely
    await supabase.from("media_assets").delete().eq("id", asset.id);
  });
});
