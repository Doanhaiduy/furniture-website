# Plan Gap Matrix

| Area | Current plan says | Actual repo/audit says | Gap | Required correction | Priority |
| --- | --- | --- | --- | --- | --- |
| Architecture | Backend path still needed a decision. | Supabase migrations, RLS, RPCs, and `@supabase/supabase-js` exist; database audit rates schema as excellent. | Treating architecture as undecided slows integration. | Make Supabase-first binding in plan. | High |
| Frontend state | Public/admin prototypes exist. | 11 localized public routes and 10+ admin sections exist. | Mostly accurate but needed route/page-specific mapping. | Keep route inventory and map phases to actual files. | High |
| Admin implementation | Generic admin integration. | Custom `/admin` prototype with demo login and mock data. | Could lead to replacing rather than integrating current UI. | Plan server guards and data wiring around existing admin components. | High |
| Data layer | Mock data must be replaced. | `lib/showroom-data.ts` powers public pages, sitemap, admin stats, quote mock data. | Correct but too broad. | Phase route/component-specific mock replacement. | High |
| Database schema | Supabase migrations present. | 34 app tables, RLS, helpers, public/admin RPCs, optional seed. | Plan did not treat these as binding. | Use migrations/RPCs as implementation backbone. | High |
| RLS/security | Role Model A noted. | RLS policies enforce public/editor/admin/service-role boundaries. | Missing per-phase RLS checks. | Add RLS and server guard requirements to every protected phase. | High |
| Docker | Not covered. | Required by user; no Docker files present. | Local runtime onboarding incomplete. | Add Docker plan and Phase 01 runtime tasks. | High |
| AI provider | Older provider named in phases and env. | User requires Gemini API. `ai_drafts` table exists but provider settings storage is missing. | Wrong provider and missing secret management. | Switch to Gemini; add secure Admin Settings plan. | High |
| Gemini settings | Not covered. | Admin Settings is placeholder; `site_settings` lacks dedicated encrypted Gemini secret storage. | Secret exposure and configuration gap. | Add migration/secret storage task, masking, validation, rotation, audit logs. | High |
| Editors and secrets | Editors denied from privileged settings generally. | Editors must not access Gemini API secrets. | AI secret access not explicit. | Admin-only settings endpoints and RLS; Editor AI use through server only. | High |
| Quote flow | Persist later. | `submit_quote_request` RPC exists; `/api/contact` only validates. | Need direct RPC wiring and notification tracking. | Phase 03 uses RPC and `quote_notifications`. | High |
| Admin Settings | Placeholder. | Settings page exists but not production-backed; secret fields expected. | Missing read/write/security details. | Phase 09 completes settings and Gemini config. | High |
| Audit logs | Mentioned lightly. | `audit_logs` table exists and should track privileged operations. | Missing write requirements. | Phase 06/09 require audit writes. | Medium |
| Seeds/migration | Mock to seed noted. | `0009_optional_local_seed.sql` exists and audit gives mock migration steps. | Needed local/staging gating and media mapping detail. | Phase 08 seed plan with `app.seed_local`. | Medium |
| Env strategy | Outdated variables. | Current `.env.example` still has outdated placeholders; Supabase/Gemini/Docker variables needed. | Agents could configure wrong env. | Update env matrix and plan Phase 01 env correction. | High |
| Testing | Generic commands. | Current tests validate prototype behavior. | Need DB/RLS/Gemini/Docker tests. | Expand test strategy. | High |
