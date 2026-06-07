# Phase 07 Goals – Media & Third-Party Service Integration

## Measurable Goals
- **Cloudinary Integration**: Set up signed uploads and media asset management via Cloudinary. Persist asset descriptors in the `media_assets` table.
- **Resend HTML Templates**: Upgrade quote request notification emails to modern HTML templates. Log status events in the `quote_notifications` table.
- **Google Maps Validation**: Implement an embed wrapper that validates Google Maps coordinates and URLs before rendering them on showroom views.
- **Gemini API Provider**: Set up the Gemini client library for content drafts. Implement safety prompt checks, raw key masking, and API error fallback mechanisms.

## Phase Success Conditions
- Drag-and-drop media uploads in the admin dashboard upload files directly to Cloudinary and write metadata to the `media_assets` table.
- Product images are served via Cloudinary's optimized content delivery network (CDN) URLs.
- Outgoing quote emails contain rich HTML markup (logo, customer info, responsive styling) instead of raw text.
- Google Maps components on public showroom pages validate map inputs and fall back to safe local address coordinates when inputs are invalid.
- Admin settings show the Gemini API key masked (`****1234`), write log events to `audit_logs` upon key rotation, and return a `503 Service Unavailable` fallback to the AI drafting panel if the API key is disabled.

## Concrete Results
- Cloudinary server helper module (`lib/cloudinary/client.ts`) and upload API router.
- Google Maps embed renderer (`components/public/GoogleMap.tsx`) executing safe domain checks.
- HTML formatted templates inside `lib/email/templates/`.
- Gemini API interface client (`lib/ai/gemini.ts`) and dynamic drafting API routes.
