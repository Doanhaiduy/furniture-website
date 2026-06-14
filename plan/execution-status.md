# Execution Status Board

This is the central status board tracking progress of the Showroom site implementation.

---

## 1. Project Overview & Meta Information

- **Current Active Phase**: Re-audit Phase 03: Missing Admin Sections & Services
- **Last Completed Task**: Tích hợp API settings server-side, sửa lỗi localStorage ở Admin Settings; hoàn thiện UI Quản lý tài khoản CMS (cho phép sửa role và active status thông qua modal); khắc phục cursor-pointer trên Hero Carousel public và căn chỉnh cân đối trục tâm Floating FAB menu. (June 14, 2026)
- **Next Recommended Task**: Tiếp tục Re-Audit v2 Sprint (refactor Brands admin và Promotions admin).
- **Last Updated**: 2026-06-14T09:00:00+07:00
- **Status Summary**: Tích hợp cài đặt hệ thống, quản lý tài khoản và sửa các lỗi UX/UI đã được kiểm chứng hoàn thành (lint + typecheck + test pass).

---

## 2. Phase Status Matrix

| Phase | Title | Status | Target Completion | Actual Completion | Notes |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **01** | [Foundation & Infrastructure](file:///d:/THCode/AI/furniture-website/plan/phases/phase-01-foundation/README.md) | **done** | 2026-06-08 | 2026-06-07 | Docker runtime optimized, Env validation schema, Supabase SSR helpers, Gemini settings table, health check verified |
| **02** | [Public Data Integration](file:///d:/THCode/AI/furniture-website/plan/phases/phase-02-public-data-integration/README.md) | **done** | 2026-06-10 | 2026-06-08 | Localized public reads, catalog listing, dynamic showrooms, seo.ts metadata, sitemap.xml and robots.txt |
| **03** | [Quote Flow & Rate Limiting](file:///d:/THCode/AI/furniture-website/plan/phases/phase-03-quote-flow/README.md) | **done** | 2026-06-12 | 2026-06-08 | Zod validation, honeypot, rate-limit, Supabase persistence, Resend email, notification tracking |
| **04** | [Auth & Admin Access Control](file:///d:/THCode/AI/furniture-website/plan/phases/phase-04-auth-and-admin-access/README.md) | **done** | 2026-06-14 | 2026-06-08 | AuthProvider, login form, server helpers, proxy guard (Next 16 proxy.ts), role-aware AdminShell, typecheck+test+build pass |
| **05** | [Admin Read Integration](file:///d:/THCode/AI/furniture-website/plan/phases/phase-05-admin-read-integration/README.md) | **done** | 2026-06-16 | 2026-06-09 | Reusable DataTable, admin stats, secure quotes view, QuoteDetailDialog modal integrated |
| **06** | [Admin Write Integration](file:///d:/THCode/AI/furniture-website/plan/phases/phase-06-admin-write-integration/README.md) | **done** | 2026-06-18 | 2026-06-13 | Product/Category/Blog/Showroom CRUD, audit logs, archive confirmation, Editor role constraints, and focused Playwright backup verification completed |
| **07** | [Media & Third-Party Services](file:///d:/THCode/AI/furniture-website/plan/phases/phase-07-media-and-third-party-services/README.md) | **in-progress** | 2026-06-20 | - | Sync media mutations and Contact API fix completed; moving to Cloudinary, Resend, and dynamic site settings di |
| **08** | [Data Migration & Seeding](file:///d:/THCode/AI/furniture-website/plan/phases/phase-08-data-migration-and-seeding/README.md) | **not-started** | 2026-06-21 | - | Local database seeding scripts, final migration validation |
| **09** | [Missing Admin Sections](file:///d:/THCode/AI/furniture-website/plan/phases/phase-09-missing-admin-sections/README.md) | **not-started** | 2026-06-23 | - | Media library manager, user admin, Gemini configuration screen |
| **10** | [QA Hardening & Launch](file:///d:/THCode/AI/furniture-website/plan/phases/phase-10-qa-hardening-and-launch/README.md) | **not-started** | 2026-06-25 | - | Full test runs, Docker optimization, Vercel edge testing, final backup checks |

### Status Legend
- **`not-started`**: No checklist items completed in this phase.
- **`in-progress`**: Active implementation phase; some checklist items completed, no active blockers.
- **`blocked`**: Handoff halted due to active tool or requirement blockers listed in blockers.md.
- **`done`**: All checklist items completed and verified by tests.

---

## 3. Active Blockers & Clarifications

*No active blockers at this time.*
* (See [blockers.md](file:///d:/THCode/AI/furniture-website/plan/blockers.md) for full history and closed items).

---

## 4. Key Implementation Rules (Binding Decisions)

- **Role Model (Option A)**:
  - **Editor**: Can read/write content only (`products`, `categories`, `blog_posts`, `showrooms`, `media`).
  - **Admin**: Full access. Only admins can see quote requests, user profiles, or modify system settings.
  - Editors must be strictly denied access at both the Next.js Routing level (middleware/server actions) and Supabase database level (RLS Policies).
- **Gemini Key Storage**:
  - Keys must be stored in `integration_secrets` table (managed via migration `20260607_gemini_settings.sql` in Phase 01).
  - Column `encrypted_value` is encrypted at rest using AES-GCM-256 via server-only key `AI_SECRET_ENCRYPTION_KEY`.
  - In public/admin queries, return only the `masked_hint` (e.g. `****5678`), never the raw key.
- **Quote Rate Limiting**:
  - Implement a container-local, in-memory sliding-window throttle on the server route handler `/api/contact` to prevent spam, combined with a honeypot field.
