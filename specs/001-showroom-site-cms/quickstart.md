# Quickstart: Showroom Site CMS Planning Artifacts

## Purpose

Use this quickstart before implementation tasks are generated. It verifies that the
feature plan, ADRs, data model, and contracts are understood and that known dependency
drift is resolved before coding.

## Read First

1. [spec.md](./spec.md)
2. [plan.md](./plan.md)
3. [research.md](./research.md)
4. [data-model.md](./data-model.md)
5. [contracts/public-interfaces.md](./contracts/public-interfaces.md)
6. [contracts/public-rest-api.md](./contracts/public-rest-api.md)
7. [contracts/payload-collections.md](./contracts/payload-collections.md)
8. [contracts/external-integrations.md](./contracts/external-integrations.md)
9. ADRs in [adrs/](./adrs/)

## Pre-Implementation Checks

- Confirm `package.json` is aligned to the approved target: Next.js 15 and Payload CMS
  3.x. The current repo was previously observed with Next.js 16.2.6 and no Payload
  dependency.
- Confirm environment variables are planned for:
  - Public site URL.
  - Payload API/Admin URL.
  - managed PostgreSQL connection.
  - Cloudinary credentials.
  - Resend API key and quote notification recipients.
  - Google Maps embed configuration.
  - OpenAI API key for Payload runtime only.
  - Deployment-specific secrets for Vercel and Railway/Render.
- Confirm quote request recipient ownership and operational review process.
- Confirm the Google Maps embed URLs for each launch showroom.
- Confirm launch product attributes beyond core fields if business wants a fixed
  attribute taxonomy in v1.

## Suggested Implementation Slices

1. Foundation: dependency alignment, `/src` structure, env validation, next-intl route
   shell, Payload service skeleton, Payload/PostgreSQL connection.
2. Homepage: expanded CMS-managed HomePage, two product group cards, localized metadata,
   first viewport responsive E2E.
3. Product catalog: Payload product/category collections, public listing/detail, search,
   filters, localized slugs, Product schema.
4. Quote flow: public quote form, validation, persistence, Resend notification,
   admin/editor lead review.
5. Blog/news: full editorial collections, public listing/detail, localized SEO.
6. Showrooms: showroom collection, public map/list page, Google Maps fallback behavior.
7. Admin roles and media: Admin/Editor enforcement, Cloudinary media validation,
   image alt text rules.
8. AI assistant: draft-only OpenAI generation for descriptions, SEO metadata, and
   vi/en translations.
9. SEO/ops hardening: sitemap, robots, schema coverage, monitoring, browser smoke,
   performance evidence.

## Verification Commands

Run for every implementation slice:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run when browser-visible behavior or admin auth is affected:

```bash
pnpm test:e2e
```

## Traceability

Each implementation task must update `docs/specs/traceability-matrix.md` with:

- Requirement IDs covered.
- Files changed.
- Tests added or updated.
- Verification commands and outcomes.
- Residual security, SEO, i18n, performance, or operational risks.

## Done For Planning

- `plan.md` has passing constitution checks.
- `research.md` and ADRs resolve technical decisions.
- `data-model.md` defines Payload collections, globals, roles, relationships, and state
  transitions.
- `contracts/` defines public, Payload, and external integration behavior.
- Agent context points to this plan.

