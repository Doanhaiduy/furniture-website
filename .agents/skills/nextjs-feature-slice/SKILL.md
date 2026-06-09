---
name: nextjs-feature-slice
description: Implement one small Next.js feature slice from docs/specs/tasks.md with TypeScript, Tailwind, shadcn/ui, validation, tests, Browser MCP-first journey checks, and traceability.
---

# Next.js Feature Slice Skill

Use this skill when implementing one task from docs/specs/tasks.md.

## Rules

- Implement only one task at a time.
- Read AGENTS.md first.
- Read requirements.md, design.md, data-model.md, tasks.md.
- State requirement IDs before coding.
- List files to edit before editing.
- Do not modify unrelated modules.
- Add or update unit/integration tests for code-level behavior.
- Validate browser-visible behavior with Browser MCP first.
- Update traceability matrix.

## Verification

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If UI routing, authentication, localization, forms, responsive behavior, SEO-visible routes, or rate-limit UX is affected, run Browser MCP journey checks first:

- Open the affected page in the real browser session.
- Inspect the current visible state before acting.
- Perform the user journey in natural language steps.
- Verify expected visible outcomes, route changes, data states, and error/success messages.
- Capture screenshots or snapshots when useful.
- Note console/network errors when relevant.

Use Playwright only as backup when Browser MCP cannot cover the scenario, or when CI/headless/deterministic regression automation is explicitly required:

```bash
pnpm test:e2e
```

## Done Criteria

- Acceptance criteria met.
- Unit/integration tests pass where relevant.
- Browser MCP journey evidence is recorded for browser-visible changes.
- Playwright backup is used only with a stated Browser MCP limitation or CI/headless need.
- No TypeScript errors.
- No production mock data.
- i18n considered.
- SEO considered for public pages.
