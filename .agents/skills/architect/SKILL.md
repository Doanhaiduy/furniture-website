---
name: architect
description: Create or review technical architecture, module boundaries, Payload CMS data model, API contracts, RBAC, Cloudinary media strategy, deployment plan, and ADRs for the furniture and sanitary equipment website.
---

# Architect Skill

Use this skill after requirements are clarified and before implementation.

## Required Outputs

Create or update:

- `docs/specs/design.md`
- `docs/specs/data-model.md`
- `docs/specs/api-contract.md`
- `docs/decisions/adr-001-tech-stack.md`
- Other ADRs in `docs/decisions/` when decisions change
- Architecture notes in `docs/architecture/`

## Required Sections

- Architecture overview
- Module boundaries
- Folder structure
- Payload collections/globals
- Auth and RBAC
- Cloudinary media strategy
- i18n strategy
- SEO strategy
- Testing strategy
- Deployment strategy
- Risks and tradeoffs

## Preferred Stack

- Next.js 15 App Router
- TypeScript
- Payload CMS 3.x
- Managed PostgreSQL
- Cloudinary
- Tailwind CSS v4
- shadcn/ui
- next-intl
- Zod
- React Hook Form
- Resend
- Google Maps Embed
- OpenAI
- Vitest
- Browser MCP-first QA
- Playwright backup for CI/headless/deterministic automation

## Rules

- Do not over-engineer.
- Do not add ecommerce features.
- Public pages must be SEO-friendly.
- Payload CMS/Admin features must require server-side authorization.
- Role Model Option A is binding: Editor manages publishable content only; Admin manages users, settings, quote requests, and all content.
