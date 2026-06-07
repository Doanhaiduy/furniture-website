# Phase 05 Implementation Guide – Admin Read Integration (Data Display)

## Implementation Order
1. **Admin Query Helpers**: Code database retrieval methods in `lib/supabase/admin-queries.ts`.
2. **Generic Table Component**: Create `components/admin/DataTable.tsx` and associated loading skeletons.
3. **Overview Dashboard Setup**: Integrate metrics in `app/admin/dashboard/page.tsx`.
4. **Publishable Content Lists**: Bind page templates for products, categories, blogs, and showrooms to Supabase query helpers.
5. **CRM Quote Requests Listing**: Integrate tables and detail modal wrappers in `/admin/quotes`.
6. **Authorization Validation**: Verify access gates return error payloads to unauthorized roles.

---

## Route & Page Mapping
- `/admin/dashboard` -> Overview of metrics. Accessible to both Admin and Editor profiles (with role-restricted widget items).
- `/admin/products` -> Product table. Displays all items.
- `/admin/categories` -> Category table.
- `/admin/blog` -> Blog article list table.
- `/admin/showrooms` -> Active showrooms table.
- `/admin/quotes` -> CRM quote requests table. Requires the `admin` role.

---

## Backend, Frontend, and Database Impacts
- **Database**: Reads `products`, `categories`, `blog_posts`, `showrooms`, `quote_requests`, `profiles`.
- **Backend (Next.js server)**: Resolves requests using Server Components, performing query lookups on the database before loading components.
- **Frontend**: Dynamic content is rendered using the reusable table layout.

---

## Docker & Local Runtime Implications
- Verify database connection strings are mapped inside local compose config files.
- Cache queries appropriately using Next.js runtime settings (e.g. `revalidate = 0` or caching handlers) to ensure pages refresh dynamically upon updates.

---

## Gemini Settings & API Secret Implications
- Gemini configuration details must not be returned in settings page queries if the user possesses the `editor` role.

---

## Security & RLS Details
- All database select queries utilize the user's active session token.
- Access to the `quote_requests` table is protected by a strict RLS policy:
  ```sql
  CREATE POLICY "Admin select quotes" ON quote_requests FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
  ```
- If an `editor` attempts to fetch `/admin/quotes` or the `/api/admin/quotes` endpoints, the request must fail with a `403 Forbidden` response.

---

## Edge Cases & Rollback/Fallback Considerations
- **Empty Tables Handling**: If catalog tables are blank, display a clear, localized descriptive layout (e.g. `"Không có sản phẩm nào" / "No products available"`).
- **Pagination Sync**: Ensure page index selections are synchronized with the URL query parameters (e.g. `?page=2`) so that refreshing the page retains table positioning.
- **Null Joined Values**: Handle case states where category properties or author descriptions are null, applying fallback strings to prevent crashes.

---

## Open Questions & Assumptions
- **Assumption**: The `admin_quote_search` RPC function handles paginated queries and sorting criteria efficiently without timing out.
- **Open Question**: Will the admin overview dashboard display real-time activity feeds? We assume displaying aggregate count indicators is sufficient for this integration phase.
