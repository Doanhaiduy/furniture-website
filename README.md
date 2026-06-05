# Showroom Nội Thất Phương Đông

Bilingual Vietnamese/English showcase website for furniture and sanitary equipment.
The product focuses on brand presence, product catalog discovery, marketing, SEO, and
contact/quote lead generation.

## Scope

In scope:

- Public website: homepage, product catalog with filter/search, about page, blog,
  showroom map/list, contact/quote form, SEO, social links/share, and language switching.
- Admin CMS: homepage/about content, products, categories, blog, quote requests,
  showrooms, media, users, settings, bilingual content, and AI draft assistance.

Out of scope:

- Shopping cart.
- Online payment.
- Order tracking or order management.
- Inventory/fulfillment workflows.
- Mobile app.

## Architecture Baseline

The project targets:

- Next.js 15 App Router and TypeScript for the public frontend.
- Payload CMS 3.x for admin/backend content workflows.
- Managed PostgreSQL for database persistence.
- Cloudinary for media storage and delivery.
- Tailwind CSS v4, shadcn/ui, next-intl, Zod, React Hook Form.
- Resend, Google Maps Embed, and OpenAI through server-side boundaries.
- Vitest and Playwright for verification.

Current package drift to resolve before implementation: `package.json` currently uses
Next.js 16.2.6 and does not include Payload CMS 3.x, Cloudinary, Resend, or OpenAI.

## Quality Gates

Implementation slices must preserve:

- SEO metadata, Open Graph, canonical/alternate links, sitemap/robots, and schema.org
  structured data for public pages.
- Vietnamese and English content through next-intl and CMS-managed localized content.
- Public page and product filter response targets of 3 seconds or less, with PageSpeed
  Mobile at least 80 for launch-critical public pages.
- Server-side validation and authorization for public forms, Payload CMS operations,
  Cloudinary uploads, AI actions, and private quote data access.
- Role Model Option A: Editor manages publishable content only; Admin manages users,
  settings, quote requests, and all content.
- Traceability updates in `docs/specs/traceability-matrix.md`.

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```
