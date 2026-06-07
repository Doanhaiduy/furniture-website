# Schema-Frontend Reconciliation Report

This report evaluates the alignment between the Supabase database migrations schema and the frontend prototype design, analyzing integration risks, data flow models, and required modifications.

---

## 1. Strict Screen & Workflow Reconciliation

For every important frontend screen and workflow, we provide explicit answers to four critical integration questions:
- *Is the DB schema already sufficient?*
- *Is an API transformation layer enough?*
- *Does the frontend need adaptation?*
- *Is a database migration required?*
- *What is the safest implementation order?*

### 1.1. Public Homepage & Static Pages (Home, About)
- **Is the DB schema already sufficient?** Yes. The `content_pages`, `content_page_translations`, `page_sections`, `page_section_translations`, and `page_media` tables completely support hierarchical layouts, blocks, CTA anchors, and banners.
- **Is an API transformation layer enough?** Yes. We will use Next.js Server Components to fetch and map page sections into localized values.
- **Does the frontend need adaptation?** Yes, slightly. The frontend components must map fetched `body_json` and section components instead of importing raw mock objects from `lib/showroom-data.ts`.
- **Is a database migration required?** No.
- **Safest implementation order**:
  1. Populate `content_pages` and translations via seed script.
  2. Implement data-fetching utilities in `lib/supabase/queries.ts`.
  3. Swap mock imports inside `app/[locale]/page.tsx` and `about/page.tsx` with dynamic queries.

### 1.2. Public Products Catalog & Category Filters
- **Is the DB schema already sufficient?** Yes. The relational tables (`products`, `product_translations`, `product_categories`, `product_category_translations`) joined with EAV attribute tables (`product_attribute_values`, `product_attribute_definitions`) cover all filters.
- **Is an API transformation layer enough?** Yes. The `public_products` RPC in `0008_public_admin_rpcs.sql` executes the sorting, filtering, full-text searches, and attribute queries, compiling results into clean JSONB.
- **Does the frontend need adaptation?** Yes. The product list page must synchronize filters with the URL search parameters to make the results shareable.
- **Is a database migration required?** No.
- **Safest implementation order**:
  1. Bind search input fields to the URL search params.
  2. Call the `public_products` RPC inside `app/[locale]/products/page.tsx`.
  3. Render the returned array using the existing `ProductCard` component.

### 1.3. Public Product Detail Page
- **Is the DB schema already sufficient?** Yes. Relational media maps (`product_media`) and specs mappings support all tabs.
- **Is an API transformation layer enough?** Yes. We will query products by slug, aggregating specifications and image paths.
- **Does the frontend need adaptation?** Yes. Change the tab components to dynamically parse joined attributes (e.g. `material`, `specifications` JSON) rather than displaying static boilerplate arrays.
- **Is a database migration required?** No.
- **Safest implementation order**:
  1. Implement single product slug fetcher inside `lib/supabase/queries.ts`.
  2. Update `app/[locale]/products/[slug]/page.tsx` to read dynamic attributes.
  3. Hook up the quote modal component.

### 1.4. Public Quote Submission Form
- **Is the DB schema already sufficient?** Yes. The `quote_requests`, `quote_request_events`, and `quote_notifications` tables are present.
- **Is an API transformation layer enough?** Yes. The public-facing endpoint `/api/contact` will accept CamelCase payloads, validate them, and trigger the `submit_quote_request(payload jsonb)` RPC.
- **Does the frontend need adaptation?** Yes. Embed the hidden honeypot component and hook up the submit status hooks.
- **Is a database migration required?** No.
- **Safest implementation order**:
  1. Add the honeypot field inside `components/showroom/quote-form.tsx`.
  2. Implement Zod validation and rate-limiting inside `/api/contact/route.ts`.
  3. Trigger the `submit_quote_request` database RPC and Resend email dispatcher.

### 1.5. Admin Dashboard & Authentication
- **Is the DB schema already sufficient?** Yes. Supabase `auth.users` and `public.profiles` tables support all session management and Role Model Option A configurations.
- **Is an API transformation layer enough?** Yes. Next.js middleware will validate cookie credentials on the server and check user roles before allowing page access.
- **Does the frontend need adaptation?** Yes. The admin layouts must handle token redirections and hide navigation items dynamically.
- **Is a database migration required?** No.
- **Safest implementation order**:
  1. Seed testing profiles (`admin` and `editor` users).
  2. Code `middleware.ts` to intercept `/admin/*` routes.
  3. Bind the login form to the Supabase client auth methods.

### 1.6. Admin Settings & Gemini API key rotation
- **Is the DB schema already sufficient?** No. The current schema lacks a dedicated settings secrets table to store encrypted configuration details.
- **Is an API transformation layer enough?** No. An API transformation layer cannot solve the physical database configuration gap.
- **Does the frontend need adaptation?** Yes. Settings forms must mask saved keys and invoke validation routines.
- **Is a database migration required?** **Yes.** A new database migration (`supabase/migrations/0010_gemini_settings.sql`) must be created to define the `integration_secrets` table.
- **Safest implementation order**:
  1. Create and apply the `integration_secrets` table migration with RLS.
  2. Build the server-side encryption/decryption helper library (`lib/security/encrypt.ts`).
  3. Implement the Settings API route `/api/admin/settings` executing validation, encryption, and audit logs.
  4. Connect the admin Settings UI.
