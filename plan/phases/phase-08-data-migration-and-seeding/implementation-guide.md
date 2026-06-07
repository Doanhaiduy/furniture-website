# Phase 08 Implementation Guide – Data Migration & Seeding

## Implementation Order
1. **Cloudinary Asset Mapping**: Run `scripts/seed-cloudinary.ts` to map local/Unsplash images to Cloudinary CDN URLs.
2. **Draft Seed Migrations**: Build idempotent SQL scripts inside `supabase/migrations/0009_optional_local_seed.sql`.
3. **Seeding Execution**: Run database resets via Supabase CLI.
4. **Mock Quarantine**: Deprecate and move `lib/showroom-data.ts`.
5. **Route Verifications**: Run next compile checks confirming pages fetch database records.

---

## Route & Page Mapping
- Static fallback maps are replaced on all public routes:
  - `/` -> Renders seeded featured products.
  - `/products` -> Catalog list populated with seeded product nodes.
  - `/blog` -> Blog directory populated with seeded published blog posts.
  - `/showrooms` -> Address grid populated with seeded locations.

---

## Backend, Frontend, and Database Impacts
- **Database**: Populates `products`, `categories`, `blog_posts`, `showrooms`, `settings`, `media_assets` tables.
- **Backend (Next.js server)**: Zero code changes expected except removing mock import declarations.
- **Frontend**: Elements render seeded database parameters.

---

## Docker & Local Runtime Implications
- The seed script is configured to execute inside the local Docker database container.
- Verification commands check that local migrations run successfully.

---

## Gemini Settings & API Secret Implications
- Settings table seeds must not contain real Gemini API keys. Seed settings tables using dummy string values (e.g. `"GEMINI_API_KEY_PLACEHOLDER"`), which Admins can rotate in the dashboard settings panel later.

---

## Security & RLS Details
- Seeding does not alter database RLS rules.
- Test user profiles (`admin@showroom.com` and `editor@showroom.com`) are seeded into the database, but their access credentials must remain development-only and never be propagated to production setups.

---

## Edge Cases & Rollback/Fallback Considerations
- **Insertion Conflicts**: To ensure idempotency, insertions use conflicts resolution clauses:
  ```sql
  INSERT INTO products (slug, name_vi, name_en, ...)
  VALUES ('ban-tra-go-soi', 'Bàn trà gỗ sồi', 'Oak coffee table', ...)
  ON CONFLICT (slug) DO UPDATE
  SET name_vi = EXCLUDED.name_vi, price = EXCLUDED.price;
  ```
- **Vietnamese Encodings**: SQL script files must be encoded in UTF-8 to prevent mojibake/accent truncation during import.

---

## Open Questions & Assumptions
- **Assumption**: Developers have Cloudinary API credentials configured to execute the image upload script. If credentials are missing, the script will fall back to using mock Cloudinary URL strings.
- **Open Question**: Will customer quote requests be seeded? We assume seeding 2-3 sample quotes is helpful for admin test views but must be restricted to development gates.
