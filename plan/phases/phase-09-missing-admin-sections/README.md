# Phase 09 Admin Settings, Users, Media, And AI Assistant Completion

## Objective

Finish the admin sections still acting as placeholders or prototypes, with special focus on Admin-only Gemini settings and AI assistant fallback behavior.

## Why This Phase Exists

The frontend audit identifies media, users, settings, and AI assistant as incomplete/placeholder areas. The user explicitly requires Gemini API key/config to be managed from Admin Settings by full Admin users only.

## Requirement IDs

- FR-10
- FR-11
- FR-12-ADM
- NFR-03
- NFR-05
- NFR-07

## Real Scope

- `/admin/media`: real media list/upload/metadata/update behavior.
- `/admin/users`: Admin-only Supabase Auth/profile user management.
- `/admin/settings`: public settings, quote recipients, integrations, Gemini settings.
- `/admin/ai-assistant`: Gemini-backed draft workflow with unavailable fallback.
- Gemini key masking, validation, rotation, audit logs.
- Editor denial for all privileged settings and secrets.

## Out Of Scope

- Public route data integration.
- Broad admin redesign unrelated to missing functionality.
- New AI provider implementation beyond Gemini.

## Dependencies

- Phase 04 auth/RBAC.
- Phase 06 mutations/audit logs.
- Phase 07 service helpers.
- Phase 08 seeded data.

## Files/Folders Likely Impacted

- `app/admin/**`
- `components/showroom/admin-pages.tsx`
- `components/showroom/admin-workflows.tsx`
- `components/showroom/admin-interactions.tsx`
- media/user/settings/AI helper files
- validation schemas
- tests

## Implementation Tasks

1. Complete `/admin/media`, `/admin/users`, `/admin/settings`, and `/admin/ai-assistant` with real read/write paths.
2. Implement Admin-only Gemini settings read/update/rotation with masked responses.
3. Add validation, audit logging, and unavailable fallback for Gemini config and AI generation.
4. Enforce Editor denial for users, privileged settings, integration secrets, and Gemini provider config.
5. Add admin E2E and integration tests for completed sections.

## Backend/Database Impacts

- Reads/writes `media_assets`.
- Reads/writes `profiles` and Supabase Auth users.
- Reads/writes `site_settings`, `site_setting_translations`, `social_links`, `quote_recipients`.
- Reads/writes Gemini secret/config storage chosen in Phase 01.
- Writes `ai_drafts`.
- Writes `audit_logs` for settings, user, and AI review actions.

## Frontend Impacts

- Placeholder/demo-only controls are replaced with real submit, denied, unavailable, and empty states.
- Secret fields display masked metadata after save and never reveal raw values.
- AI assistant remains usable for drafts only when Gemini is configured and enabled.

## Route/Page Mapping

| Route | Required completion |
| --- | --- |
| `/admin/media` | Real library/upload/metadata or blocked controls with clear state |
| `/admin/users` | Admin-only user/role/active state management |
| `/admin/settings` | Admin-only Gemini settings plus public-safe settings |
| `/admin/ai-assistant` | Gemini draft generation and fallback state |

## Admin Settings Requirements

- Admin can read system settings.
- Admin can read masked Gemini setting metadata.
- Admin can update/rotate Gemini API key/config.
- Editor cannot access secret settings or Gemini config.
- Raw keys are never displayed after save.
- Invalid Gemini config shows validation status and disables generation.
- Gemini unavailable state does not block manual editing.
- Every settings secret change writes an `audit_logs` row.

## Env/Config Needs

- Gemini secret storage/encryption from Phase 01.
- Gemini model defaults from env or stored config.
- Cloudinary/Resend config if exposed in settings metadata.

## Security/RLS Considerations

- Admin-only server guards for settings routes.
- RLS for secret/config tables.
- Masked API responses only.
- Audit logs for all secret changes.

## Testing Checklist

- Admin can save Gemini settings and sees masked key.
- Editor cannot load Gemini settings route/API.
- Key rotation masks new value and audits change.
- Invalid Gemini config shows fallback.
- AI assistant uses mocked Gemini and writes `ai_drafts`.
- Media/users/settings sections no longer claim fake persistence.

## Acceptance Criteria / Definition Of Done

- Placeholder behavior removed or explicitly disabled with reason.
- Gemini settings meet Admin-only/masking/audit requirements.
- AI assistant has working and unavailable states.
- Admin section E2E passes.

## Rollback/Fallback Notes

- If Gemini service fails, keep settings saved but mark validation failed and disable generation.
- If secure secret storage is incomplete, block production Gemini settings UI.

## Risks/Unknowns

- Supabase Auth admin API behavior may differ between local and remote environments.
- Gemini validation requests may be rate-limited.
