# API-Frontend Integration Audit

This audit evaluates the completeness and execution readiness of the API-to-frontend integration plan for the Showroom Nội Thất Phương Đông project. It reviews all public and admin pages, identifies data-loading mechanisms, and details the replacement of mock data with real Supabase queries.

---

## 1. Executive Summary
The frontend implementation is currently a highly complete visual prototype. However, almost all content, products, blog posts, showroom data, settings, and user lists are loaded from a static constants file (`lib/showroom-data.ts` or inline mock states). 
This audit establishes concrete implementation plans for connecting the user interface to our database schemas and RPC functions, ensuring security boundaries, error handling, locale routing, and data consistency.

---

## 2. Public Pages Data Integration Plan

### Homepage (`app/[locale]/page.tsx`)
- **Current State**: Visual blocks are populated with 6 static products, hardcoded categories, and mock trust badges.
- **Required Queries**:
  - Fetch featured products: Call the `public_products` RPC with parameters `{ p_locale: locale, p_featured: true, p_limit: 4 }`.
  - Fetch product categories: Select from `product_categories` and `product_category_translations` where `status = 'published'` and `parent_id IS NULL` (top-level categories only).
- **Locale Handling**: Locale parameters (`vi` or `en`) are extracted from the route context and passed to all queries.
- **Loading/Error States**: Render localized skeleton cards for the hero showcase grid. Database query failures will fall back to displaying default brand information.

### Products Catalog (`app/[locale]/products/page.tsx`)
- **Current State**: Uses client-side sorting and mock categories filter panel.
- **Required Queries**:
  - Main search query: Call `public_products` passing search parameters:
    ```typescript
    const { data, error } = await supabase.rpc('public_products', {
      p_locale: locale,
      p_category_slug: searchParams.category || null,
      p_q: searchParams.q || null,
      p_price_min: searchParams.minPrice || null,
      p_price_max: searchParams.maxPrice || null,
      p_limit: 12,
      p_offset: (searchParams.page - 1) * 12
    });
    ```
- **Filter Mapping**: URL query strings map to the Zod schema validator (`lib/validations/filters.ts`).
- **Loading/Error States**: An asynchronous loading template (`app/[locale]/products/loading.tsx`) renders skeleton elements. If queries yield no results, display: `"Không tìm thấy sản phẩm nào" / "No products found"`.

### Product Details Page (`app/[locale]/products/[slug]/page.tsx`)
- **Current State**: Specifications, categories, and image carousels are mock-driven.
- **Required Queries**:
  - Retrieve single product: Query the `products` table joined with `product_translations` and `media_assets` filtering by `slug = routeParams.slug` and `locale = routeParams.locale`.
  - Fetch attributes: Join `product_attribute_values`, `product_attribute_definitions`, and translations to resolve localized specifications.
  - Related items: Query `public_products` filtering by `p_category_slug` of the current item, excluding the current product ID.
- **404 Resolution**: If the product is not found or is marked as `draft`, trigger Next.js `notFound()` to return a `404` status immediately.

### Blog Directory & Article Details (`app/[locale]/blog/` & `[slug]`)
- **Current State**: Mock articles grid with no pagination.
- **Required Queries**:
  - Listing: Call the `public_blog_posts` RPC with limit and offset.
  - Details: Query `blog_posts` and `blog_post_translations` where `slug = params.slug` and `status = 'published'`.
- **Formatting**: Parse `body_json` safely into HTML blocks.

### Contact Page (`app/[locale]/contact/page.tsx`)
- **Current State**: Quote form exists but form submission is validation-only.
- **Required API**: `POST /api/contact`.
- **Payload Verification**: Form submits Zod-validated payload + hidden honeypot.
- **Persistence Route**: Route Handler calls Supabase service-role client to execute `submit_quote_request`.
- **Notification**: Triggers Resend API email dispatch following successful database commits.

### Showrooms Page (`app/[locale]/showrooms/page.tsx`)
- **Current State**: Hardcoded locations array and placeholder maps frame.
- **Required Queries**: Call `public_showrooms` RPC.
- **Maps Handling**: Embed URLs must be validated before rendering in frames.

---

## 3. Admin Pages Data Integration Plan

### Admin Dashboard (`app/admin/dashboard/page.tsx`)
- **Required API**: `GET /api/admin/dashboard/stats`.
- **Enforcement**: Verify session user profile role. Editor responses must exclude counts for `quote_requests` and `profiles`.
- **Response Shape**:
  ```json
  {
    "productsCount": 150,
    "showroomsCount": 3,
    "blogPostsCount": 42,
    "quoteRequestsCount": 12 // Admin only
  }
  ```

### Admin Products, Categories, Blog, & Showrooms Listings
- **Required API**: Server Actions or API Route Handlers retrieving paginated rows. Exclude items marked `deleted_at IS NOT NULL` (soft-deleted).
- **Permissions**: Editors and Admins have full read/write access to these publishable entities.

### Admin Quotes Manager (`app/admin/quotes/page.tsx`)
- **Required API**: `GET /api/admin/quotes` calling `admin_quote_search` RPC.
- **Access Control**: Strictly Admin-only. Middleware and Route Handler block Editor requests, returning `403 Forbidden`.

### Admin Users Roster (`app/admin/users/page.tsx`)
- **Required API**: `GET /api/admin/users` and `POST /api/admin/users/role`.
- **Access Control**: Admin-only. Allows Admin to toggle profile roles (`admin` or `editor`) and active state flags.

### Admin Settings & AI Assistant
- **Required API**: `GET /api/admin/settings` and `POST /api/admin/ai/generate-draft`.
- **Access Control**:
  - Settings reading/writing is Admin-only. Gemini API keys are encrypted at rest and returned from settings endpoints as masked parameters (e.g., `****1234`).
  - AI generation endpoints are available to both Admin and Editor, but the API calls the Gemini service using decrypted database keys on the server, ensuring raw credentials are never exposed.
