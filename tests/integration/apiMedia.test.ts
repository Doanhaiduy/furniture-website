import { describe, it, expect, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema and load env variables inside the factory to prevent hoisting issues
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

import { POST } from "@/app/api/admin/media/upload/route";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Mock requireEditorOrAdmin to bypass API-level auth
vi.mock("@/lib/supabase/auth", () => ({
  requireEditorOrAdmin: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000001", email: "test-editor@furniture.com" }),
}));

// Mock createClient to return the admin client (which bypasses RLS in local testing)
vi.mock("@/lib/supabase/server", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/supabase/server")>();
  return {
    ...original,
    createClient: () => original.createAdminClient(),
  };
});

describe("API /api/admin/media/upload Integration Tests", () => {
  it("should successfully persist media asset with valid payload", async () => {
    const payload = {
      public_id: "test_cloudinary_public_id",
      secure_url: "https://res.cloudinary.com/dcmhbxcgq/image/upload/v12345/test_image.png",
      format: "png",
      bytes: 204800,
      width: 800,
      height: 800,
      original_filename: "test_image.png",
      resource_type: "image",
    };

    const request = new NextRequest("http://localhost/api/admin/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBeDefined();
    expect(json.public_url).toBe(payload.secure_url);

    // Verify DB insertion
    const supabase = createAdminClient();
    const { data: asset, error: aError } = await supabase
      .from("media_assets")
      .select("*")
      .eq("cloudinary_public_id", "test_cloudinary_public_id")
      .single();

    expect(aError).toBeNull();
    expect(asset).toBeDefined();
    expect(asset.original_filename).toBe("test_image.png");
    expect(asset.size_bytes).toBe(204800);

    // Clean up
    await supabase.from("media_assets").delete().eq("id", asset.id);
  });

  it("should return 400 for disallowed format", async () => {
    const payload = {
      public_id: "test_sh_id",
      secure_url: "https://res.cloudinary.com/dcmhbxcgq/raw/upload/v12345/attack.sh",
      format: "sh",
      bytes: 100,
    };

    const request = new NextRequest("http://localhost/api/admin/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("is not allowed");
  });

  it("should return 400 for non-Cloudinary URL", async () => {
    const payload = {
      public_id: "test_malicious",
      secure_url: "https://malicious-site.com/attack.png",
      format: "png",
      bytes: 200,
    };

    const request = new NextRequest("http://localhost/api/admin/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain("URL must be from Cloudinary");
  });
});
