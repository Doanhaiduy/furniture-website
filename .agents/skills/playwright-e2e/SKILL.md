---
name: playwright-e2e
description: Backup-only Playwright end-to-end automation for the furniture and sanitary equipment website. Use only when Browser MCP cannot support a scenario, when CI/headless/deterministic regression is explicitly required, or when code-level scripts/traces/browser matrices are needed. Do not use this skill as the default for web UI testing, login flows, forms, responsive checks, admin journeys, exploratory QA, or browser debugging; use browser-mcp-qa first.
---

# Playwright E2E Backup Skill

## Scope

Use this skill only after Browser MCP-first validation has been attempted or explicitly deemed insufficient.

Playwright is appropriate for:

- CI/headless deterministic regression.
- Repeated seeded-data assertions.
- Browser matrix automation.
- Code-level scripts, traces, or exact network mocking.
- Scenarios Browser MCP cannot automate reliably.

For normal local UI validation, login checks, form checks, responsive inspection, exploratory QA, and visible browser debugging, use `browser-mcp-qa` first.

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

- Read `AGENTS.md`, `docs/qa/browser-mcp-first-testing.md`, `docs/specs/requirements.md`, `docs/specs/tasks.md`, and `docs/specs/test-plan.md` before writing tests.
- State the Browser MCP limitation or CI/headless/deterministic need before creating or changing Playwright tests.
- State requirement IDs and files to edit before making changes.
- Prefer user-facing locators such as role, label, text from i18n messages, and accessible names.
- Keep test data deterministic and isolated from production data.
- Do not rely on real customer data or production credentials.
- Use authenticated setup helpers for admin tests when available.
- Cover validation failures as well as happy paths for important forms.
- Include mobile and desktop viewports when responsive behavior is in scope.
- Keep tests focused on behavior, not implementation details.
- Update `docs/specs/traceability-matrix.md` with test coverage.
- Do not create Playwright scripts by default for exploratory validation or one-off browser debugging.

## Required Outputs

- Requirement IDs covered.
- Browser MCP evidence already collected, or clear reason Browser MCP is insufficient.
- Test files added or updated.
- Seed, fixture, or auth setup used.
- Browser journeys covered.
- Responsive viewport coverage, if applicable.
- Any skipped or flaky-risk scenarios.
- Traceability matrix update.
- Verification command results.

## Verification Commands

Run the backup E2E suite only after stating the Browser MCP limitation or CI/headless deterministic need:

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
