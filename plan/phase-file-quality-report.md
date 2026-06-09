# Phase File Quality Report

## Executive Summary
This report presents a thorough quality audit of all Markdown planning files located in `plan/phases/` (Phase 01 through Phase 10).
The current project has a highly complete frontend/admin prototype and a comprehensive database schema (35 tables, RLS policies, custom helper functions, and RPCs) defined under `supabase/migrations/`. 

Prior to this audit, the phase files suffered from structural and content deficiencies, showing signs of "shallow filler text." Most files (excluding READMEs) were generic, containing templates and checklists that lacked specific file paths, database tables, validation rules, RLS specifications, and concrete test scenarios.

This audit evaluates these files, identifies quality and structural issues, maps out key corrections, and establishes detailed execution plans for future AI coding agents.

---

## Evaluation of Current Phase Folders

### Strongest Phase Folders
1. **Phase 01 – Foundation**: Has the clearest connection to the initial configuration (Docker runtime, Supabase servers, Gemini settings storage).
2. **Phase 04 – Auth and Admin Access**: Clearly calls out the enforcement of Role Model Option A (Admin vs. Editor) server-side and lists the route groups.
3. **Phase 07 – Media and Services**: Specific about third-party service bounds (Cloudinary, Resend, Google Maps, Gemini) and references the correct database tables (`media_assets`, `quote_notifications`, `ai_drafts`).

### Weakest Phase Folders
1. **Phase 03 – Quote Flow**: Very thin on rate-limiting architecture, validation schemas, and details about Resend email layout structures.
2. **Phase 05 & 06 – Admin Read/Write Integration**: High level of duplication in text, generic Zod validation definitions, and lacked concrete list/form file maps.
3. **Phase 08 – Data Seeding**: Very vague about handling Vietnamese diacritics, mapping mock data images to Cloudinary assets, and making seed runs idempotent.
4. **Phase 10 – QA & Launch**: Lacked detailed cross-browser checklist items, exact security check commands for RLS validation, and local Docker smoke details.

---

## Recurring Quality Problems
- **Low Specificity**: Instead of naming database tables (e.g., `products`, `blog_posts`, `quote_requests`) and files (e.g., `app/api/contact/route.ts`, `components/showroom/quote-form.tsx`), many files used generic terms like "the tables" or "the API route."
- **Weak Testing Coverage**: Most `testing.md` files simply listed standard commands (e.g., `pnpm test`) without naming mock contexts, role credentials, localized routing scenarios, or error boundaries.
- **RLS and Permission Gaps**: While the database migrations have RLS policies, the guides did not detail how the application code should double-check roles (Admin-only for quotes/settings/users, Editor access restricted to publishable content) at the Route Handler and Server Action boundaries.
- **Gemini Security Gaps**: Fails to specify how Gemini keys must be encrypted/decrypted at rest via `AI_SECRET_ENCRYPTION_KEY` and how the key is masked (metadata-only) in Admin Settings responses.

---

## Key Corrections Made
1. **Upgraded Specificity**: Every single file was rewritten to explicitly target real routes (e.g., `app/[locale]/products/[slug]/page.tsx`), component filenames (e.g., `components/showroom/admin-workflows.tsx`), database tables, and environment variables.
2. **Action-Oriented Checklist**: Refined checklist items into verifiable steps rather than vague guidelines (e.g., changed "Test RLS policies" to "Execute RLS policy validation scripts using postgres role masks").
3. **Enhanced Security Enforcement**: Documented exact server-side guard logic and RLS rules for Role Model Option A across all relevant phases (specifically Phases 04, 05, 06, 07, 09, 10).
4. **Concrete Testing Plans**: Added explicit Browser MCP-first journey structures, focused unit/integration suites, backup-only Playwright triggers, mock credentials, locale verification paths (vi vs. en), and fallback error assertions.

---

## Remaining Risks & Open Questions
- **Gemini Key Secure Storage**: We recommend storing the Gemini API key in a dedicated table `integration_secrets` encrypted at rest using AES-GCM-256 via a server-side `AI_SECRET_ENCRYPTION_KEY`.
- **Resend Domain Validation**: The email notification system assumes Resend is verified with the business domain. Local/dev fallback requires testing with sandbox-approved emails.
- **Docker Host Networking**: Windows hosts running Docker Desktop require proper configurations (e.g., `host.docker.internal`) to bridge with host-hosted database engines.
