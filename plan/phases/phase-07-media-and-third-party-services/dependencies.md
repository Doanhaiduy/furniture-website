# Phase 07 Dependencies – Media & Third-Party Service Integration

## Upstream Prerequisites
- **Phase 06 Complete**: Forms and database write hooks must be active to support media file mappings.
- **Admin Settings Secure Schema**: The `integration_secrets` table and corresponding RLS rules from Phase 01 must be active.

## Required Services / Configuration / Auth State
- **Service API Keys**: The local environment and Docker Compose containers must be injected with the following variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `CLOUDINARY_UPLOAD_PRESET`
  - `RESEND_API_KEY`
  - `GEMINI_API_KEY` (configured in database settings or environment variables)
  - `GOOGLE_MAPS_API_KEY`
- **Authenticated Sessions**: The developer environment must have access to Admin profiles to verify settings rotation.

## Blockers
- **Missing Service Keys**: If Cloudinary, Resend, or Google Maps keys are missing or invalid, these service boundaries will remain blocked.
- **Unverified Resend Domain**: Local development will be blocked from sending emails to external customer addresses until Resend domains are verified. The fallback is sending to the registered developer address.

## Parallelization and Constraints
- **Parallel Work**:
  - Setting up the Google Maps component is independent and can run in parallel with the Cloudinary setup.
  - Designing HTML templates for Resend is independent of the Gemini AI drafting setup.
- **Sequential Constraints**:
  - The Gemini provider setup depends on the decryption logic for database integration secrets (`lib/supabase/auth.ts`) established in Phase 01.
  - The Cloudinary signed upload route must be completed before updating product/blog forms to accept images.
