# Phase 07 Implementation Guide – Media & Third-Party Service Integration

## Implementation Order
1. **Cloudinary Configuration**: Code SDK integrations in `lib/cloudinary/client.ts`.
2. **Media UI Integration**: Build `/api/admin/media/upload` and drag-and-drop widgets.
3. **Google Maps Component**: Create map wrappers and integrate into showroom views.
4. **HTML Email Templates**: Connect Resend clients to compile dynamic layouts.
5. **Gemini API Setup**: Setup SDK loaders in `lib/ai/gemini.ts` with decryption helpers.
6. **AI API Routing**: Build the draft generator route `/api/admin/ai/generate-draft`.

---

## Route & Page Mapping
- `/api/admin/media/upload` -> Signed uploads Route Handler.
- `/api/admin/ai/generate-draft` -> AI draft generator Route Handler.
- `/admin/media` -> Library layout browsing saved media.
- `/[locale]/showrooms` -> Public showroom listing page displaying maps.

---

## Backend, Frontend, and Database Impacts
- **Database**: Reads configurations from settings, inserts assets to `media_assets`, logs email events to `quote_notifications`, and saves drafts inside `ai_drafts`.
- **Backend (Next.js server)**: Runs third-party clients, manages decryption, processes signed Cloudinary tokens, and handles email templates compilation.
- **Frontend**: Adds media drop widgets, Google Maps embeds, and AI generate panels.

---

## Docker & Local Runtime Implications
- Add Cloudinary, Resend, Gemini, and Google Maps keys to compose environments.
- Large media uploads might exceed default Docker container request size constraints. Ensure the Next.js server configuration does not block request sizes up to 5MB.

---

## Gemini Settings & API Secret Implications
- The Gemini API key must be retrieved from the database settings table at runtime, decrypted server-side, and never returned to browser logs or client-facing HTTP payloads.

---

## Security & RLS Details
- All API handlers (`/api/admin/media/upload` and `/api/admin/ai/generate-draft`) must enforce session authentication.
- Editor users can execute AI drafts, but are strictly blocked from settings lookups or secret retrieval.
- Cloudinary signatures must be signed server-side using the API secret, ensuring private buckets are protected:
  ```typescript
  // lib/cloudinary/client.ts
  import { v2 as cloudinary } from 'cloudinary';
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  ```

---

## Edge Cases & Rollback/Fallback Considerations
- **Gemini Timeout**: If the Gemini API is unreachable, return a `503 Service Unavailable` JSON response with a localized warning message. Do not allow failures to break page forms.
- **Maps API Failure**: If the Google Maps API fails to load or rejects the coordinate format, fall back to displaying a static address redirect link to external map providers.
- **Corrupted Image Uploads**: Upload handlers must validate MIME headers to prevent malicious executable files from being loaded to Cloudinary.

---

## Open Questions & Assumptions
- **Assumption**: The target Cloudinary profile handles automatic image resizing and optimizations via incoming URL transformations.
- **Open Question**: Will email recipients be manageable from the dashboard? We assume setting fallback lists in env variables is sufficient for this integration phase.
