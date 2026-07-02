import { test, expect } from "@playwright/test";
import { Client } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

test.describe("Known Bugs and Vulnerabilities Audit Suite", () => {
  let dbClient: Client;

  test.beforeAll(async () => {
    dbClient = new Client({ connectionString });
    await dbClient.connect();
  });

  test.afterAll(async () => {
    await dbClient.end();
  });

  // 1. ADM-PRD-88: dimension_display_text_en mapping bug (mutations.ts line 322)
  test("ADM-PRD-88: [CONFIRMED BUG] Verify English dimension display text mapping bug in mutations", () => {
    const mutationsPath = path.resolve(__dirname, "../../lib/supabase/mutations.ts");
    expect(fs.existsSync(mutationsPath)).toBe(true);

    const content = fs.readFileSync(mutationsPath, "utf-8");
    const lines = content.split("\n");
    
    // Quét dòng chứa dimension_display_text_en
    let bugFound = false;
    lines.forEach((line, idx) => {
      if (line.includes("dimension_display_text_en") && line.includes("viTrans?.dimension_display_text")) {
        bugFound = true;
        console.log(`[CONFIRMED BUG] ADM-PRD-88: Found mapping bug at mutations.ts line ${idx + 1}: ${line.trim()}`);
      }
    });

    // Mong đợi lỗi tồn tại (CONFIRMED)
    expect(bugFound).toBe(true);
  });

  // 2. BLK-01: mediaId not persisted in junction (persists URL instead of UUID)
  test("BLK-01: [NEEDS INVESTIGATION] Verify product_media.media_asset_id stores UUID instead of URL", async () => {
    // Quét 5 dòng ngẫu nhiên trong product_media và verify media_asset_id là UUID hợp lệ
    const mediaRes = await dbClient.query(`
      SELECT media_asset_id FROM public.product_media LIMIT 5
    `);

    if (mediaRes.rows.length > 0) {
      mediaRes.rows.forEach((row, idx) => {
        // Assert: media_asset_id phải khớp regex UUID. Nếu là URL string thì đây là bug!
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.media_asset_id);
        if (!isUuid) {
          console.log(`[CONFIRMED BUG] BLK-01: Row ${idx + 1} has invalid UUID in media_asset_id: ${row.media_asset_id}`);
        }
        expect(isUuid).toBe(true);
      });
    }
  });

  // 3. BLK-06: RPC enum mismatch on quote status
  test("BLK-06: [CONFIRMED BUG] Verify quote_status enum in DB lacks 'cancelled' value", async () => {
    const enumRes = await dbClient.query(`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = 'public.quote_status'::regtype
    `);
    const labels = enumRes.rows.map(r => r.enumlabel);
    
    const hasCancelled = labels.includes("cancelled");
    console.log(`BLK-06 quote_status labels: ${labels.join(", ")}`);
    
    if (!hasCancelled) {
      console.log("[CONFIRMED BUG] BLK-06: Database enum 'quote_status' is missing 'cancelled' value!");
    }
    
    // Assert lỗi enum thiếu (mong muốn FAIL chèn cancelled ở DB)
    expect(hasCancelled).toBe(false); // PASS test nếu BUG được xác nhận là đang tồn tại
  });

  // 4. BLK-07: Hardcoded now date in promotions query
  test("BLK-07: [CONFIRMED BUG] Verify promotions client query uses hardcoded date string instead of dynamic new Date()", () => {
    const queriesPath = path.resolve(__dirname, "../../lib/supabase/admin-queries.ts");
    expect(fs.existsSync(queriesPath)).toBe(true);

    const content = fs.readFileSync(queriesPath, "utf-8");
    const hasHardcodedDate = content.includes("2026-06-19");

    if (hasHardcodedDate) {
      console.log("[CONFIRMED BUG] BLK-07: Found hardcoded '2026-06-19' date query string in admin-queries.ts!");
    }
    expect(hasHardcodedDate).toBe(true); // BUG CONFIRMED
  });

  // 5. BLK-08: size_bytes = 1 ghost assets
  test("BLK-08: [KNOWN RISK] Check for ghost assets with size_bytes = 1 in media_assets table", async () => {
    const ghostRes = await dbClient.query(`
      SELECT id, secure_url FROM public.media_assets WHERE size_bytes = 1 LIMIT 5
    `);

    if (ghostRes.rows.length > 0) {
      console.log(`[CONFIRMED BUG] BLK-08: Found ${ghostRes.rows.length} ghost assets in DB with size_bytes=1.`);
      ghostRes.rows.forEach(r => console.log(` - Ghost Asset ID: ${r.id}, URL: ${r.secure_url}`));
    } else {
      console.log("BLK-08: No ghost assets with size_bytes=1 found in current DB state.");
    }
  });

  // 6. ADM-MED-32: bytes ?? 0 fallback in upload route
  test("ADM-MED-32: [CONFIRMED BUG] Verify bytes ?? 0 fallback exists in media upload route", () => {
    const uploadRoutePath = path.resolve(__dirname, "../../app/api/admin/media/upload/route.ts");
    
    if (fs.existsSync(uploadRoutePath)) {
      const content = fs.readFileSync(uploadRoutePath, "utf-8");
      const hasBytesFallback = content.includes("bytes ?? 0") || content.includes("bytes: 0");
      
      if (hasBytesFallback) {
        console.log("[CONFIRMED BUG] ADM-MED-32: upload API route contains 'bytes ?? 0' which bypasses null constraint and triggers DB failure.");
      }
      expect(hasBytesFallback).toBe(true); // BUG CONFIRMED
    } else {
      console.warn("ADM-MED-32: Media upload API route file not found at default path.");
    }
  });

});
