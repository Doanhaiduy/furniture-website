# Phase 08 Goals – Data Migration & Seeding

## Measurable Goals
- **Migrate Static Assets**: Convert all products, showrooms, categories, settings, and blog posts from `lib/showroom-data.ts` into PostgreSQL migration scripts.
- **CDN Media Mapping**: Map all image URLs from static Unsplash fallbacks to Cloudinary asset paths.
- **Idempotent Seeds**: Ensure the seed script is idempotent, running safely in local/staging environments without duplicating records.
- **Complete Quarantine**: Remove all static constants imports (`lib/showroom-data.ts`) from production components, ensuring the app runs strictly on database parameters.

## Phase Success Conditions
- Running the seed scripts populates all tables with realistic content (including 15+ products, 3 showrooms, 5 categories, 5 blog posts, and active settings).
- Seed runs execute correctly using the local gating parameter: `app.seed_local = 'true'` (blocking execution in production instances).
- Vietnamese diacritics and character encodings are preserved correctly during migration.
- All product specs JSON models are parsed into the database structure.
- Public routes load successfully on clean database boots immediately following seed execution.

## Concrete Results
- SQL database seed migrations (`supabase/migrations/0009_optional_local_seed.sql` or `scripts/seed.ts`).
- Media asset mapping list detailing replacement Cloudinary URLs.
- Removal of mock data imports from the project workspace.
- Verification checks proving data integrity and correct local routing.
