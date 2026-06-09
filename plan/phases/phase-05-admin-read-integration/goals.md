# Phase 05 Goals – Admin Read Integration (Data Display)

## Measurable Goals
- **Eliminate Prototype Data**: Replace all mock data imports (`lib/showroom-data.ts`) inside admin list views, detail pages, and statistics widgets with Supabase database queries.
- **Dynamic KPI Metrics**: Wire dashboard indicators (total products, active showrooms, pending quotes, published blogs) to reflect real database counts.
- **Enforce Data Segregation**: Restrict quote request details, user lists, and integration settings to Admin profiles at the query level.
- **Production-Ready UI states**: Render skeleton loading screens, handle database query errors gracefully, and display clear empty states when tables are blank.

## Phase Success Conditions
- Accessing the admin routes renders real database tables containing matching headers and dynamic rows:
  - `/admin/products`
  - `/admin/categories`
  - `/admin/blog`
  - `/admin/showrooms`
- The `/admin/quotes` route loads quote submissions successfully for logged-in users with the `admin` role, but blocks requests from `editor` users at the server level.
- The Admin dashboard (/admin/dashboard) fetches statistics dynamically. `editor` dashboard views exclude stats relating to quotes or user counts.
- Tables support pagination (loading 10 items per page) and basic column sorting (e.g. sorting products by created date or price).

## Concrete Results
- Reusable admin data table component (`components/admin/DataTable.tsx`) supporting pagination controls.
- Server-side read helper libraries (`lib/supabase/admin-queries.ts`) restricted to authenticated users.
- Dynamic data display inside `/admin/[section]` and dashboard views.
- Browser MCP admin-read journey evidence verifying dashboard stats display database values. Playwright backup scripts are optional only for deterministic CI seeded-data regression.
