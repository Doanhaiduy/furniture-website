# Environment And Secrets Matrix

## Public-Safe Variables

| Variable | Used by | Notes | Phase |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sitemap, robots, canonical URLs | Public URL only. | 01 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase browser/server clients | Public Supabase project URL. | 01 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser client | Public anon key; RLS must protect data. | 01 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional browser delivery helpers | Public cloud name only, no signing secret. | 07 |

## Server-Only Variables

| Variable | Used by | Notes | Phase |
| --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/server-only writes and privileged reads | Never import into client code. | 01 |
| `DATABASE_URL` or `SUPABASE_DB_URL` | migrations, server DB checks | Clarify canonical name in Phase 01. | 01 |
| `CLOUDINARY_API_KEY` | media upload/delete | Server-only. | 07 |
| `CLOUDINARY_API_SECRET` | media upload/delete signing | Server-only. | 07 |
| `CLOUDINARY_UPLOAD_FOLDER` | media organization | Server-only config. | 07 |
| `RESEND_API_KEY` | quote notification sending | Server-only. | 03/07 |
| `QUOTE_NOTIFICATION_RECIPIENTS` | bootstrap/fallback recipients | Prefer DB `quote_recipients` after settings wired. | 03 |
| `GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN` | map URL validation policy | Server-side validator config. | 07 |
| `GEMINI_API_KEY` | local bootstrap/fallback only | Preferred production source is encrypted Admin Settings storage. | 01/07/09 |
| `GEMINI_DEFAULT_MODEL` | local/default AI config | Can be overridden by Admin Settings. | 07 |
| `AI_SECRET_ENCRYPTION_KEY` | encrypting Gemini key if stored in DB | Required if DB secret storage is used. | 01 |
| `REVALIDATION_SECRET` | route/tag revalidation | Server-only. | 02/06 |

## Docker Variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `APP_PORT` | Compose app port | Default `3000`. |
| `SUPABASE_LOCAL_API_URL` | Docker-to-host Supabase local | Typically `http://host.docker.internal:54321`. |
| `SUPABASE_LOCAL_DB_URL` | migrations/smoke | Typically Supabase local DB port `54322`. |

## Admin Settings Stored Values

Admin Settings should manage:

- Public-safe brand/contact/SEO/social settings.
- Quote recipients.
- Cloudinary configuration metadata where safe.
- Gemini enabled flag, model, generation config, validation status, and masked secret metadata.
- Gemini raw API key only through secure encrypted storage or secret manager; never returned after save.

## Secret Rules

- No server secret gets a `NEXT_PUBLIC_` prefix.
- Gemini API key is full Admin-only.
- Editors cannot read or mutate AI provider secrets.
- Browser responses return only masked Gemini metadata.
- Secret changes write `audit_logs`.
- Logs must never include raw keys.
