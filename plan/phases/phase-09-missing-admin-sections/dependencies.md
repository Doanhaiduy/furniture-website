# Phase 09 Dependencies – Admin Settings, Users, Media, & AI Completion

## Upstream Prerequisites
- **Phase 07 Complete**: The Gemini server-side helper boundaries, Resend clients, and Cloudinary uploads must be active.
- **Phase 08 Complete**: Seed data representing products and categories must be available to test AI descriptions generation context.

## Required Services / Configuration / Auth State
- **Decryption Key**: `AI_SECRET_ENCRYPTION_KEY` must be configured inside environment settings.
- **Supabase Auth admin features**: The database user profile management queries require the server-side service-role client to manage Auth user properties.
- **Active Admin & Editor Sessions**: Active user accounts are needed to verify RLS configurations.

## Blockers
- **Missing Encryption Key**: If `AI_SECRET_ENCRYPTION_KEY` is not set or lacks the correct 32-byte format, the server will fail to decrypt settings, blocking AI workflows.
- **Auth Admin API Permissions**: If local Supabase configurations block Auth Admin calls, creating or deactivating users via the UI will fail.

## Parallelization and Constraints
- **Parallel Work**:
  - Building the Admin-only user management page (`app/admin/users/page.tsx`) can be done in parallel with integrating the AI generation widgets in the blog/product forms.
  - Designing settings layout panels is independent of Auth admin APIs.
- **Sequential Constraints**:
  - The Gemini settings key rotation helper must be completed and validated before connecting the AI generation API, as the drafting route relies on setting validations.
  - The settings mask helper must be validated before exposing settings APIs to prevent exposing raw keys.
