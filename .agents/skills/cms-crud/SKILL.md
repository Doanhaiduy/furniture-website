---
name: cms-crud
description: Implement or review one Payload CMS CRUD/content slice for the furniture and sanitary equipment website using Payload CMS, Next.js App Router, PostgreSQL, Cloudinary, Zod, React Hook Form, shadcn/ui, tests, authorization, i18n, and traceability. Use for products, categories, blog, showrooms, homepage/about content, media, quote requests, settings, and admin users.
---

# CMS CRUD Skill

## Scope

Use this skill for one small Payload CMS create, read, update, delete/archive, publish, or list workflow.

Primary requirement IDs:

- `FR-03` product and category management
- `FR-06` blog and blog category management
- `FR-07-ADM` quote request management
- `FR-08-ADM` showroom management
- `FR-10` CMS and user permissions
- `FR-12-ADM` localized content management
- `NFR-05` security

## Rules

- Read `AGENTS.md` and required files in `docs/specs/` before coding.
- State requirement IDs and files to edit before making implementation changes.
- Implement only one vertical CMS slice at a time.
- Keep ecommerce features out of scope: no cart, payment, orders, inventory, or order tracking.
- Enforce Payload server-side access control before reading or mutating protected data.
- Follow Role Model Option A: Editor manages publishable content only; Admin manages users, settings, quote requests, and all content.
- Never expose database credentials, Payload secrets, Cloudinary secrets, Resend keys, OpenAI keys, or revalidation secrets to client code.
- Use Zod for custom actions/forms and React Hook Form for admin/public forms when forms are needed.
- Keep public UI text in next-intl messages.
- Use semantic HTML and accessible shadcn/ui components.
- Validate Cloudinary media by MIME type, size, resource type, dimensions when practical, and ownership/context.
- Add or update tests for validation, authorization, and important CMS behavior.
- Update `docs/specs/traceability-matrix.md`.

## Required Outputs

- Requirement IDs covered.
- Files edited.
- Payload collection/global/hook changes.
- Server actions, route handlers, or service functions touched.
- Form validation behavior and error states.
- Authorization checks added or reused.
- Tests added or updated.
- Traceability matrix update.
- Verification command results and skipped checks with reasons.

## Verification Commands

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the CMS flow changes browser behavior, run:

```bash
pnpm test:e2e
```
