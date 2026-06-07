# Phase 08 Deliverables – Data Migration & Seeding

## Concrete Expected Outputs
- **supabase/migrations/0009_optional_local_seed.sql**: Idempotent SQL script seeding products, categories, blogs, showrooms, and settings.
- **scripts/seed-cloudinary.ts**: Node script automating the upload of mock image assets to Cloudinary and generating a JSON URL mapping file.
- **lib/showroom-data.ts [QUARANTINE]**: Marked as deprecated and moved to test directory folders, ensuring no production files import it.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - All public and admin routes are affected, shifting dependencies to seeded database tables.
- **Tables**:
  - `products`, `categories`, `blog_posts`, `showrooms`, `settings`, `media_assets` [WRITE]
- **Configurations**:
  - `supabase/config.toml` [MODIFY] (Verify local seed gates are active)

## Future Touchpoints
- **Seed tables** will receive real user data in Phase 09.
- **Data validation scripts** will be verified before production deploy in Phase 10.
- **Backup and recovery checks** will be run in Phase 10.

## Verification Evidence Required
1. **Idempotency checks logs**: Output showing sequential execution of the seed script does not duplicate records:
   ```bash
   supabase db reset
   # Verify total count is exactly the seed count.
   ```
2. **CDN Url verification**: Image source checks showing all public cards render URLs beginning with `https://res.cloudinary.com/`.
3. **Vietnamese diacritics check**: CLI query results showing accents (e.g. `nội thất`, `Phương Đông`) compile without formatting issues.
4. **Build confirmation**: Next.js compile output confirming zero imports of `lib/showroom-data.ts` in production routes.
