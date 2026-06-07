# Project Context

## Evidence-Based Baseline

This plan is aligned to the repo state and the two audit reports dated June 7, 2026:

- `docs/audit/frontend-audit-phase-1.md`
- `docs/audit/frontend-audit-phase-2-database.md`

The current project is not an empty implementation. It is a substantial frontend/admin prototype with a strong Supabase/PostgreSQL schema that is not yet wired into the application.

## Product Scope

Showroom Noi That Phuong Dong is a bilingual Vietnamese/English business website for wooden furniture, sanitary equipment, tiles, and project solutions. The business goals are:

- Company introduction.
- Product showcase and search/filter.
- Contact and quote lead capture.
- Showroom/location discovery.
- Blog/marketing content.
- SEO and social sharing.
- Admin CMS workflows for publishable content, users, settings, quote requests, media, and AI-assisted drafts.

Out of scope:

- No cart.
- No online payment.
- No order management.
- No order tracking.
- No inventory workflow.
- No mobile app.

## Actual Runtime Direction

The execution plan is now Supabase-first:

- Frontend/admin: current Next.js App Router app under root `app/`.
- Runtime version: current `package.json` uses Next.js `16.2.6`, React `19.2.4`, Node `22.x`, pnpm `11.5.0`.
- Data/auth backend: Supabase Auth plus Supabase/PostgreSQL tables, RLS policies, and RPCs from `supabase/migrations`.
- Admin UI: custom Next.js `/admin` prototype, to be wired to Supabase-backed APIs and server-side guards.
- Media: Cloudinary-backed delivery/upload metadata through `media_assets`.
- Email: Resend for quote notifications.
- Maps: Google Maps embed/fallback URLs stored in `showrooms`.
- AI: Gemini API for draft-only content/SEO/translation assistance. Gemini settings and API key management must live in Admin Settings, with full Admin-only access.
- Local runtime: Docker/Docker Compose support is required.

Legacy docs elsewhere in the repo may still refer to an older CMS/provider direction. Future coding agents must treat this `plan/` folder, the audits, and the Supabase migrations as the execution source of truth unless a later explicit architecture decision supersedes them.

## Current Frontend State

Public routes exist under `app/[locale]`:

- `/[locale]`
- `/[locale]/about`
- `/[locale]/products`
- `/[locale]/products/[slug]`
- `/[locale]/blog`
- `/[locale]/blog/[slug]`
- `/[locale]/contact`
- `/[locale]/contact/success`
- `/[locale]/contact/error`
- `/[locale]/showrooms`
- localized not-found/error/loading support

Admin routes exist under `app/admin`:

- `/admin`
- `/admin/login`
- `/admin/access-denied`
- `/admin/products`
- `/admin/categories`
- `/admin/blog`
- `/admin/showrooms`
- `/admin/media`
- `/admin/quotes`
- `/admin/users`
- `/admin/settings`
- `/admin/ai-assistant`

The UI is feature-rich, but most data still comes from `lib/showroom-data.ts`. Current tests validate prototype behavior rather than database-backed behavior.

## Current Backend State

Supabase migrations exist through `0009_optional_local_seed.sql`.

Important coverage:

- 34 application tables plus Supabase `auth.users` dependency through `profiles`.
- Translation tables for public bilingual content.
- RLS helpers and policies enforcing Role Model A.
- Public RPCs in `0008_public_admin_rpcs.sql`:
  - `public_products`
  - `public_blog_posts`
  - `public_showrooms`
  - `submit_quote_request`
  - `admin_quote_search`
- `ai_drafts` and `audit_logs` tables already exist.
- `site_settings`, `site_setting_translations`, `social_links`, and `quote_recipients` exist.

Important gaps:

- No app-side Supabase server/browser client helpers are implemented.
- No evidence migrations have been applied in local or remote dev.
- `/api/contact` validates but does not persist.
- Public routes and sitemap still read mock data.
- Admin login and role enforcement are UI-only.
- Admin read/write APIs are missing.
- Gemini provider settings/secret storage are not present in the schema yet and require a new migration or secure storage decision.
- Docker files are not present yet.

## Role Model

Role Model A is binding:

- Editor manages publishable content only.
- Admin manages users, settings, quote requests, media governance, integrations, Gemini settings, and all content.

Editors must not access quote requests, users, privileged settings, integration secrets, Gemini API keys, or Gemini provider configuration. Editors may use AI draft generation only through a server endpoint that never exposes provider secrets and only if Admin enables the feature.

## Immediate Execution Priority

The corrected starting point is Phase 01:

1. Create Docker/Docker Compose local runtime plan implementation.
2. Establish Supabase environment strategy and migration execution path.
3. Create server-only Supabase helpers.
4. Define/apply the Gemini settings schema and security model.
5. Verify the app can start locally and reach the selected Supabase development backend.
