# Documentation Audit Report

## Audit Date

2026-06-01

## Scope Audited

- `docs/`
- `.agents/`
- `.specify/`
- `specs/001-showroom-site-cms/`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- SRS workbook: `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`

## SRS Baseline Check

The SRS workbook contains:

- Overview: project name, version 1.0, goals, Vietnamese/English, and excluded cart/payment/orders/mobile app.
- Functional requirements: FR-01 through FR-12, with repeated FR-07/FR-08/FR-12 for public/admin scopes.
- Non-functional requirements: NFR-01 through NFR-07.
- Stakeholders: customer, PM, developer, tester.

The official baseline supplied by the user matches the workbook and adds implementation decisions for role model, product/blog/homepage/media/frontend-backend architecture.

## Major Gaps Found

| Area | Gap | Resolution |
| --- | --- | --- |
| Architecture | Existing docs still referenced Supabase Auth, Supabase Storage, RLS, and service role keys. | Replaced with Payload auth/access control, managed PostgreSQL, and Cloudinary. |
| Homepage | Homepage was partly modeled as hero/banner editing only. | Expanded HomePage global to include required marketing sections and visibility/order toggles. |
| Roles | Some planning docs allowed Editors to manage quote requests. | Corrected to Option A: Editor manages publishable content only; Admin manages quote requests/users/settings/all content. |
| Media | Cloudinary was missing from most docs. | Added ADR and data model for Cloudinary-backed Payload Media. |
| API contracts | Payload/BFF boundaries were weak and Supabase-specific. | Rewritten around server-side Payload access, thin Next.js BFF, and external integrations. |
| Security | Security docs referenced Supabase service role/RLS instead of Payload access and Cloudinary upload safety. | Updated security architecture and tests. |
| Operations | Deployment/monitoring docs were missing. | Added deployment and uptime monitoring expectations. |
| AI workflow | Prompt boundaries and human review workflow were missing. | Added AI workflow and prompt library. |
| Traceability | Existing matrix mapped requirements to tests but not consistently to design/implementation areas. | Rewritten matrix maps every FR/NFR to design, implementation, tests, and status. |
| Agent rules | `AGENTS.md` displayed mojibake in shell output and used old stack items. | Rewritten in UTF-8 with current architecture. |

## Contradictions Resolved

- Supabase Storage vs Cloudinary: Cloudinary is now the media decision.
- Supabase Auth vs Payload CMS auth: Payload auth/access control is now the admin decision.
- Editor quote access vs Role Model Option A: Editor quote access removed.
- Banner-only homepage vs CMS-managed marketing homepage: expanded homepage model is now required.
- Broad admin route model vs Payload primary admin: Payload Admin is now primary; Next.js admin can be a redirect/status shell.

## Remaining Questions

Remaining questions are documented in `docs/specs/open-questions.md`. They do not block foundation/homepage coding, but they do block the affected slices or production launch:

- Final product taxonomy, filters, and price bands.
- Search relevance and accent-insensitive behavior.
- Quote recipients, lead retention, and first Admin bootstrap.
- Launch showroom/map/social/content assets.
- Monitoring tool and browser version matrix.
- AI model/cost limits and media account limits.

## Go / No-Go Assessment

Go for coding phase with constraints:

- Start with foundation, Payload access/media, HomePage/AboutPage CMS, i18n shell, and homepage public route.
- Do not start full catalog, quote, AI, or launch-hardening slices until their open questions are answered.
- First implementation task must align dependencies to the active stack and testing policy: Next.js, Supabase/PostgreSQL, Cloudinary, Resend, Gemini, Vitest, Browser MCP-first QA, and Playwright backup only for CI/headless deterministic gaps.

No-Go for production launch until:

- Monitoring and alert ownership are configured.
- Final launch content/media is approved.
- Slice-specific tests pass and traceability rows include concrete files/test evidence.
