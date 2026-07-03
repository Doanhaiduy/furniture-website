import { test, expect } from "@playwright/test";
import type { Client } from "pg";
import { ADMIN_STATE } from "./support/paths";
import { connect, cleanupE2EData, firstRow } from "./support/db";

/**
 * Media assets. The physical upload goes to Cloudinary (external, not exercised here); the
 * project-controlled part is the persist endpoint — it validates the Cloudinary result and
 * writes a media_assets row — plus list and soft-delete. We therefore drive the real API with
 * a synthetic (but contract-valid) Cloudinary payload and assert the DB, exactly as the browser
 * client does after Cloudinary returns. External Cloudinary calls are not made (no creds in test).
 */

test.use({ storageState: ADMIN_STATE });

let db: Client;

test.beforeAll(async () => {
  db = await connect();
  await cleanupE2EData(db);
});

test.afterAll(async () => {
  await cleanupE2EData(db);
  await db.end();
});

function validPayload(token: string) {
  return {
    public_id: `e2e-media-${token}`,
    secure_url: `https://res.cloudinary.com/demo/image/upload/e2e-media-${token}.jpg`,
    format: "jpg",
    bytes: 12_345,
    width: 800,
    height: 600,
    original_filename: `e2e-${token}`,
    resource_type: "image",
  };
}

test("upload persist → list → soft delete via the media API", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const payload = validPayload(token);

  // ---------- PERSIST (what the browser posts after Cloudinary returns) ----------
  const uploadRes = await page.request.post("/api/admin/media/upload", { data: payload });
  expect(uploadRes.ok()).toBeTruthy();
  const uploaded = await uploadRes.json();
  const id = uploaded.id as string;
  expect(id).toBeTruthy();

  // Real DB post-condition.
  const asset = await firstRow<{ public_url: string; format: string; cloudinary_public_id: string; deleted_at: string | null }>(
    db,
    `SELECT public_url, format, cloudinary_public_id, deleted_at FROM public.media_assets WHERE id = $1`,
    [id],
  );
  expect(asset).toBeDefined();
  expect(asset!.public_url).toBe(payload.secure_url);
  expect(asset!.format).toBe("jpg");
  expect(asset!.deleted_at).toBeNull();

  // ---------- LIST shows the active asset ----------
  const listRes = await page.request.get("/api/admin/media/list");
  expect(listRes.ok()).toBeTruthy();
  const list = await listRes.json();
  expect((list.assets as { id: string }[]).some((a) => a.id === id)).toBe(true);

  // ---------- SOFT DELETE ----------
  const delRes = await page.request.delete(`/api/admin/media/${id}`);
  expect(delRes.ok()).toBeTruthy();
  await expect
    .poll(
      async () =>
        (await firstRow<{ deleted_at: string | null; status: string }>(
          db,
          `SELECT deleted_at, status FROM public.media_assets WHERE id = $1`,
          [id],
        )),
      { timeout: 30_000 },
    )
    .toMatchObject({ status: "archived" });
  const afterDelete = await firstRow<{ deleted_at: string | null }>(
    db,
    `SELECT deleted_at FROM public.media_assets WHERE id = $1`,
    [id],
  );
  expect(afterDelete!.deleted_at).not.toBeNull();

  // ---------- and it drops out of the active list ----------
  const list2 = await (await page.request.get("/api/admin/media/list")).json();
  expect((list2.assets as { id: string }[]).some((a) => a.id === id)).toBe(false);
});

test("media upload validation rejects bad format and non-Cloudinary URLs", async ({ page }) => {
  const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;

  // Disallowed format.
  const badFormat = await page.request.post("/api/admin/media/upload", {
    data: { ...validPayload(token), format: "exe", secure_url: `https://res.cloudinary.com/demo/raw/upload/e2e-media-${token}.exe` },
  });
  expect(badFormat.status()).toBe(400);

  // URL not from Cloudinary.
  const badUrl = await page.request.post("/api/admin/media/upload", {
    data: { ...validPayload(token), secure_url: `https://evil.example.com/e2e-media-${token}.jpg` },
  });
  expect(badUrl.status()).toBe(400);

  // Neither should have persisted anything.
  const leaked = await firstRow(db, `SELECT 1 FROM public.media_assets WHERE cloudinary_public_id = $1`, [
    `e2e-media-${token}`,
  ]);
  expect(leaked).toBeUndefined();
});

test.describe("unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("media upload is rejected with 401 when not signed in", async ({ request }) => {
    const token = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
    const res = await request.post("/api/admin/media/upload", { data: validPayload(token) });
    expect(res.status()).toBe(401);
  });
});
