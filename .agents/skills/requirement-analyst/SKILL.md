---
name: requirement-analyst
description: Analyze, clarify, and scope requirements for the furniture and sanitary equipment website before design or implementation. Use when a request is vague, broad, full-project, missing requirement IDs, needs acceptance criteria, needs SRS/spec alignment, or must be broken into small vertical slices with traceability.
---

# Requirement Analyst Skill

## Scope

Use this skill before technical design or implementation to turn a user request into a clear, testable, traceable requirement slice.

Primary sources:

- `AGENTS.md`
- `docs/srs/Tai_lieu_SRS_Web_do_go_noi_that.xlsx`
- `docs/specs/product-brief.md`
- `docs/specs/requirements.md`
- `docs/specs/design.md`
- `docs/specs/data-model.md`
- `docs/specs/tasks.md`
- `docs/specs/traceability-matrix.md`
- `docs/specs/test-plan.md`

Primary requirement areas:

- Public company, product, showroom, article, contact, SEO, and i18n flows.
- Admin CMS content, product, article, showroom, lead, user, and localized content management.
- Non-functional requirements for performance, responsive UI, compatibility, security, SEO, and extensibility.

## Rules

- Read `AGENTS.md` and all required project documents before analysis.
- Do not implement vague full-project requests.
- Do not edit application code while using this skill.
- Preserve project scope: no cart, online payment, order management, or mobile app.
- Map every proposed task to requirement IDs from `docs/specs/requirements.md`.
- Use local IDs `FR-07-PUB`, `FR-07-ADM`, `FR-08-PUB`, `FR-08-ADM`, `FR-12-PUB`, and `FR-12-ADM` when the SRS ID is reused.
- Enforce the standardized architecture: Next.js 15 frontend, Payload CMS backend/admin, managed PostgreSQL, Cloudinary, next-intl, Resend, Google Maps Embed, OpenAI, Vitest, and Playwright.
- Enforce Role Model Option A: Editor manages publishable content only; Admin manages users, settings, quote requests, and all content.
- Identify missing acceptance criteria, data ownership, authorization needs, i18n needs, SEO needs, validation needs, tests, and traceability impact.
- Ask targeted clarification questions only when the answer cannot be inferred safely from existing docs.
- Keep questions limited and actionable; prefer a concrete recommended assumption when risk is low.
- Break large requests into one small vertical slice that can be implemented, tested, verified, and traced.
- If docs are inconsistent, state the conflict and recommend the smallest doc update before implementation.
- Update spec documents only when the user asked for requirement documentation changes or when missing required docs must be created.

## Required Outputs

- Requirement IDs and source references.
- Concise problem statement.
- In-scope and out-of-scope boundaries.
- Users or roles affected.
- Acceptance criteria in testable form.
- Clarification questions or explicit assumptions.
- Proposed vertical slice and dependencies.
- Suggested files or modules likely to be edited by the later implementation task.
- Test coverage expected, including unit, integration, E2E, security, SEO, i18n, or performance checks as applicable.
- Traceability update needed.
- Recommended next skill or phase, such as `architect`, `nextjs-feature-slice`, `cms-crud`, `seo-i18n`, `playwright-e2e`, `security-review`, or `performance-audit`.

## Verification Commands

For analysis-only work, no application verification command is required.

If requirement documents are changed, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If browser-visible acceptance criteria or E2E scope is changed, plan for:

```bash
pnpm test:e2e
```
