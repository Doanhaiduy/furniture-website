# Phase 05 Deliverables – Admin Read Integration (Data Display)

## Concrete Expected Outputs
- **lib/supabase/admin-queries.ts**: Collection of server-side database select operations (such as `getAdminDashboardStats`, `getAdminProductsList`, `getAdminQuotesList`).
- **components/admin/DataTable.tsx**: Reusable, paginated table UI component displaying column items, pagination controls, search bars, and loading states.
- **components/admin/QuoteDetailDialog.tsx**: Modal component displaying quote parameters (Customer name, email, phone, status, message, date) dynamically.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `app/admin/dashboard/page.tsx` [MODIFY] (Stats layout, widgets integration)
  - `app/admin/products/page.tsx` [MODIFY] (Product listing table)
  - `app/admin/categories/page.tsx` [MODIFY] (Category listing table)
  - `app/admin/blog/page.tsx` [MODIFY] (Blog listing table)
  - `app/admin/showrooms/page.tsx` [MODIFY] (Showrooms listing table)
  - `app/admin/quotes/page.tsx` [MODIFY] (Quote request table – Admin only)
- **Components**:
  - `components/showroom/admin-pages.tsx` [MODIFY] (Integrate table bindings)
  - `components/showroom/admin-dashboard-widgets.tsx` [MODIFY] (Replace stats values)

## Future Touchpoints
- **Product listing page** will receive a "Create New" button leading to mutation forms in Phase 06.
- **Media preview library** will be mapped to Cloudinary storage buckets in Phase 07.
- **Quote detail dialog** will display responder controls and status selectors in Phase 09.

## Verification Evidence Required
1. **Dynamic Renders**: Screenshots showing the admin panel rendering real database tables with pagination working.
2. **Editor Exclusions**: Screen capture confirming Quote request stats are hidden when logged in as an `editor`.
3. **API Access Control Verification**: Command output proving direct API requests to `/api/admin/quotes` return `403 Forbidden` when using an `editor` token.
4. **Performance verification**: Lighthouse metrics showing dashboard page paint speeds are under 1.5 seconds.
