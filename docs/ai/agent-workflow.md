# Agent Workflow

## Purpose

This file defines how AI coding agents should work in this repository before and during implementation.

## Before Coding

Read:

- `AGENTS.md`
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
- Relevant ADRs under `docs/decisions/`
- Relevant architecture docs under `docs/architecture/`

## Working Rules

- Do not implement vague full-project requests.
- State requirement IDs and files before editing implementation code.
- Keep each implementation to one vertical slice.
- Add or update tests for important behavior.
- Run required verification commands.
- Update `docs/specs/traceability-matrix.md`.
- Do not change architecture decisions without updating ADRs.
- Do not introduce cart, payment, order management, or mobile app scope.

## Skill Guidance

- Requirements: use requirement analysis before broad or unclear work.
- CMS CRUD: use the Payload CMS model and Role Model Option A.
- SEO/i18n: verify next-intl, metadata, schema, sitemap, robots, and localized slugs.
- Security: verify Payload access controls, server-side validation, Cloudinary safety, secrets, and quote data privacy.
- Performance: verify the 3-second and PageSpeed Mobile targets for affected public routes.
