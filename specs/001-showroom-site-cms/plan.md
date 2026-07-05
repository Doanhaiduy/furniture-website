# Implementation Plan: Showroom Site CMS

**Branch**: `001-showroom-site-cms` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-showroom-site-cms/spec.md`

## Summary

Build a bilingual Vietnamese/English showroom website and Admin CMS for Showroom Nội
Thất Phương Đông. The public site covers brand introduction, CMS-managed homepage,
structured product catalog, product search/filter, quote submission, showroom map,
social sharing, blog/news, SEO, and one-click locale switching. The admin surface uses
Payload CMS for products, blog, showrooms, quote requests, users/roles, bilingual
content, media, and draft-only AI assistance.

The architecture is a feature-sliced TypeScript codebase under `src/`, with a Next.js 15
public frontend, a self-hosted Payload CMS service, managed PostgreSQL and Cloudinary,
next-intl locale routing, Resend email notifications, Google Maps Embed API, OpenAI
draft generation, Vitest, Playwright, and GitHub Actions.

## Technical Context

**Language/Version**: TypeScript strict mode with Next.js 15 App Router target

**Primary Dependencies**: Payload CMS 3.x, Payload PostgreSQL adapter with managed
PostgreSQL, Cloudinary, Tailwind CSS v4, shadcn/ui, next-intl, Zod, React Hook Form,
OpenAI API, Resend, Google Maps Embed API

**Storage**: managed PostgreSQL through Payload adapter for CMS/content data; Cloudinary
for product, blog, showroom, hero, and content media

**Testing**: Vitest for unit tests, Playwright for E2E/responsive/auth/i18n/SEO smoke
tests, plus lint, typecheck, and production build

**Target Platform**: Responsive web on desktop, tablet, and mobile; public frontend on
Vercel; Payload CMS service on Railway or Render; managed PostgreSQL and Cloudinary

**Project Type**: Bilingual marketing/catalog website with Admin CMS and lead capture

**Performance Goals**: Public page load <= 3 seconds, product filter results <= 3
seconds for launch data, PageSpeed Mobile >= 80 for launch-critical public pages

**Constraints**: No shopping cart, online payment, order tracking, order management, or
mobile app. Public pages require localized metadata, Open Graph, canonical/alternate
links, sitemap/robots, and schema.org structured data.

**Scale/Scope**: Public routes plus Payload CMS modules for products, categories, blog,
showrooms, quote requests, media, users, roles, bilingual content, homepage hero, and
AI-assisted draft generation.

**Pre-implementation Alignment**: Current `package.json` uses Next.js 16.2.6 and does
not include Payload CMS 3.x. Before implementation tasks begin, dependencies must be
aligned to the approved Next.js 15 and Payload CMS 3.x target or the constitution must
be amended.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Scope**: PASS. Plan supports brand presence, product catalog, lead generation,
  Admin CMS, SEO, i18n, and draft-only AI assistance. No cart, payment, order tracking,
  order management, or mobile app scope is introduced.
- **SEO-first**: PASS. Public pages require localized metadata, canonical/alternate
  links, Open Graph, sitemap/robots, and schema.org outputs for Organization, Product,
  Article, and LocalBusiness/Store surfaces.
- **Bilingual**: PASS. next-intl owns `/vi/...` and `/en/...` routing. Payload content
  models use explicit Vietnamese and English localized fields/slugs. Missing required
  localized content blocks final publication.
- **Performance/accessibility/compatibility**: PASS. Route and catalog result targets
  remain <= 3 seconds, PageSpeed Mobile target remains >= 80, and responsive/browser
  coverage is planned through Playwright and manual browser smoke checks.
- **Security**: PASS. Public forms, CMS mutations, media uploads, AI prompts/outputs,
  and filters require server-side validation; admin access is role-gated; privileged
  secrets remain server-only; private quote request data is Admin-only.
- **Architecture**: PASS. Feature slices isolate public routes, Payload collections,
  CMS hooks, i18n, SEO, API clients, validation, and tests without requiring ecommerce
  infrastructure.
- **Testing and traceability**: PASS. Design artifacts define unit, integration, E2E,
  security, SEO, performance, and traceability expectations for later tasks.

**Post-design re-check**: PASS. ADRs, data model, contracts, and quickstart preserve all
constitution gates. The only implementation precondition is dependency alignment from
the current repo to the approved target stack.

## Project Structure

### Documentation (this feature)

```text
specs/001-showroom-site-cms/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  adrs/
    001-application-topology.md
    002-payload-cms-supabase.md
    003-i18n-seo-routing.md
    004-product-catalog-model.md
    005-lead-notification-flow.md
    006-ai-assistant-drafts.md
    007-media-storage.md
    008-feature-slice-structure.md
  contracts/
    public-interfaces.md
    public-rest-api.md
    payload-collections.md
    external-integrations.md
```

### Source Code (repository root)

```text
src/
  app/
    [locale]/
      (public)/
        page.tsx
        about/page.tsx
        products/page.tsx
        products/[slug]/page.tsx
        blog/page.tsx
        blog/[slug]/page.tsx
        showrooms/page.tsx
        contact/page.tsx
      (admin)/
        admin/page.tsx
      layout.tsx
    api/
      products/route.ts
      products/[slug]/route.ts
      products/search/route.ts
      categories/route.ts
      blog/route.ts
      blog/[slug]/route.ts
      showrooms/route.ts
      contact/route.ts
      revalidate/route.ts
    sitemap.ts
    robots.ts
  components/
    ui/
    layout/
    public/
    forms/
    cms/
  features/
    products/
      components/
      queries/
      schemas/
      seo/
      types.ts
    showrooms/
    blog/
    contact/
    homepage/
    i18n/
    seo/
    media/
    auth/
  lib/
    payload/
    cloudinary/
    resend/
    openai/
    google-maps/
    validation/
    env/
    permissions/
    seo/
  payload/
    collections/
      Products.ts
      ProductCategories.ts
      BlogPosts.ts
      BlogCategories.ts
      Showrooms.ts
      QuoteRequests.ts
      Users.ts
    globals/
      Homepage.ts
      SiteSettings.ts
    hooks/
      aiDrafts.ts
      quoteNotifications.ts
      publishValidation.ts
      mediaValidation.ts
    access/
      roles.ts
    payload.config.ts
  messages/
    vi.json
    en.json
tests/
  unit/
  integration/
  e2e/
```

**Structure Decision**: Use `src/` for all application code. Public customer routes
live under locale-aware route groups. Payload CMS collection/global/hook definitions
live under `src/payload/` and are deployed as the self-hosted Payload service. The
Next.js admin route group either redirects to the Payload Admin URL or hosts a thin
admin entry page with links/status; the built-in Payload admin UI remains the primary
CMS interface.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate Payload CMS service | Required by approved self-hosted Payload CMS and deployment split | A custom Next.js-only admin would duplicate CMS concerns and conflict with the selected Payload CMS decision. |
| External AI, email, and map services | Required for AI drafts, quote notifications, and Google Map display | Building equivalents in-house is outside scope and would not improve the showroom/catalog goals. |
| Payload plus managed database/media boundary | Required to use Payload CMS with managed PostgreSQL and Cloudinary | A custom CMS or filesystem media approach would conflict with approved architecture. |

## Phase 0 Research Output

Research and ADR decisions are captured in [research.md](./research.md) and individual
ADR files under [adrs/](./adrs/). All technical context unknowns are resolved.

## Phase 1 Design Output

- Data model: [data-model.md](./data-model.md)
- Public and CMS contracts: [contracts/public-interfaces.md](./contracts/public-interfaces.md),
  [contracts/public-rest-api.md](./contracts/public-rest-api.md),
  [contracts/payload-collections.md](./contracts/payload-collections.md),
  [contracts/external-integrations.md](./contracts/external-integrations.md)
- Quickstart: [quickstart.md](./quickstart.md)

## Verification Plan

Every implementation slice must run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run `pnpm test:e2e` when public routes, CMS auth, responsive behavior, quote flow,
i18n, SEO, or admin workflows are touched.

