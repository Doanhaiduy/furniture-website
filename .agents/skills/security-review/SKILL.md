---
name: security-review
description: Review or harden security for the furniture and sanitary equipment website, including Payload access control, Next.js server authorization, Cloudinary upload validation, form validation, secret handling, admin CMS access, quote data privacy, AI draft safety, and traceability.
---

# Security Review Skill

## Scope

Use this skill for security reviews, fixes, and risk assessments of public forms, Payload CMS access, Cloudinary uploads, environment variables, generated content workflows, and private quote data.

Primary requirement IDs:

- `FR-07-PUB` contact and quote forms
- `FR-07-ADM` quote request management
- `FR-10` CMS user permissions
- `FR-11` AI support
- `NFR-05` security

## Rules

- Read `AGENTS.md`, `docs/specs/requirements.md`, `docs/specs/design.md`, `docs/specs/data-model.md`, and `docs/specs/test-plan.md` first.
- For reviews, lead with findings ordered by severity and include file and line references.
- For fixes, state requirement IDs and files to edit before making changes.
- Verify Payload access controls server-side for pages, collections, globals, hooks, custom actions, and data services.
- Confirm client code never imports or exposes database credentials, Payload secrets, Cloudinary secrets, Resend keys, OpenAI keys, or revalidation secrets.
- Validate all external input with Zod or equivalent before persistence or privileged actions.
- Check Cloudinary upload MIME type, extension assumptions, size, dimensions/resource type, folder policy, and ownership context.
- Check XSS risk in rich text, CMS content rendering, SEO fields, and AI-generated output.
- Check SQL injection risk by preferring Payload APIs or parameterized database access.
- Preserve least privilege in Payload access helpers.
- Add or update tests for meaningful security behavior.
- Update `docs/specs/traceability-matrix.md`.

## Required Outputs

- Requirement IDs reviewed or fixed.
- Findings with severity, evidence, and affected files.
- Fixes made, if any.
- Tests added or updated.
- Residual risks and assumptions.
- Traceability matrix update when implementation changes.
- Verification command results and skipped checks with reasons.

## Verification Commands

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If browser security behavior or admin access changed, run:

```bash
pnpm test:e2e
```
