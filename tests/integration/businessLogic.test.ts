import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { Client } from "pg";

// Business-logic regression tests for migration 0003_business_logic_fixes.sql.
// Each test runs inside a transaction that is rolled back, so the seeded DB is
// never mutated. Negative assertions use savepoints because a trigger exception
// aborts the surrounding (sub)transaction.
//
// Requires the local Supabase stack running (pnpm supabase start).

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

describe("Business logic guarantees (migration 0003)", () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ connectionString });
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    await client.query("BEGIN");
  });

  afterEach(async () => {
    await client.query("ROLLBACK");
  });

  /** Run `fn` and assert it throws a DB error (via a savepoint so the tx survives). */
  async function expectDbError(sql: string, params: unknown[] = []) {
    await client.query("SAVEPOINT sp");
    let threw = false;
    try {
      await client.query(sql, params);
    } catch {
      threw = true;
    }
    await client.query("ROLLBACK TO SAVEPOINT sp");
    return threw;
  }

  async function makePublishedProduct(): Promise<string> {
    const cat = await client.query("SELECT id FROM product_categories WHERE deleted_at IS NULL LIMIT 1");
    const catId = cat.rows[0].id;
    await client.query("SET session_replication_role = replica"); // bypass publish-translation gate
    const p = await client.query(
      "INSERT INTO products (category_id, status, price_min, published_at) VALUES ($1,'published',100, now()) RETURNING id",
      [catId]
    );
    await client.query("SET session_replication_role = origin");
    return p.rows[0].id;
  }

  // ── BUG 1: overlapping promotions ─────────────────────────────────────────
  describe("BUG 1 — overlapping promotions are blocked on a shared product", () => {
    it("blocks a second published promotion with an overlapping date range", async () => {
      const pid = await makePublishedProduct();
      const p1 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_A','published','2030-01-01','2030-01-31') RETURNING id"
      )).rows[0].id;
      const p2 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_B','published','2030-01-15','2030-02-15') RETURNING id"
      )).rows[0].id;

      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, p1]);
      const blocked = await expectDbError(
        "INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)",
        [pid, p2]
      );
      expect(blocked).toBe(true);
    });

    it("allows an adjacent, non-overlapping published promotion", async () => {
      const pid = await makePublishedProduct();
      const p1 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_C','published','2030-01-01','2030-01-31') RETURNING id"
      )).rows[0].id;
      const p3 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_D','published','2030-02-01','2030-02-28') RETURNING id"
      )).rows[0].id;
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, p1]);
      // Should NOT throw.
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, p3]);
      const cnt = await client.query("SELECT count(*) FROM product_promotions WHERE product_id=$1", [pid]);
      expect(Number(cnt.rows[0].count)).toBe(2);
    });

    it("allows a draft overlapping promotion but blocks publishing it into the overlap", async () => {
      const pid = await makePublishedProduct();
      const p1 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_E','published','2030-01-01','2030-01-31') RETURNING id"
      )).rows[0].id;
      const p4 = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_F','draft','2030-01-10','2030-01-20') RETURNING id"
      )).rows[0].id;
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, p1]);
      // draft link allowed
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, p4]);
      // publishing p4 now overlaps p1 -> blocked
      const blocked = await expectDbError("UPDATE promotions SET status='published' WHERE id=$1", [p4]);
      expect(blocked).toBe(true);
    });
  });

  // ── BUG 2: i18n fallback ──────────────────────────────────────────────────
  describe("BUG 2 — vi-only content is visible under the EN locale (fallback)", () => {
    it("public_promotions('en') returns a vi-only published promotion with its VI title", async () => {
      const promo = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at,discount_percentage) VALUES ('BL_I18N','published', now()-interval '1 day', now()+interval '10 days', 10) RETURNING id"
      )).rows[0].id;
      await client.query(
        "INSERT INTO promotion_translations (promotion_id, locale, title) VALUES ($1,'vi','Chỉ Tiếng Việt')",
        [promo]
      );
      const res = await client.query("SELECT title FROM public_promotions('en') WHERE id=$1", [promo]);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].title).toBe("Chỉ Tiếng Việt");
    });

    it("public_products('en') returns a vi-only published product with its VI name", async () => {
      const pid = await makePublishedProduct();
      await client.query(
        "INSERT INTO product_translations (product_id, locale, slug, name, summary, description_json) VALUES ($1,'vi','bl-vi-only','Ghế Chỉ Tiếng Việt','Tóm tắt','{}'::jsonb)",
        [pid]
      );
      const res = await client.query("SELECT name FROM public_products('en') WHERE id=$1", [pid]);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].name).toBe("Ghế Chỉ Tiếng Việt");
    });
  });

  // ── Self-discovered CRITICAL: last-admin lockout ──────────────────────────
  describe("Last-admin lockout is prevented", () => {
    it("blocks demoting/deactivating/deleting the final active admin", async () => {
      // Reduce to exactly one active admin inside this rolled-back tx.
      const ct = await client.query(
        "SELECT count(*)::int c FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL"
      );
      if (ct.rows[0].c > 1) {
        await client.query(`
          UPDATE profiles SET deleted_at = now()
          WHERE id IN (
            SELECT id FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL
            ORDER BY created_at OFFSET 1
          )
        `);
      }
      const last = (await client.query(
        "SELECT id FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL LIMIT 1"
      )).rows[0].id;

      expect(await expectDbError("UPDATE profiles SET role='editor' WHERE id=$1", [last])).toBe(true);
      expect(await expectDbError("UPDATE profiles SET is_active=false WHERE id=$1", [last])).toBe(true);
      expect(await expectDbError("DELETE FROM profiles WHERE id=$1", [last])).toBe(true);
    });
  });

  // ── S5: promo price sanity CHECK constraint ───────────────────────────────
  describe("promo_price is DB-enforced to be a real discount", () => {
    it("rejects promo_price_min >= price_min", async () => {
      const cat = (await client.query("SELECT id FROM product_categories WHERE deleted_at IS NULL LIMIT 1")).rows[0].id;
      const bad = await expectDbError(
        "INSERT INTO products (category_id, status, price_min, promo_price_min) VALUES ($1,'draft',100,150)",
        [cat]
      );
      expect(bad).toBe(true);
    });
  });

  // ── S4-guard: no status change on a soft-deleted quote ────────────────────
  describe("update_quote_status refuses a soft-deleted quote", () => {
    it("returns an error instead of mutating an archived lead", async () => {
      // Create a lead and soft-delete it (bypass RLS/auth by direct insert).
      const q = (await client.query(
        `INSERT INTO quote_requests (full_name, phone, message, preferred_locale, source_path, status, deleted_at)
         VALUES ('T','0123456789','m','vi','/x','new', now()) RETURNING id`
      )).rows[0].id;
      // Call the RPC as-is; without an admin auth.uid() it returns the auth error,
      // so assert specifically on the archived-guard by first stubbing an admin.
      const admin = (await client.query(
        "SELECT id FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL LIMIT 1"
      )).rows[0].id;
      await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [admin]);
      const res = await client.query("SELECT public.update_quote_status($1,'closed',null) AS r", [q]);
      const r = res.rows[0].r;
      expect(r.success).toBe(false);
      expect(String(r.error)).toMatch(/archived/i); // proves the S4 guard fired, not the auth path
      const still = await client.query("SELECT status FROM quote_requests WHERE id=$1", [q]);
      expect(still.rows[0].status).toBe("new");
    });
  });

  // ── S6-cleanup: soft-deleting a product detaches its promotion links ──────
  describe("Soft-deleting a product detaches its promotion links", () => {
    it("removes product_promotions rows on soft-delete", async () => {
      const pid = await makePublishedProduct();
      const promo = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('BL_DETACH','published','2031-01-01','2031-01-31') RETURNING id"
      )).rows[0].id;
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,$2)", [pid, promo]);
      await client.query("UPDATE products SET deleted_at = now() WHERE id=$1", [pid]);
      const cnt = await client.query("SELECT count(*)::int c FROM product_promotions WHERE product_id=$1", [pid]);
      expect(cnt.rows[0].c).toBe(0);
    });
  });

  // ── S3: archiving a category hides its products from public ───────────────
  describe("S3 — archived category hides its products from public_products", () => {
    it("excludes products whose category is not published", async () => {
      // Create an isolated published category + product.
      const cat = (await client.query(
        "INSERT INTO product_categories (group_key, status) VALUES ('wooden_furniture','draft') RETURNING id"
      )).rows[0].id;
      await client.query(
        "INSERT INTO product_category_translations (category_id, locale, slug, name) VALUES ($1,'vi','s3-cat','Danh mục S3'),($1,'en','s3-cat-en','S3 Cat')",
        [cat]
      );
      // Publish now that both translations exist (satisfies require_publish_translations).
      await client.query("UPDATE product_categories SET status='published' WHERE id=$1", [cat]);
      await client.query("SET session_replication_role = replica");
      const pid = (await client.query(
        "INSERT INTO products (category_id, status, price_min, published_at) VALUES ($1,'published',100, now()) RETURNING id",
        [cat]
      )).rows[0].id;
      await client.query(
        "INSERT INTO product_translations (product_id, locale, slug, name, summary, description_json) VALUES ($1,'vi','s3-prod','SP S3','tt','{}'::jsonb)",
        [pid]
      );
      await client.query("SET session_replication_role = origin");

      const before = await client.query("SELECT count(*)::int c FROM public_products('vi') WHERE id=$1", [pid]);
      expect(before.rows[0].c).toBe(1);

      // Archive the category -> product must vanish from public.
      await client.query("UPDATE product_categories SET status='archived' WHERE id=$1", [cat]);
      const after = await client.query("SELECT count(*)::int c FROM public_products('vi') WHERE id=$1", [pid]);
      expect(after.rows[0].c).toBe(0);

      // Product row itself still exists (not deleted), just hidden.
      const still = await client.query("SELECT count(*)::int c FROM products WHERE id=$1 AND deleted_at IS NULL", [pid]);
      expect(still.rows[0].c).toBe(1);
    });
  });

  // ── S4: reopen a terminal quote (admin only, always audited) ──────────────
  describe("S4 — quote reopen", () => {
    async function asAdmin(): Promise<string> {
      const admin = (await client.query(
        "SELECT id FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL LIMIT 1"
      )).rows[0].id;
      await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [admin]);
      return admin;
    }
    async function makeClosedQuote(): Promise<string> {
      return (await client.query(
        `INSERT INTO quote_requests (full_name, phone, message, preferred_locale, source_path, status)
         VALUES ('R','0123456789','m','vi','/x','closed') RETURNING id`
      )).rows[0].id;
    }

    it("lets an admin reopen a closed quote and logs the event with actor + note", async () => {
      const admin = await asAdmin();
      const q = await makeClosedQuote();
      const res = await client.query("SELECT public.update_quote_status($1,'contacted','Khách gọi lại') AS r", [q]);
      expect(res.rows[0].r.success).toBe(true);
      expect(res.rows[0].r.reopened).toBe(true);
      const ev = await client.query(
        "SELECT actor_id, old_status, new_status, note FROM quote_request_events WHERE quote_request_id=$1 ORDER BY created_at DESC LIMIT 1",
        [q]
      );
      expect(ev.rows[0].actor_id).toBe(admin);
      expect(ev.rows[0].old_status).toBe("closed");
      expect(ev.rows[0].new_status).toBe("contacted");
      expect(ev.rows[0].note).toBe("Khách gọi lại");
    });

    it("records a default reason when an admin reopens without a note", async () => {
      await asAdmin();
      const q = await makeClosedQuote();
      await client.query("SELECT public.update_quote_status($1,'new',null)", [q]);
      const ev = await client.query(
        "SELECT note FROM quote_request_events WHERE quote_request_id=$1 ORDER BY created_at DESC LIMIT 1",
        [q]
      );
      expect(String(ev.rows[0].note)).toMatch(/reopen/i);
    });

    it("blocks a non-admin (editor) from reopening", async () => {
      // Point auth.uid() at an editor (or a non-existent user) -> unauthorized.
      const editor = (await client.query(
        "SELECT id FROM profiles WHERE role='editor' AND is_active AND deleted_at IS NULL LIMIT 1"
      )).rows[0]?.id;
      await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [editor ?? "00000000-0000-0000-0000-0000000000ee"]);
      const q = await makeClosedQuote();
      const res = await client.query("SELECT public.update_quote_status($1,'new',null) AS r", [q]);
      expect(res.rows[0].r.success).toBe(false);
      expect(String(res.rows[0].r.error)).toMatch(/admin only/i);
      const still = await client.query("SELECT status FROM quote_requests WHERE id=$1", [q]);
      expect(still.rows[0].status).toBe("closed");
    });
  });

  // ── S6: block deleting referenced media ───────────────────────────────────
  describe("S6 — get_media_references reports what uses a media asset", () => {
    it("returns the referencing product so the CMS can block the delete", async () => {
      const media = (await client.query(
        "INSERT INTO media_assets (storage_provider, resource_type, public_url, mime_type, format, size_bytes, cloudinary_public_id, status) VALUES ('cloudinary','image','http://x/s6.jpg','image/jpeg','jpg',1000,'s6pub','active') RETURNING id"
      )).rows[0].id;
      const pid = await makePublishedProduct();
      await client.query("INSERT INTO product_media (product_id, media_id, is_primary, sort_order) VALUES ($1,$2,true,0)", [pid, media]);

      const refs = await client.query("SELECT * FROM get_media_references($1)", [media]);
      expect(refs.rows.length).toBeGreaterThanOrEqual(1);
      expect(refs.rows.some((r: any) => r.entity_type === "product" && r.entity_id === pid)).toBe(true);
    });

    it("returns nothing for an unreferenced media asset (delete allowed)", async () => {
      const media = (await client.query(
        "INSERT INTO media_assets (storage_provider, resource_type, public_url, mime_type, format, size_bytes, cloudinary_public_id, status) VALUES ('cloudinary','image','http://x/s6-free.jpg','image/jpeg','jpg',1000,'s6pubfree','active') RETURNING id"
      )).rows[0].id;
      const refs = await client.query("SELECT * FROM get_media_references($1)", [media]);
      expect(refs.rows.length).toBe(0);
    });
  });

  // ── Remaining-risk #4: atomic promotion update rolls back on trigger failure ─
  describe("admin_update_promotion is atomic", () => {
    it("rolls back the promotion row change when a linked product overlaps", async () => {
      const pid = await makePublishedProduct();
      // Existing published promo already on the product.
      await client.query(
        "INSERT INTO promotions (id,code,status,start_at,end_at) VALUES ('00000000-0000-0000-0000-0000000a0001','ATOM_EXIST','published','2032-01-01','2032-01-31')"
      );
      await client.query("INSERT INTO product_promotions (product_id, promotion_id) VALUES ($1,'00000000-0000-0000-0000-0000000a0001')", [pid]);
      // The promo we will try to update to published + overlapping + linked to same product.
      const target = (await client.query(
        "INSERT INTO promotions (code,status,start_at,end_at) VALUES ('ATOM_TARGET','draft','2032-01-10','2032-01-20') RETURNING id"
      )).rows[0].id;

      const admin = (await client.query("SELECT id FROM profiles WHERE role='admin' AND is_active AND deleted_at IS NULL LIMIT 1")).rows[0].id;
      let threw = false;
      await client.query("SAVEPOINT spa");
      try {
        await client.query(
          `SELECT admin_update_promotion($1,'ATOM_TARGET_NEW',null,'published','2032-01-10','2032-01-20',null,null,null,'{}'::jsonb,'T',null,null,null,ARRAY[$2]::uuid[],$3)`,
          [target, pid, admin]
        );
      } catch {
        threw = true;
      }
      await client.query("ROLLBACK TO SAVEPOINT spa");
      expect(threw).toBe(true);
      // The code change must NOT have persisted (atomic rollback).
      const row = await client.query("SELECT code, status FROM promotions WHERE id=$1", [target]);
      expect(row.rows[0].code).toBe("ATOM_TARGET");
      expect(row.rows[0].status).toBe("draft");
    });
  });

  // ── Self-discovered MEDIUM: promotion code reuse after soft-delete ─────────
  describe("Promotion code can be reused after soft-delete", () => {
    it("allows re-inserting a code whose previous holder was soft-deleted", async () => {
      const p = (await client.query(
        "INSERT INTO promotions (code,status) VALUES ('BL_REUSE','draft') RETURNING id"
      )).rows[0].id;
      await client.query("UPDATE promotions SET deleted_at = now() WHERE id=$1", [p]);
      // Should NOT throw.
      await client.query("INSERT INTO promotions (code,status) VALUES ('BL_REUSE','draft')");
      const cnt = await client.query(
        "SELECT count(*)::int c FROM promotions WHERE code='BL_REUSE' AND deleted_at IS NULL"
      );
      expect(cnt.rows[0].c).toBe(1);
    });
  });
});
