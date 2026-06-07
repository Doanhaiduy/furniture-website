# Phase 07 Checklist – Media & Third-Party Service Integration

## 1. Cloudinary Integration
- [ ] Create `lib/cloudinary/client.ts` implementing signed uploads, asset deletion, and URL transformations.
- [ ] Create signed upload Route Handler at `/api/admin/media/upload/route.ts` validating upload types (e.g. `image/jpeg`, `image/png`) and sizes (maximum 5MB).
- [ ] Build the `components/admin/MediaUpload.tsx` drag-and-drop component.
- [ ] Connect the upload handler to save successful uploads inside the `media_assets` database table.
- [ ] Integrate the upload widget inside the Product and Blog post form sections.
- [ ] Add the Cloudinary CDN domain (`res.cloudinary.com`) to `next.config.ts` remote patterns.

## 2. Google Maps Integration
- [ ] Create the public map renderer component at `components/public/GoogleMap.tsx`.
- [ ] Add coordinate fallback verification checks: if showroom table coordinates are blank, load fallback values or link to static Google Maps addresses.
- [ ] Connect the map component to render inside the dynamic showroom page (`app/[locale]/showrooms/page.tsx`).

## 3. Resend HTML Email Templates
- [ ] Update the quote form notification script (`lib/resend/client.ts`) to import HTML layouts.
- [ ] Refine the template layouts using React components, verifying responsive layout rules.
- [ ] Log event updates to the database table `quote_notifications` storing transaction payloads.

## 4. Gemini API Integration
- [ ] Create the Gemini provider server wrapper at `lib/ai/gemini.ts`.
- [ ] Implement key decryption helper: fetch the Gemini API key from the database and decrypt it using `AI_SECRET_ENCRYPTION_KEY`.
- [ ] Build draft generation API handler `/api/admin/ai/generate-draft/route.ts` verifying authentication sessions and checking prompt sizes.
- [ ] Implement prompt validation filters: verify input parameters do not contain private quote records or system access credentials.
- [ ] Log all generated output results into the database `ai_drafts` table.
- [ ] Implement error fallbacks: if Gemini is disabled or unconfigured, disable the UI trigger and return a safe `AI_UNAVAILABLE` response status.

## 5. Security & Verification Checks
- [ ] Run secret leaks audit: verify that no files containing API secrets (Resend keys, Cloudinary secret keys, Gemini keys) are imported inside browser components.
- [ ] Run full test suites:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```
- [ ] Update `docs/specs/traceability-matrix.md` with verification checks for Phase 07.
