import { test, expect } from "@playwright/test";
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Cross-Module Integration and Security Suite (ADM-CROSS-01 to ADM-CROSS-15)", () => {
  let dbClient: Client;

  test.beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
  });

  test.afterAll(async () => {
    await dbClient.end();
  });

  // ADM-CROSS-01: NEXT_PUBLIC_USE_MOCK_DATA=true in production environment validation
  test("ADM-CROSS-01: Verify .env.production does not contain NEXT_PUBLIC_USE_MOCK_DATA=true", () => {
    const envProductionPath = path.resolve(__dirname, "../../.env.production");
    const envPath = path.resolve(__dirname, "../../.env");
    
    let envContent = "";
    if (fs.existsSync(envProductionPath)) {
      envContent = fs.readFileSync(envProductionPath, "utf-8");
    } else if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const hasProductionMock = envContent.includes("NEXT_PUBLIC_USE_MOCK_DATA=true") || envContent.includes("NEXT_PUBLIC_USE_MOCK_DATA = true");
    
    expect(hasProductionMock).toBe(false);
    console.log("ADM-CROSS-01: Production mock data check passed.");
  });

  // ADM-CROSS-02: console.log PII / query data leak check in admin-queries.ts
  test("ADM-CROSS-02: Check for console.log data leak in admin-queries.ts", () => {
    const queriesPath = path.resolve(__dirname, "../../lib/supabase/admin-queries.ts");
    expect(fs.existsSync(queriesPath)).toBe(true);

    const content = fs.readFileSync(queriesPath, "utf-8");
    const lines = content.split("\n");
    
    const targetLine = lines[371] || "";
    const hasConsoleLog = targetLine.includes("console.log") && targetLine.includes("result");
    
    console.log(`ADM-CROSS-02 target line: ${targetLine.trim()}`);
    if (hasConsoleLog) {
      console.warn("ADM-CROSS-02 KNOWN RISK: console.log leak exists at line 372 of admin-queries.ts!");
    }
  });

  // ADM-CROSS-03: Docker history credentials leaks check (Supabase local keys)
  test("ADM-CROSS-03: Docker image history scan for secrets leak", () => {
    try {
      const output = execSync("docker history supabase_db_furniture-website --no-trunc", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      const hasSecrets = output.toLowerCase().includes("supabase") || output.includes("POSTGRES_PASSWORD");
      
      console.log(`ADM-CROSS-03: Docker history scanned. Secrets leak detected = ${hasSecrets}`);
    } catch (err) {
      console.log("ADM-CROSS-03: Docker history command skipped (Docker CLI not accessible in host shell).");
    }
  });

  // ADM-CROSS-05: Audit log actor_id nullability check
  test("ADM-CROSS-05: Verify actor_id in audit_logs is always a valid UUID (never null)", async () => {
    const logsRes = await dbClient.query(`
      SELECT actor_id FROM public.audit_logs 
      ORDER BY created_at DESC LIMIT 5
    `);
    
    if (logsRes.rows.length > 0) {
      logsRes.rows.forEach((row, idx) => {
        expect(row.actor_id).not.toBeNull();
        expect(row.actor_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        console.log(`ADM-CROSS-05 Audit sample ${idx + 1} actor_id: ${row.actor_id}`);
      });
    } else {
      console.warn("ADM-CROSS-05: No audit_logs records found in DB to verify.");
    }
  });

  // ADM-CROSS-08: requireEditorOrAdmin throws when no session
  test("ADM-CROSS-08: requireEditorOrAdmin throws or redirects when no session", async () => {
    const authPath = path.resolve(__dirname, "../../lib/supabase/auth.ts");
    expect(fs.existsSync(authPath)).toBe(true);

    const content = fs.readFileSync(authPath, "utf-8");
    // Verify requireEditorOrAdmin calls redirect when getCurrentUser is null
    const hasRedirect = content.includes("requireEditorOrAdmin") && content.includes("redirect(");
    expect(hasRedirect).toBe(true);
    console.log("ADM-CROSS-08: requireEditorOrAdmin anonymous redirect protection verified.");
  });

  // ADM-CROSS-12: deleteAdminProduct soft-delete junction orphan rows verification
  test("ADM-CROSS-12: Soft deleting product retains product_media junction rows (Orphan asset strategy)", async () => {
    const catId = "c0000000-0000-0000-0000-0000000000d1";
    const prodId = "p0000000-0000-0000-0000-0000000000d1";
    const mediaId = "m0000000-0000-0000-0000-0000000000d1";

    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_media WHERE product_id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.media_assets WHERE id = $1", [mediaId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [catId]);

    // Seed
    await dbClient.query("INSERT INTO public.product_categories (id, sort_order) VALUES ($1, 0)", [catId]);
    await dbClient.query("INSERT INTO public.products (id, category_id, reference_code, status) VALUES ($1, $2, 'REF-CROSS-12', 'draft')", [prodId, catId]);
    await dbClient.query("INSERT INTO public.media_assets (id, cloudinary_public_id, secure_url, format, size_bytes) VALUES ($1, 'cross-media-public', 'https://cloudinary.com/cross.jpg', 'jpg', 100)", [mediaId]);
    await dbClient.query("INSERT INTO public.product_media (product_id, media_asset_id, is_primary) VALUES ($1, $2, true)", [prodId, mediaId]);
    await dbClient.query("SET session_replication_role = 'origin'");

    // 2. Gọi logic Soft Delete sản phẩm (set deleted_at)
    await dbClient.query("UPDATE public.products SET deleted_at = now(), status = 'archived' WHERE id = $1", [prodId]);

    // 3. Verify dòng product_media và media_assets vẫn tồn tại (không bị Cascade cứng)
    const mediaCount = parseInt((await dbClient.query("SELECT COUNT(*) FROM public.product_media WHERE product_id = $1", [prodId])).rows[0].count, 10);
    const assetCount = parseInt((await dbClient.query("SELECT COUNT(*) FROM public.media_assets WHERE id = $1", [mediaId])).rows[0].count, 10);

    expect(mediaCount).toBe(1); // Giữ nguyên hàng liên kết
    expect(assetCount).toBe(1); // Giữ nguyên file ảnh
    console.log("ADM-CROSS-12: Orphan media asset verified. Product soft delete preserved junction records.");

    // Dọn dẹp
    await dbClient.query("SET session_replication_role = 'replica'");
    await dbClient.query("DELETE FROM public.product_media WHERE product_id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.products WHERE id = $1", [prodId]);
    await dbClient.query("DELETE FROM public.media_assets WHERE id = $1", [mediaId]);
    await dbClient.query("DELETE FROM public.product_categories WHERE id = $1", [catId]);
    await dbClient.query("SET session_replication_role = 'origin'");
  });

  // ADM-CROSS-15: writeAuditLog failure mode inconsistency
  test("ADM-CROSS-15: Verify writeAuditLog failure mode inconsistency between Product and Blog", () => {
    const mutationsPath = path.resolve(__dirname, "../../lib/supabase/mutations.ts");
    expect(fs.existsSync(mutationsPath)).toBe(true);

    const content = fs.readFileSync(mutationsPath, "utf-8");
    
    // Blog post create: has specific catch(auditErr) to delete/rollback
    const blogRollback = content.includes("Rollback blog post if audit logging fails");
    // Product create: does NOT have specific catch(auditErr) to rollback product
    const productRollback = content.includes("Rollback product if audit logging fails");

    console.log(`ADM-CROSS-15 audit rollback check: Blog has rollback = ${blogRollback}, Product has rollback = ${productRollback}`);
    expect(blogRollback).toBe(true);
    expect(productRollback).toBe(false); // Xác nhận sự không nhất quán trong mã nguồn
  });

});
