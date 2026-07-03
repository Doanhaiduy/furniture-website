import { Client } from "pg";

/**
 * Single source of truth for the test DB connection.
 * - Locally: defaults to the Supabase CLI Postgres exposed on 127.0.0.1:54322.
 * - In Docker (docker-compose.test.yml): DATABASE_URL points at the internal DB host.
 */
export const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

/**
 * Shared prefix for all data created by E2E tests so cleanup can be blanket and
 * order-independent. Every test-created row uses a slug/code starting with this.
 */
export const E2E_PREFIX = "e2e-";
export const E2E_REF_PREFIX = "E2E-REF-";

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: CONNECTION_STRING });
  await client.connect();
  return client;
}

/** Generate a unique slug for a test entity, guaranteed to carry the E2E prefix. */
export function uniqueSlug(base: string): string {
  return `${E2E_PREFIX}${base}-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e4,
  )}`;
}

export function uniqueRef(): string {
  return `${E2E_REF_PREFIX}${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e4,
  )}`;
}

/**
 * Remove every row any E2E test could have created, matched by the shared prefix.
 * Safe to run before and after a suite; never touches seeded/production rows.
 * Written child-first to respect foreign keys without disabling triggers
 * (we are not superuser, so session_replication_role is unavailable).
 */
export async function cleanupE2EData(client: Client): Promise<void> {
  // Products (+ translations, media links) created by tests
  await client.query(
    `DELETE FROM public.product_translations
       WHERE slug LIKE $1
          OR product_id IN (SELECT id FROM public.products WHERE reference_code LIKE $2)`,
    [`${E2E_PREFIX}%`, `${E2E_REF_PREFIX}%`],
  );
  await client.query(
    `DELETE FROM public.products WHERE reference_code LIKE $1`,
    [`${E2E_REF_PREFIX}%`],
  );

  // Categories
  await client.query(
    `DELETE FROM public.product_category_translations WHERE slug LIKE $1`,
    [`${E2E_PREFIX}%`],
  );
  await client.query(
    `DELETE FROM public.product_categories
       WHERE id NOT IN (SELECT category_id FROM public.product_category_translations)
         AND id NOT IN (SELECT category_id FROM public.products WHERE category_id IS NOT NULL)`,
  );

  // Brands (slug lives on the brands table; translations are keyed by brand_id)
  await client.query(
    `DELETE FROM public.brand_translations
       WHERE brand_id IN (SELECT id FROM public.brands WHERE slug LIKE $1)`,
    [`${E2E_PREFIX}%`],
  );
  await client.query(`DELETE FROM public.brands WHERE slug LIKE $1`, [
    `${E2E_PREFIX}%`,
  ]);

  // Blog posts (translations carry the slug; posts are the parent)
  await client.query(
    `DELETE FROM public.blog_post_translations WHERE slug LIKE $1`,
    [`${E2E_PREFIX}%`],
  );
  await client.query(
    `DELETE FROM public.blog_posts
       WHERE id NOT IN (SELECT post_id FROM public.blog_post_translations)`,
  );

  // Showrooms (code carries the e2e prefix; translations keyed by showroom_id)
  await client.query(
    `DELETE FROM public.showroom_translations
       WHERE showroom_id IN (SELECT id FROM public.showrooms WHERE code LIKE $1)`,
    [`${E2E_PREFIX}%`],
  );
  await client.query(`DELETE FROM public.showrooms WHERE code LIKE $1`, [
    `${E2E_PREFIX}%`,
  ]);

  // Promotions. The admin form auto-derives an UPPER_SNAKE code from the VI title, so
  // E2E promotions (title "E2E Promo ...") get codes like "E2E_PROMO_...". Clean by the
  // uppercase E2E prefix (seed promo codes are lowercase, so no collision).
  await client.query(
    `DELETE FROM public.product_promotions
       WHERE promotion_id IN (SELECT id FROM public.promotions WHERE code LIKE 'E2E%')`,
  );
  await client.query(
    `DELETE FROM public.promotion_translations
       WHERE promotion_id IN (SELECT id FROM public.promotions WHERE code LIKE 'E2E%')`,
  );
  await client.query(`DELETE FROM public.promotions WHERE code LIKE 'E2E%'`);

  // Quote requests seeded by E2E (full_name prefixed "E2E "). quote_request_events is
  // append-only (delete is blocked by trigger), and a status transition writes one, so a hard
  // delete is impossible. Use the app's own soft-delete instead — the admin list filters on
  // deleted_at IS NULL, so soft-deleted E2E leads stay out of every test's view.
  await client.query(
    `UPDATE public.quote_requests SET deleted_at = now()
       WHERE full_name LIKE 'E2E %' AND deleted_at IS NULL`,
  );

  // Admin users created by E2E (email prefix e2e-user-). Remove the profile (public) and the
  // GoTrue auth user (auth schema) so the email is free to reuse. Delete both explicitly since
  // the profiles→auth.users cascade is not relied upon.
  await client.query(`DELETE FROM public.profiles WHERE email LIKE 'e2e-user-%'`);
  await client.query(`DELETE FROM auth.users WHERE email LIKE 'e2e-user-%'`);

  // Media assets persisted by E2E (synthetic Cloudinary rows, public_id prefix e2e-media-).
  await client.query(`DELETE FROM public.media_assets WHERE cloudinary_public_id LIKE 'e2e-media-%'`);
}

/** Convenience: run a query and return the first row (or undefined). */
export async function firstRow<T = any>(
  client: Client,
  sql: string,
  params: any[] = [],
): Promise<T | undefined> {
  const res = await client.query(sql, params);
  return res.rows[0] as T | undefined;
}
