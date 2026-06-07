# Phase 09 Checklist – Admin Settings, Users, Media, & AI Completion

## 1. Crypto & Formatting Helpers
- [ ] Create `lib/security/encrypt.ts` to encrypt and decrypt strings using AES-GCM-256 with the 32-byte `AI_SECRET_ENCRYPTION_KEY`.
- [ ] Create `lib/security/mask.ts` returning key metadata and suffix outlines (e.g. `****abcd`) for saved settings.
- [ ] Write Vitest tests for the crypto helpers verifying encryption/decryption cycles and error cases.

## 2. Admin Settings UI (Admin Only)
- [ ] Complete `app/admin/settings/page.tsx` rendering General, SEO, and Gemini configurations.
- [ ] Ensure that key input fields display masked values after save.
- [ ] Add verification check: when the Admin clicks "Save" on Gemini configurations, execute a mock connection check to verify the API key.
- [ ] Write mutation helper saving encrypted values to the database.
- [ ] Write a new `audit_logs` record for settings modifications.
- [ ] Deny Editor access: throw a `403` error inside middleware and Route Handlers if the profile role is `editor`.

## 3. User Management Interface (Admin Only)
- [ ] Complete user list view inside `app/admin/users/page.tsx`.
- [ ] Create API Route Handler at `/api/admin/users` supporting:
  - Role modifications (`admin` <-> `editor`).
  - Active status updates (deactivation/activation).
- [ ] Ensure user modifications use the service-role client on the server.
- [ ] Write `audit_logs` entries for user updates.
- [ ] Block Editor profiles from access.

## 4. AI drafting Panel Integration
- [ ] Connect the AI generation widget to form description panels inside Product and Blog edit screens.
- [ ] Ensure generated outline content is populated as an editable draft.
- [ ] Save draft parameters (such as raw text output and target entity) inside the `ai_drafts` table.
- [ ] Implement grace fallback: if Gemini is disabled or unconfigured, render an "AI Offline" warning and hide prompt buttons.

## 5. Verification & Tests
- [ ] Run full validation suites inside Docker:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  pnpm test:e2e
  ```
- [ ] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 09.
