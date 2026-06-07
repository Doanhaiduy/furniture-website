# Route Inventory

## Public Routes

| Route | File | Current source | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Redirect/locale entry | Locale routing entry point. |
| `/[locale]` | `app/[locale]/page.tsx` | `lib/showroom-data.ts`, messages | Homepage prototype with product groups, featured products, blog, showrooms, quote form. |
| `/[locale]/about` | `app/[locale]/about/page.tsx` | `lib/showroom-data.ts`, messages | Company/about content remains prototype data. |
| `/[locale]/products` | `app/[locale]/products/page.tsx` | `lib/showroom-data.ts` | Product filters/search/pagination are mock-data driven. |
| `/[locale]/products/[slug]` | `app/[locale]/products/[slug]/page.tsx` | `getProductBySlug` from mock data | Slugs are mock slugs, not database localized slugs. |
| `/[locale]/blog` | `app/[locale]/blog/page.tsx` | `blogPosts` mock data | Blog list prototype. |
| `/[locale]/blog/[slug]` | `app/[locale]/blog/[slug]/page.tsx` | `getBlogPostBySlug`, article content mock data | Blog detail and TOC prototype. |
| `/[locale]/showrooms` | `app/[locale]/showrooms/page.tsx` | `showrooms` mock data | Map iframe is hardcoded to Hanoi query in current page. |
| `/[locale]/contact` | `app/[locale]/contact/page.tsx` | `showrooms`, quote form | Uses public quote form; no persistence yet. |
| `/[locale]/contact/success` | `app/[locale]/contact/success/page.tsx` | messages | Confirmation route. |
| `/[locale]/contact/error` | `app/[locale]/contact/error/page.tsx` | messages | Error route. |
| `/[locale]/not-found` | `app/[locale]/not-found.tsx` | messages | Localized not-found behavior. |

## Admin Routes

| Route | File | Current source | Notes |
| --- | --- | --- | --- |
| `/admin` | `app/admin/page.tsx` | Admin prototype components | No real auth/session. |
| `/admin/login` | `app/admin/login/page.tsx` | Prototype UI | Login is not wired to server auth. |
| `/admin/access-denied` | `app/admin/access-denied/page.tsx` | Prototype UI | UI-only denial page. |
| `/admin/products` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Dynamic section route. |
| `/admin/categories` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Dynamic section route. |
| `/admin/blog` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Dynamic section route. |
| `/admin/showrooms` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Dynamic section route. |
| `/admin/media` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Placeholder/demo behavior remains. |
| `/admin/quotes` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Must become Admin-only server-side. |
| `/admin/users` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Placeholder/demo behavior remains. |
| `/admin/settings` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Placeholder/demo behavior remains. |
| `/admin/ai-assistant` | `app/admin/[section]/page.tsx` | `AdminSectionPage` | Draft UI prototype; no Gemini server action yet. |

## API And Metadata Routes

| Route | File | Current source | Notes |
| --- | --- | --- | --- |
| `POST /api/contact` | `app/api/contact/route.ts` | `quoteRequestSchema` | Validates and honeypot-rejects but does not persist. |
| `/sitemap.xml` | `app/sitemap.ts` | `products`, `blogPosts` mock data | Must switch to published database content. |
| `/robots.txt` | `app/robots.ts` | static rules | Already excludes admin/api/preview/drafts; verify against Supabase-backed public route behavior. |

## Middleware

| File | Purpose |
| --- | --- |
| `proxy.ts` | next-intl middleware; excludes `api`, `admin`, `_next`, and static files. |
| `i18n/routing.ts` | Defines locales `vi` and `en`, default `vi`. |
| `i18n/request.ts` | Loads locale messages. |
