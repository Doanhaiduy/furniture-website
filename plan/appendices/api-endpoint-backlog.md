# API Endpoint Backlog

## Existing Endpoint To Repair

| Endpoint | Current behavior | Required next state |
| --- | --- | --- |
| `POST /api/contact` | Parses JSON, validates `quoteRequestSchema`, rejects honeypot, returns demo success. | Validate, rate-limit, call `submit_quote_request`, track `quote_notifications`, return public-safe success/error. |

## Public Read APIs Or Server Helpers

Prefer server-side Supabase calls from React Server Components where no browser API is needed. Add route handlers only when the browser needs dynamic client-side fetching.

| Area | Supabase contract | Routes affected | Requirements |
| --- | --- | --- | --- |
| Homepage | `content_pages`, `page_sections`, `public_products`, `public_blog_posts`, `public_showrooms`, settings tables | `/[locale]` | FR-01, FR-12-PUB, NFR-06 |
| About | `content_pages`, `page_sections`, media tables | `/[locale]/about` | FR-02, FR-12-PUB, NFR-06 |
| Products | `public_products`, product/category/attribute tables | `/[locale]/products`, `/[locale]/products/[slug]` | FR-03, FR-04, FR-05 |
| Blog | `public_blog_posts`, blog tables | `/[locale]/blog`, `/[locale]/blog/[slug]` | FR-06 |
| Showrooms | `public_showrooms`, showroom tables | `/[locale]/showrooms` | FR-08-PUB |
| Settings/social | `site_settings`, `site_setting_translations`, `social_links` | layout/footer/header/contact | FR-09, FR-10 |
| Sitemap/robots | published public records only | `/sitemap.xml`, `/robots.txt` | NFR-06 |

## Public Mutations

| Endpoint/action | Supabase contract | Requirements |
| --- | --- | --- |
| `POST /api/contact` | `submit_quote_request(payload jsonb)` | FR-07-PUB, FR-07-ADM, NFR-05 |
| Revalidation endpoint/action | server-only secret plus affected routes/tags | NFR-01, NFR-06 |

## Admin Auth

| Capability | Contract | Requirements |
| --- | --- | --- |
| Login/logout/session | Supabase Auth + `profiles` | FR-10, NFR-05 |
| Current user/profile | authenticated user plus active profile | FR-10 |
| Admin/Editor guards | server helper plus RLS | FR-07-ADM, FR-10, NFR-05 |

## Admin Reads

| Area | Contract | Access |
| --- | --- | --- |
| Dashboard | aggregate Supabase queries/RPCs | Admin sees all; Editor sees publishable-content metrics only |
| Products/categories | tables and translations | Admin/Editor |
| Blog/categories | tables and translations | Admin/Editor |
| Showrooms | tables and translations | Admin/Editor per Role Model A publishable content |
| Quotes | `admin_quote_search`, quote detail queries | Admin only |
| Users | `profiles` plus Supabase Auth admin API | Admin only |
| Media | `media_assets`, translations | Editor scoped; Admin full |
| Settings | public-safe vs privileged split | Admin only for privileged; public-safe reads only where needed |
| AI drafts | `ai_drafts` | Admin/Editor for own/allowed drafts; provider settings Admin only |

## Admin Mutations

| Area | Contract | Required controls |
| --- | --- | --- |
| Products/categories | create/update/archive tables + translations | Zod, RLS, audit logs |
| Blog/categories | create/update/archive tables + translations | Zod, localized slug validation, audit logs |
| Showrooms | create/update/archive tables + translations | map URL validation, audit logs |
| Quotes | status/assignment/notes/email updates | Admin only, event log, audit logs |
| Users/roles | Supabase Auth admin API + `profiles` | Admin only, audit logs |
| Settings/social | settings tables plus secret storage | Admin only for privileged/Gemini settings, audit logs |
| Media | Cloudinary + `media_assets` | type/size/context validation, reference checks |
| Gemini drafts | Gemini service + `ai_drafts` | no secret exposure, no quote data, draft-only |

## Gemini-Specific Endpoints

| Endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /api/admin/settings/ai` | Admin only | Return enabled/model/config/validation/masked key metadata only. |
| `PUT /api/admin/settings/ai` | Admin only | Validate, rotate/mask/encrypt Gemini key/config, write audit log. |
| `POST /api/admin/ai/draft` | Admin or Editor, content-scoped | Use server-side Gemini client if enabled; write `ai_drafts`; return draft output. |
| `PUT /api/admin/ai/drafts/[id]` | Admin or owning/allowed Editor | Accept/discard draft; write audit log. |
