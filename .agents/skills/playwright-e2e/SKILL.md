---
name: playwright-e2e
description: Create or maintain Playwright end-to-end tests for the furniture and sanitary equipment website covering public journeys, responsive behavior, Vietnamese English i18n, contact quote lead capture, admin auth, CMS CRUD, and traceability.
---

# Playwright E2E Skill

## Scope

Use this skill for Playwright tests that exercise real browser behavior across public pages, localized routes, forms, responsive layouts, admin authentication, and CMS CRUD flows.

Primary requirement IDs:

- FR-01 public home
- FR-04 product filters
- FR-05 product search
- FR-07-PUB contact and quote forms
- FR-07-ADM lead management
- FR-08-PUB showroom display
- FR-12-PUB language switching
- NFR-03 responsive UI
- NFR-04 browser compatibility
- NFR-05 security

## Rules

- Read `AGENTS.md`, `docs/specs/requirements.md`, `docs/specs/tasks.md`, and `docs/specs/test-plan.md` before writing tests.
- State requirement IDs and files to edit before making changes.
- Prefer user-facing locators such as role, label, text from i18n messages, and accessible names.
- Keep test data deterministic and isolated from production data.
- Do not rely on real customer data or production credentials.
- Use authenticated setup helpers for admin tests when available.
- Cover validation failures as well as happy paths for important forms.
- Include mobile and desktop viewports when responsive behavior is in scope.
- Keep tests focused on behavior, not implementation details.
- Update `docs/specs/traceability-matrix.md` with test coverage.

## Required Outputs

- Requirement IDs covered.
- Test files added or updated.
- Seed, fixture, or auth setup used.
- Browser journeys covered.
- Responsive viewport coverage, if applicable.
- Any skipped or flaky-risk scenarios.
- Traceability matrix update.
- Verification command results.

## Verification Commands

Run the E2E suite:

```bash
pnpm test:e2e
```

If application code changed for testability or behavior, also run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
