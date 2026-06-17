# Phase 08 Checklist – Data Migration & Seeding

## 1. Cloudinary Asset Seeding
- [x] Create `scripts/seed-cloudinary.ts` uploading mock product and showroom images to Cloudinary.
- [x] Save the returned mapping JSON inside `scripts/cloudinary-mapping.json`.
- [x] Update the image reference fields inside the database seed SQL file to point to these CDN URLs.

## 2. Idempotent SQL Seed Script
- [x] Edit `supabase/migrations/0009_optional_local_seed.sql` to structure dynamic inserts.
- [x] Group queries: insert categories first (resolving hierarchy relations), followed by products, blog posts, showrooms, and site settings.
- [x] Integrate local dev checks: wrap execution blocks in conditions verifying `app.seed_local = 'true'`.
- [x] Ensure insert operations use `ON CONFLICT (slug) DO UPDATE` or duplicate constraints handling to keep runs idempotent.
- [x] Verify Vietnamese character sets are compiled without conversion errors.

## 3. Mock Data Quarantine
- [x] Deprecate `lib/showroom-data.ts`. Move it to `tests/fixtures/showroom-data-fixture.ts` for testing use only.
- [x] Execute codebase search: confirm no production routes or layouts import `lib/showroom-data.ts`.
- [x] Replace testing mock targets to fetch from Supabase seed fixtures.

## 4. Run & Verification
- [x] Run the database seed: `supabase db reset`.
- [x] Verify count checks on all core tables:
  ```sql
  SELECT COUNT(*) FROM products;
  SELECT COUNT(*) FROM blog_posts;
  ```
- [x] Run the full test suites:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```
- [x] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 08.
