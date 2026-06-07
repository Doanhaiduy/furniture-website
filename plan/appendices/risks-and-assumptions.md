# Risks And Assumptions

## High Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Docker runtime remains missing | Future agents cannot reliably reproduce local environment | Phase 01 must add Docker/Docker Compose or document blocker. |
| Supabase migrations not applied | Integration code may target unavailable tables/RPCs | Phase 01 verifies local/remote migration state. |
| Mock data remains in production paths | Prototype looks complete but does not satisfy persistence requirements | Phases 02, 05, and 08 remove/quarantine mock reads. |
| Admin auth/RBAC missing | Private quote/user/settings/Gemini data may be exposed | Phase 04 enforces Supabase Auth and Role Model A server-side. |
| Gemini key stored unsafely | Provider secret exposure | Phase 01/09 implement encrypted/secret-manager storage, masking, and audit logs. |
| Editor accesses AI secrets | Violates explicit requirement | Admin-only settings APIs/RLS plus E2E denial tests. |

## Medium Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Plain Postgres Docker mode is mistaken for Supabase Auth/RLS equivalence | False confidence in security tests | Docker plan distinguishes Supabase local/remote from Postgres-only smoke. |
| Current docs outside `plan/` still mention older architecture | Future agents may be confused | `architecture-decisions.md` and Phase 01 require docs alignment before coding beyond foundation. |
| Current tests assert prototype strings and mock counts | Tests may fail after real data integration | Update tests to use seeded data or stable selectors. |
| Gemini unavailable or invalid config | AI assistant user flow breaks | Fallback UI and safe `AI_UNAVAILABLE` response are required. |
| Cloudinary/Resend credentials unavailable | Media and notifications blocked | Phase 07 records skipped/fallback status and tests helpers with mocks. |
| Launch monitoring owner missing | NFR-02 cannot be claimed | Phase 10 requires owner/tool/channel documentation. |

## Assumptions

- The current Next.js 16.2.6 package state is accepted for execution planning.
- Supabase/PostgreSQL schema is the backend source of truth for implementation.
- Cloudinary remains the production media provider even though the schema also allows Supabase Storage.
- Gemini is the only AI provider for launch.
- AI output is draft-only and human-reviewed.
- Seed/demo data can be used locally/staging if clearly marked and not used to claim final content approval.
