# Phase 07 Media, Email, Maps, And Gemini Service Layer

## Objective

Implement server-only service boundaries for Cloudinary, Resend, Google Maps validation, and Gemini API.

## Why This Phase Exists

The schema has media, quote notification, map URL, and AI draft support. The app has UI placeholders, but service integrations and secret handling are missing.

## Requirement IDs

- FR-07-PUB
- FR-08-PUB
- FR-09
- FR-10
- FR-11
- NFR-05
- NFR-06
- NFR-07

## Real Scope

- Cloudinary upload/delete/signing helpers.
- Media metadata persistence through `media_assets`.
- Resend notification helper and status updates.
- Google Maps embed/fallback URL validation.
- Gemini provider abstraction and server client.
- Gemini config lookup from Admin Settings secure storage.
- Safe fallback when Gemini is disabled/unavailable.

## Out Of Scope

- Full Admin Settings UI for Gemini rotation if not already done.
- Data migration.
- New AI provider implementation beyond Gemini.

## Dependencies

- Phase 06 mutation/audit patterns.
- Phase 01 Gemini secret storage decision.
- Service credentials or mocked test credentials.

## Files/Folders Likely Impacted

- `lib/cloudinary/**`
- `lib/resend/**`
- `lib/google-maps/**`
- `lib/ai/**`
- admin media/settings/AI helper files
- `next.config.ts`
- tests

## Implementation Tasks

1. Add server-only service clients for Cloudinary, Resend, Maps validation, and Gemini.
2. Add upload, notification, map, and Gemini config validators.
3. Persist service outcomes in `media_assets`, `quote_notifications`, and `ai_drafts`.
4. Keep provider secrets out of client bundles and browser responses.
5. Add mocked service tests for success, failure, and unavailable fallback paths.

## Backend/Database Impacts

- Writes `media_assets` and translations.
- Updates `quote_notifications`.
- Reads showroom map fields and settings.
- Writes `ai_drafts`.
- Reads Gemini settings/secret through Admin-only/server-only path.

## Frontend Impacts

- Admin media/settings/AI screens can call service endpoints without receiving secrets.
- AI assistant must show disabled/unavailable state when Gemini config is missing or invalid.
- Public showroom map output must only render validated URLs.

## Route/Page Mapping

- `/admin/media` service operations.
- `/admin/settings` service config read state.
- `/admin/ai-assistant` draft service.
- `/[locale]/showrooms` map validation output.

## Env/Config Needs

- Cloudinary key/secret/folder.
- Resend key.
- Google Maps validation config.
- `AI_SECRET_ENCRYPTION_KEY`.
- Gemini bootstrap/default env only if secure DB settings are absent in local.

## Security/RLS Considerations

- No service secret in client code.
- Gemini key never returned raw.
- Editors can call draft endpoint only for allowed publishable content and never see provider config.
- Gemini prompts must exclude quote/private data.

## Testing Checklist

- Upload validator accepts/rejects files correctly.
- Resend helper records sent/failed/skipped.
- Maps validator rejects unsafe URLs.
- Gemini client is mocked in tests.
- Missing Gemini config returns safe fallback.
- Secret import scan passes.

## Acceptance Criteria / Definition Of Done

- Service helpers exist and are tested.
- Admin-only service config boundaries are clear.
- AI draft creation uses Gemini and writes `ai_drafts`.
- Failure modes are safe and user-visible.

## Rollback/Fallback Notes

- If Cloudinary credentials are unavailable, media upload remains disabled with clear admin state.
- If Resend fails, quote persistence remains unaffected.
- If Gemini fails, AI assistant shows unavailable fallback.

## Risks/Unknowns

- Gemini quota/model availability may vary.
- Cloudinary transformation policy may require account-specific tuning.
