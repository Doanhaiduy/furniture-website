# AGENTS.md

## Project

Showroom Nội Thất Phương Đông: website doanh nghiệp Đồ gỗ nội thất & Thiết bị vệ sinh.

Primary goals:

- Giới thiệu doanh nghiệp.
- Hiển thị sản phẩm.
- Thu thập khách hàng tiềm năng qua form liên hệ/báo giá.
- Hỗ trợ marketing, SEO, song ngữ Việt/Anh.
- Cung cấp Admin CMS để quản lý nội dung.
- Hỗ trợ AI content/SEO assistant trong CMS với human review.

Out of scope:

- Không giỏ hàng.
- Không thanh toán trực tuyến.
- Không quản lý đơn hàng.
- Không order tracking.
- Không mobile app.

## Tech Stack

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- CMS/Admin backend: Payload CMS 3.x.
- Database: managed PostgreSQL.
- Media storage/delivery: Cloudinary.
- i18n: next-intl.
- Forms/validation: Zod and React Hook Form.
- Email: Resend.
- Maps: Google Maps Embed.
- AI in CMS: OpenAI for draft-only content/SEO assistance.
- Testing: Vitest and Playwright.
- Deployment: Vercel frontend, separate Payload app/runtime, managed PostgreSQL database.

## Required Documents

Before coding, always read:

- `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`
- `docs/specs/product-brief.md`
- `docs/specs/requirements.md`
- `docs/specs/open-questions.md`
- `docs/specs/design.md`
- `docs/specs/data-model.md`
- `docs/specs/api-contract.md`
- `docs/specs/test-plan.md`
- `docs/specs/tasks.md`
- `docs/specs/traceability-matrix.md`
- `docs/specs/checklist.md`
- Relevant ADRs in `docs/decisions/`
- Relevant architecture docs in `docs/architecture/`

If these files do not exist, create them before implementation.

## Workflow Rules

Do not implement vague full-project requests.

Use this order:

1. Requirement analysis.
2. Clarification.
3. Technical design.
4. Task breakdown.
5. Implement one vertical slice.
6. Add tests.
7. Run verification.
8. Update traceability.

For every implementation task:

- State the requirement IDs.
- State the files you will edit.
- Keep the scope small.
- Do not modify unrelated modules.
- Add or update tests.
- Run lint, typecheck, test, and build.
- Update `docs/specs/traceability-matrix.md`.

## Requirement IDs

Use the baseline IDs in `docs/specs/requirements.md`.

Repeated SRS IDs are normalized as:

- `FR-07-PUB` and `FR-07-ADM`
- `FR-08-PUB` and `FR-08-ADM`
- `FR-12-PUB` and `FR-12-ADM`

## Code Rules

- No hardcoded public UI text outside next-intl messages.
- Validate all public forms, query params, admin mutations, upload metadata, and AI requests server-side.
- Admin/CMS routes and Payload operations must enforce server-side authorization.
- Do not expose database credentials, Payload secrets, Cloudinary secrets, Resend keys, Google Maps keys, OpenAI keys, or revalidation secrets to client code.
- Use semantic HTML and accessible components.
- Public pages must include localized SEO metadata.
- Product and blog/article pages need localized slug-based routes.
- Image/video upload must validate file type, size, resource type, and ownership/context.
- Do not leave mock data in production routes unless clearly marked as seed/demo.
- Do not introduce cart, payment, order, order tracking, inventory, or mobile-app behavior.

## Role Rules

Role Model Option A is binding:

- Editor manages publishable content only.
- Admin manages users, settings, quote requests, media governance, integrations, and all content.

Editors must not access quote requests, user management, privileged settings, or integration secrets.

## Verification Commands

Run before task completion:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If E2E behavior is affected:

```bash
pnpm test:e2e
```

## Done Means

A task is done only when:

- Requirement acceptance criteria are satisfied.
- Tests exist for important behavior.
- lint/typecheck/test/build pass, or an environment blocker is documented.
- UI is responsive when UI is affected.
- i18n is handled for public UI/content.
- SEO is handled for public pages.
- Security risks are documented or fixed.
- Traceability is updated.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-showroom-site-cms/plan.md`. If that plan conflicts with
the docs under `docs/`, the newer `docs/` architecture decisions win and
the Spec Kit plan must be updated before coding the affected slice.
<!-- SPECKIT END -->
