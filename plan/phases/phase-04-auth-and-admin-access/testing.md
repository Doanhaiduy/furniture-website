# Phase 04 Testing – Authentication & Admin Access Control

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for role matching logic.
- **Integration Testing**: Vitest testing for server route helpers (`requireAdmin` / `requireEditorOrAdmin`).
- **E2E Testing**: Playwright validation for login flows and role-based redirects.
- **Manual Verification**: Chrome developer tools checking for cookie updates and session properties.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Anonymous Access Block
1. Navigate to `/admin/dashboard` in an incognito window.
2. Verify that:
   - The middleware blocks the request and redirects to `/admin/login`.
   - The URL search parameters contain the redirect path (`?redirect=/admin/dashboard`).

### Scenario 2: Editor Access Restrictions (Role Enforcement)
1. Log in to the admin panel using an Editor profile (`editor@showroom.com`).
2. Verify that:
   - The user is redirected to `/admin/dashboard`.
   - The Sidebar menu hides links to Quotes, Users, and Settings.
3. Manually type `http://localhost:3000/admin/quotes` in the browser address bar.
4. Verify that:
   - The middleware intercepts the request and redirects the browser to `/admin/access-denied`.
   - The page displays a custom message: `"Bạn không có quyền truy cập vào trang này" / "You do not have permission to access this page"`.

### Scenario 3: Admin Global Access
1. Log in to the admin panel using an Admin profile (`admin@showroom.com`).
2. Verify that:
   - The user is redirected to `/admin/dashboard`.
   - The Sidebar menu displays all navigation links (Dashboard, Products, Categories, Blog, Showrooms, Media, Quotes, Users, Settings).
3. Click on `/admin/quotes` and confirm the page loads without any redirects.

### Scenario 4: Session Refresh Check
1. Log in to the admin panel as an Admin.
2. In Chrome DevTools, inspect cookies and locate the Supabase session token.
3. Wait or manually expire the access token (keeping the refresh token active).
4. Refresh the page and confirm that the user remains authenticated without having to re-enter credentials.
