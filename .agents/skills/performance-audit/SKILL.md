---
name: performance-audit
description: Audit or improve performance for the furniture and sanitary equipment website, including public page load time, product filter latency, Core Web Vitals, image optimization, bundle size, data fetching, responsive rendering, verification, and traceability.
---

# Performance Audit Skill

## Scope

Use this skill for performance measurement, diagnosis, and targeted improvements on public pages, product search and filtering, image-heavy product content, localized routes, and admin screens when they affect user workflows.

Primary requirement IDs:

- FR-04 product filtering
- FR-05 product search
- NFR-01 page speed and PageSpeed Mobile
- NFR-03 responsive UI
- NFR-04 browser compatibility
- NFR-07 extensibility

## Rules

- Read `AGENTS.md`, `docs/specs/requirements.md`, `docs/specs/design.md`, `docs/specs/tasks.md`, and `docs/specs/test-plan.md` first.
- State requirement IDs and files to inspect or edit before making changes.
- Measure or inspect the current behavior before optimizing when feasible.
- Prefer targeted fixes over broad rewrites.
- Keep server components server-side unless interactivity requires client components.
- Optimize images with correct dimensions, formats, alt text, lazy loading, and priority only for critical assets.
- Avoid adding heavy dependencies without a clear performance case.
- Check data fetching, caching, pagination, and query shape for product listing and filters.
- Preserve SEO, i18n, accessibility, and security while optimizing.
- Add or update tests when performance fixes affect behavior.
- Update `docs/specs/traceability-matrix.md`.

## Required Outputs

- Requirement IDs covered.
- Baseline observation or reason measurement was not possible.
- Files inspected and changed.
- Performance risks found.
- Optimizations made.
- Tests added or updated.
- Traceability matrix update.
- Verification command results and any skipped checks with reasons.

## Verification Commands

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If public browser behavior changed, run:

```bash
pnpm test:e2e
```

When a local production server and audit tooling are available, also run a page performance audit against the affected route and record the result.
