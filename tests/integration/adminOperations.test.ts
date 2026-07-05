import { describe, it, expect, vi } from "vitest";

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

import { PUT } from "@/app/api/admin/settings/route";
import { createAdminClient } from "@/lib/supabase/server";

// Mock auth check
vi.mock("@/lib/supabase/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000002", email: "admin@furniture.com", role: "admin" }),
  requireEditorOrAdmin: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000002", email: "admin@furniture.com" }),
}));

describe("Admin Operations Integration Tests", () => {
  it("PUT /api/admin/settings should reject invalid input", async () => {
    const invalidPayload = {
      brandNameVi: "", // Required text is missing/empty
      contactPhone: "abc",
      contactEmail: "invalid-email",
      addressVi: "Test Address",
    };

    const request = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidPayload),
    });

    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Dữ liệu cấu hình không hợp lệ");
  });

  it("should successfully execute RPC update_quote_status via Supabase admin client", async () => {
    const supabase = createAdminClient();
    
    // Insert a temp quote request
    const { data: quote, error: insertError } = await supabase
      .from("quote_requests")
      .insert({
        full_name: "RPC Temp User",
        phone: "0999888777",
        message: "This is a temp message from admin operations integration test.",
        status: "new",
        preferred_locale: "vi",
        source_path: "/test"
      })
      .select("id")
      .single();

    expect(insertError).toBeNull();
    expect(quote).toBeDefined();
    if (!quote) throw new Error("quote is null");

    // Call update_quote_status RPC using an authenticated session client
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const sessionClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    const { error: signInError } = await sessionClient.auth.signInWithPassword({
      email: "admin@furniture.com",
      password: "password123"
    });
    expect(signInError).toBeNull();

    const { data: rpcData, error: rpcError } = await sessionClient.rpc("update_quote_status", {
      p_quote_id: quote.id,
      p_new_status: "contacted",
      p_note: "Contacted this lead successfully in integration test"
    });

    expect(rpcError).toBeNull();
    expect(rpcData.success).toBe(true);

    // Verify it changed in DB
    const { data: updatedQuote } = await supabase
      .from("quote_requests")
      .select("status")
      .eq("id", quote.id)
      .single();

    if (!updatedQuote) throw new Error("updatedQuote is null");
    expect(updatedQuote.status).toBe("contacted");

    // Clean up
    await supabase.from("quote_request_events").delete().eq("quote_request_id", quote.id);
    await supabase.from("quote_requests").delete().eq("id", quote.id);
  });
});
