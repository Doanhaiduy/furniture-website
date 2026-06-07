# Phase 05 Testing – Admin Read Integration (Data Display)

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for data mappers.
- **Integration Testing**: Vitest testing for server-side queries.
- **E2E Testing**: Playwright checks for page loads, pagination, and role-based data visibility.
- **Manual Verification**: Visual check of loading skeletons and empty state layouts.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Dashboard KPI Rendering
1. Log in to the admin panel using an Admin profile.
2. Verify that:
   - The metrics display real database counts (e.g., if there are 15 products in the database, the total products card shows "15").
   - The widgets load dynamically.
3. Log out and log in as an Editor.
4. Verify that:
   - The dashboard hides quote-related metrics.
   - Only publishable counters (products, categories, blogs, showrooms) are rendered.

### Scenario 2: Paginated Table Navigation
1. Navigate to `/admin/products` as an Admin (assuming >10 products exist).
2. Verify that:
   - Only 10 product items are displayed on page 1.
   - The "Next" button is enabled and "Previous" button is disabled.
3. Click "Next".
4. Verify that:
   - The URL parameter changes to `/admin/products?page=2`.
   - The table displays the remaining products.
   - The "Previous" button is enabled.

### Scenario 3: Quote Request Access Block (Role Verification)
1. Log in to the admin panel as an Editor.
2. Attempt to fetch `/api/admin/quotes` using a REST client (e.g., Postman or curl with the Editor token).
3. Verify that the response returns `403 Forbidden` and the JSON response contains:
   ```json
   { "error": "Access denied" }
   ```
4. Access `http://localhost:3000/admin/quotes` in the browser. Confirm you are redirected to `/admin/access-denied`.

### Scenario 4: Empty Table Layout Test
1. Set up a clean test database with 0 product entries.
2. Navigate to `/admin/products`.
3. Verify that:
   - The application does not crash.
   - The table renders header items correctly.
   - The table body displays a single cell spanned row with: `"Không tìm thấy sản phẩm nào" / "No products found"`.
