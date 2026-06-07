# Phase 08 Data Migration And Seeding

## Objective

Move prototype content from `lib/showroom-data.ts` into repeatable Supabase seed/migration workflows and remove production mock dependencies.

## Why This Phase Exists

Public/admin integration needs stable data. Migration `0009_optional_local_seed.sql` exists, and the database audit provides mock-to-database mapping guidance.

## Requirement IDs

- FR-01 through FR-12-ADM
- NFR-06
- NFR-07

## Real Scope

- Inventory `lib/showroom-data.ts` exports.
- Map products, categories, attributes, blog posts, article body JSON, showrooms, settings, social links, quote recipients, media references.
- Convert local/staging seed data.
- Mark demo data clearly.
- Remove/quarantine production imports from `lib/showroom-data.ts`.

## Out Of Scope

- Inventing final business content.
- Adding ecommerce fields.
- Gemini generation of seed content.

## Dependencies

- Phase 07 media/service contracts.
- Applied Supabase migrations.
- Docker/Supabase local or remote seed workflow.

## Files/Folders Likely Impacted

- `lib/showroom-data.ts`
- `supabase/migrations/0009_optional_local_seed.sql` or later seed files
- seed scripts
- tests depending on mock data
- public/admin route files if any mock import remains

## Implementation Tasks

1. Create a mock-data-to-table inventory from `lib/showroom-data.ts`.
2. Convert viable prototype content into idempotent local/staging seed data.
3. Move media references to Cloudinary-backed records or explicit placeholders.
4. Remove production imports of prototype data and update tests to use fixtures/seeds.
5. Document seed commands for Docker/Supabase local and remote development.

## Backend/Database Impacts

- Inserts/updates seed records across content, product, blog, showroom, settings, social, recipient, media tables.
- Must not seed private quote data into production.
- Local seed gate `app.seed_local` must remain local/staging only.

## Frontend Impacts

- Public and admin pages should render seeded Supabase data in local/staging.
- UI should handle missing seed data with real empty states.
- Tests should stop depending on unversioned prototype arrays for production behavior.

## Route/Page Mapping

- All public and admin routes should operate against seeded or real Supabase data after this phase.

## Env/Config Needs

- Supabase migration/seed connection.
- Cloudinary public IDs/URLs for media references.

## Security/RLS Considerations

- Seeds should not weaken RLS.
- Demo users must not be production users.
- Demo secrets must not be seeded.

## Testing Checklist

- Seed applies in local/staging.
- Public pages render seeded content.
- Admin reads show seeded content.
- Mock import scan passes for production paths.
- Localized content is readable.

## Acceptance Criteria / Definition Of Done

- Production paths no longer depend on `lib/showroom-data.ts`.
- Seed/migration process is repeatable.
- Tests updated for real/seed data.

## Rollback/Fallback Notes

- Seed scripts should be idempotent where possible.
- If media migration is incomplete, use explicit placeholder records marked non-production.

## Risks/Unknowns

- Current mock image URLs may need manual Cloudinary migration.
- Existing Vietnamese text in some files may contain encoding artifacts and should not be propagated.
