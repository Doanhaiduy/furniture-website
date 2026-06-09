# Technical Design

## Scope

This design prepares the project for coding the bilingual Showroom Nội Thất Phương Đông website and Payload CMS. It covers all requirements in `docs/specs/requirements.md` and standardizes the approved architecture:

- Next.js 15 App Router frontend.
- Payload CMS 3.x backend/admin.
- Managed PostgreSQL database.
- Cloudinary media storage and delivery.
- next-intl, Resend, Google Maps Embed, OpenAI, Vitest, Browser MCP-first QA, and Playwright backup for CI/headless deterministic automation.

## Runtime Topology

| Runtime | Responsibility | Public Exposure |
| --- | --- | --- |
| Next.js frontend on Vercel | Public routes, localized rendering, SEO metadata, sitemap/robots, thin BFF route handlers/server actions. | Public website and selected public APIs only. |
| Payload app | Admin UI, authentication, RBAC, collections/globals, CMS APIs, hooks, publication validation, AI/admin actions. | Admin/CMS URL plus server-to-server API access. |
| Managed PostgreSQL | Payload persistence for content, users, settings, quote requests, and audit fields. | No direct public access. |
| Cloudinary | Media storage, transformations, responsive delivery. | Public delivery URLs only; upload credentials remain server-only. |
| External services | Resend email, Google Maps Embed, OpenAI. | Server-mediated except public map embeds. |

## Module Boundaries

| Area | Owns | Must Not Own |
| --- | --- | --- |
| `src/app/[locale]` public routes | Page composition, server data loading, metadata, public BFF calls. | Admin authorization decisions or direct secret usage in client components. |
| `src/payload` | Collections, globals, access rules, hooks, CMS admin customizations. | Public marketing UI layout. |
| `src/features/*` | Domain queries, schemas, UI components, SEO helpers per slice. | Cross-cutting secrets or unrelated collections. |
| `src/lib/payload` | Server-only Payload client helpers and API normalization. | Browser imports. |
| `src/lib/cloudinary` | Signed upload/delete helpers, URL validation, transformation policy. | Product/category business rules. |
| `src/lib/resend` | Quote notification client and email templates. | Lead persistence ownership. |
| `src/lib/openai` | Server-only AI client and safe prompt wrappers. | Direct publication of generated content. |
| `src/lib/seo` | Metadata, schema, sitemap data builders. | CMS write flows. |
| `src/messages` | next-intl UI messages. | CMS-managed public body content. |

## Proposed Source Structure

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
      admin/page.tsx
      layout.tsx
    api/
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
    homepage/
    about/
    products/
    blog/
    showrooms/
    contact/
    seo/
    media/
  lib/
    payload/
    cloudinary/
    resend/
    openai/
    google-maps/
    env/
    security/
    seo/
  payload/
    collections/
    globals/
    hooks/
    access/
    payload.config.ts
  i18n/
  messages/
tests/
  unit/
  integration/
  e2e/
```

Existing root-level `app/` can be migrated incrementally as part of foundation tasks. New implementation should target `src/`.

## Public Routes

| Route | Requirements | Data Source | Notes |
| --- | --- | --- | --- |
| `/{locale}` | FR-01, FR-12-PUB, NFR-03, NFR-06 | Payload `HomePage`, `ProductCategories`, `Products`, `Showrooms`, `SiteSettings` | First viewport must show both product groups. |
| `/{locale}/about` | FR-02, FR-12-PUB, NFR-06 | Payload `AboutPage` | CMS-managed vision, mission, capability sections. |
| `/{locale}/products` | FR-03, FR-04, FR-05, NFR-01 | Payload `Products`, `ProductCategories` | URL-driven filters/search; no cart. |
| `/{locale}/products/{slug}` | FR-03, FR-12-PUB, NFR-06 | Payload localized product slug | Product schema and quote CTA. |
| `/{locale}/blog` | FR-06, NFR-06 | Payload `BlogPosts`, `BlogCategories` | Published posts only. |
| `/{locale}/blog/{slug}` | FR-06, NFR-06 | Payload localized blog slug | Article schema. |
| `/{locale}/showrooms` | FR-08-PUB, NFR-03 | Payload `Showrooms` | Google Maps embed plus fallback link. |
| `/{locale}/contact` | FR-07-PUB, NFR-05 | Payload `QuoteRequests`, SiteSettings | Public form with Zod validation and Resend hook. |

## Admin/CMS Design

Payload CMS is the primary admin. A minimal Next.js `/admin` route may redirect to the Payload admin URL or show environment status.

| Capability | Payload Area | Roles |
| --- | --- | --- |
| Products/categories | `Products`, `ProductCategories` | Admin full; Editor publishable content only. |
| Blog/categories | `BlogPosts`, `BlogCategories` | Admin full; Editor publishable content only. |
| Homepage/about/settings | `HomePage`, `AboutPage`, `SiteSettings` | Admin full; Editor only publishable page content, not privileged settings. |
| Showrooms | `Showrooms` | Admin full; Editor publishable content only. |
| Quote requests | `QuoteRequests` | Admin only. |
| Users/roles | `Users` | Admin only. |
| Media | `Media` upload collection backed by Cloudinary | Admin full; Editor upload/use for publishable content. |
| AI drafts | Custom admin actions/hooks | Admin and Editor for publishable content only; no quote/private data context. |

## Homepage CMS Model

The homepage must be a CMS-managed marketing surface, not a banner-only model. Payload `HomePage` must support at least:

- Hero title/subtitle per locale.
- Hero image/video.
- Primary CTA and secondary CTA per locale.
- Two fixed primary product-group cards above the fold.
- Trust badges or quick highlights.
- Intro/company summary block.
- Featured categories.
- Featured products.
- Showroom teaser.
- Quote CTA strip.
- Testimonial or partner/logo strip.
- SEO fields for homepage.
- Visibility/order toggles for optional sections.

## Data And Persistence

Payload's PostgreSQL adapter owns schema creation/migrations for CMS collections and globals. PostgreSQL should be managed by a provider suitable for production backups and uptime requirements. Direct SQL is reserved for migrations, indexes, reporting, or tasks that Payload APIs cannot handle safely.

Public frontend reads should use server-side Payload helpers or thin route handlers. Browser code must not receive Payload secrets or database credentials.

## i18n

- `next-intl` owns locale routing for `vi` and `en`.
- UI strings live in `src/messages/vi.json` and `src/messages/en.json`.
- CMS fields use Payload localization or explicit localized groups for public fields.
- Product, category, and blog detail routes use localized slugs.
- Missing required localized fields block publication for that locale.
- Metadata includes canonical and alternate language URLs.

## SEO

- Use App Router metadata APIs on all public routes.
- Generate title, description, canonical, Open Graph, and alternates per locale.
- `sitemap.ts` includes only published public localized content.
- `robots.ts` excludes admin, preview, drafts, and private API paths.
- Schema targets: `Organization`, `Product`, `BlogPosting` or `Article`, `LocalBusiness` or `Store`, and `BreadcrumbList` where useful.

## Security

- Payload access controls enforce Admin/Editor permissions on every collection/global.
- Next.js server actions/route handlers repeat validation and permission checks when touching protected data.
- Public input uses Zod and server-side sanitization.
- Rich text rendering must whitelist supported nodes/marks and prevent script execution.
- Cloudinary upload signatures are generated server-side only.
- Resend, OpenAI, Cloudinary, Payload, database, and map credentials stay server-only unless explicitly safe as public embed configuration.

## Performance

- Prefer React Server Components for public pages.
- Paginate product, blog, media, and quote lists.
- Use Cloudinary responsive transformations instead of serving oversized originals.
- Cache public CMS reads with route/tag revalidation after publish changes.
- Keep JS client components limited to interactions that need them.
- Product filters/search must use indexed Payload/PostgreSQL queries for launch data.

## Testing

Every implementation slice runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Browser MCP journey checks first when browser-visible behavior, admin auth, i18n, SEO, or lead capture changes. Use `pnpm test:e2e` only as Playwright backup when Browser MCP cannot cover the scenario or a deterministic CI/headless regression script is required.

## Deployment

- Vercel hosts the Next.js frontend.
- Payload app is deployed as a separate Node runtime.
- Managed PostgreSQL stores Payload data.
- Cloudinary stores and delivers media.
- Resend, Google Maps Embed, and OpenAI are configured through server-only environment variables.
- Monitoring must cover public frontend uptime and Payload health before production launch.
