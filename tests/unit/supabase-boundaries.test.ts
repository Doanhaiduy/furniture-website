import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Supabase Client/Server Boundaries", () => {
  it("verifies that lib/supabase/server.ts enforces the server-only boundary", () => {
    const serverFilePath = path.resolve(__dirname, "../../lib/supabase/server.ts");
    const content = fs.readFileSync(serverFilePath, "utf8");
    
    // Assert that 'server-only' is imported to trigger Next.js compilation errors in Client Components
    expect(content).toMatch(/import\s+["']server-only["']/);
  });

  it("verifies that lib/supabase/client.ts is safe for the browser (does not import server-only)", () => {
    const clientFilePath = path.resolve(__dirname, "../../lib/supabase/client.ts");
    const content = fs.readFileSync(clientFilePath, "utf8");
    
    expect(content).not.toMatch(/import\s+["']server-only["']/);
    expect(content).toContain("createBrowserClient");
  });
});
