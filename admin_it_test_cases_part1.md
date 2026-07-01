# Admin Integration & E2E Test Cases — Step-by-Step Detail
## Part 1 of 2: Auth · Dashboard · Products · Categories

**Version:** 2.0 | **Date:** 2026-06-28  
**Env URL:** `http://localhost:3000` (dev) | Admin: `/admin`  
**Format:** Each TC = Preconditions → Steps → Pass Criteria → Fail Criteria

---

## 🔐 MODULE 1 — Auth & Login

### Prereqs for all Auth tests
- App running at `http://localhost:3000`
- DB seeded with admin user: `admin@furniture.com` / `Admin@123456`
- DB seeded with editor user: `editor@furniture.com` / `Editor@123456`
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

### ADM-AUTH-01 — Submit login with empty email

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Verify the page shows the login form with an email field and a password field
3. Leave the **Email** field completely empty
4. Type `Admin@123456` into the **Password** field
5. Click the **"Đăng nhập"** button

**Pass criteria:**
- Page does NOT navigate away from `/admin/login`
- An inline error message appears under the email field containing the text **"Email"** and indicating it is required
- No network request is made to Supabase Auth

**Fail criteria:**
- Page redirects to `/admin`
- No error message shown
- JavaScript console shows an uncaught exception

---

### ADM-AUTH-02 — Submit login with whitespace-only email

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Click into the **Email** field
3. Type three spaces: `   ` (three space characters)
4. Type `Admin@123456` into the **Password** field
5. Click the **"Đăng nhập"** button

**Pass criteria:**
- The whitespace is trimmed; the field is treated as empty
- Same inline required error appears as ADM-AUTH-01
- No navigation away from login page

**Fail criteria:**
- A network request is fired with email = `"   "`
- Page redirects

---

### ADM-AUTH-03 — Submit login with invalid email format

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `not-an-email` into the **Email** field
3. Type `Admin@123456` into the **Password** field
4. Click the **"Đăng nhập"** button

**Pass criteria:**
- Inline error appears indicating invalid email format (e.g., "Email không hợp lệ" or browser native validation)
- No redirect
- No Supabase auth call with the invalid email

**Fail criteria:**
- Supabase is called; a 400/422 error is thrown and exposed raw to the user

---

### ADM-AUTH-04 — Submit login with empty password

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `admin@furniture.com` into the **Email** field
3. Leave the **Password** field empty
4. Click the **"Đăng nhập"** button

**Pass criteria:**
- Inline error appears under the password field indicating it is required
- No redirect

**Fail criteria:**
- Page navigates to `/admin` with empty password accepted

---

### ADM-AUTH-05 — Successful login with correct credentials

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in. Admin user exists in DB with email `admin@furniture.com` and password `Admin@123456`.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `admin@furniture.com` into the **Email** field
3. Type `Admin@123456` into the **Password** field
4. Click the **"Đăng nhập"** button
5. Wait up to 3 seconds for redirect

**Pass criteria:**
- Browser URL changes to `http://localhost:3000/admin`
- Dashboard content renders (KPI cards visible)
- No error toast or error message on screen
- Browser DevTools → Application → Cookies: `sb-auth-token` cookie is set

**Fail criteria:**
- Stays on login page
- Shows an error despite correct credentials
- JS console shows uncaught exception

---

### ADM-AUTH-06 — Login with wrong password

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `admin@furniture.com` into the **Email** field
3. Type `WrongPassword999` into the **Password** field
4. Click the **"Đăng nhập"** button

**Pass criteria:**
- Page remains at `/admin/login`
- An error message is shown (toast or inline): contains text like "Thông tin đăng nhập không đúng" or "Invalid credentials"
- `sb-auth-token` cookie is NOT set

**Fail criteria:**
- Page redirects to `/admin`
- Raw Supabase error message ("Invalid login credentials") exposed verbatim

---

### ADM-AUTH-07 — Login with non-existent email (no email enumeration)

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Email `nouser@doesnotexist.com` does NOT exist in `auth.users`.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `nouser@doesnotexist.com` into the **Email** field
3. Type `SomePassword123` into the **Password** field
4. Click the **"Đăng nhập"** button

**Pass criteria:**
- Error message shown is IDENTICAL to the one for wrong password (ADM-AUTH-06)
- The error does NOT say "user not found" or "email does not exist" (would reveal user enumeration)

**Fail criteria:**
- Different error message that reveals whether the email exists

---

### ADM-AUTH-08 — SQL injection in email field

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. In the **Email** field type exactly: `' OR '1'='1`
3. In the **Password** field type: `anything`
4. Click **"Đăng nhập"**
5. Open Browser DevTools → Network → filter for requests to `supabase`

**Pass criteria:**
- No redirect to `/admin`
- Supabase returns an auth error (either format error or invalid credentials)
- No DB error stack trace appears on screen
- The Network response does NOT return any user data

**Fail criteria:**
- Page redirects to `/admin`
- Server returns 500 with DB error message
- Any user data returned in response

---

### ADM-AUTH-09 — XSS payload in email field

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Not logged in.

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. In the **Email** field type: `<script>alert('xss')</script>@test.com`
3. In the **Password** field type: `anything`
4. Click **"Đăng nhập"**

**Pass criteria:**
- No `alert()` dialog appears
- The script tag is NOT rendered as HTML anywhere on the page
- Form validation rejects the input (invalid email format)

**Fail criteria:**
- An `alert()` dialog appears
- The script tag is rendered or echoed back unescaped in the DOM

---

### ADM-AUTH-10 — Rate limiting on failed login attempts

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Not logged in. Rate limiting configured (Supabase default: 6 attempts / 10 min).

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Type `admin@furniture.com` and `WrongPass1`, click login → fail (1st)
3. Repeat with `WrongPass2` (2nd), `WrongPass3` (3rd), `WrongPass4` (4th), `WrongPass5` (5th), `WrongPass6` (6th)
4. Observe the response on the 6th attempt

**Pass criteria:**
- 6th attempt returns a rate limit error (Supabase: "Email rate limit exceeded" / HTTP 429)
- The error is communicated to the user with a friendly message
- Login button may be temporarily disabled or show a countdown

**Fail criteria:**
- All 6 attempts return generic "Invalid credentials" — rate limiting is not enforced
- Server crashes

---

### ADM-AUTH-11 — Anonymous direct access to /admin/products is blocked

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Clear all cookies and local storage first.

**Steps:**
1. Open a fresh incognito/private browser window
2. Navigate directly to `http://localhost:3000/admin/products`
3. Wait up to 3 seconds

**Pass criteria:**
- `proxy.ts` middleware detects no authenticated user
- Browser redirects to `http://localhost:3000/admin/login?redirectTo=/admin/products`
- Admin products UI never renders

**Fail criteria:**
- Products page renders with data visible
- Redirect goes to wrong URL
- 500 error shown

---

### ADM-AUTH-12 — Anonymous direct access to /admin/settings is blocked

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Clear all cookies.

**Steps:**
1. Open incognito window
2. Navigate directly to `http://localhost:3000/admin/settings`

**Pass criteria:**
- Redirected to `/admin/login?redirectTo=/admin/settings`
- Settings data not rendered

**Fail criteria:**
- Settings page renders (data leak)
- 500 error

---

### ADM-AUTH-13 — Anonymous GET /api/admin/settings returns 401

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** No session cookies.

**Steps:**
1. Open browser DevTools or use `curl` / Postman
2. Send: `GET http://localhost:3000/api/admin/settings` with no cookies
3. Inspect the response

**Pass criteria:**
- HTTP status: **401**
- Response body: `{ "error": "Unauthorized" }`
- No settings data in response body

**Fail criteria:**
- HTTP 200 with settings data returned
- HTTP 200 with empty body (data leaked as empty)

---

### ADM-AUTH-14 — proxy.ts does NOT default to "admin" role for missing profile

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** A user exists in `auth.users` but has NO corresponding row in `profiles` table.

**Steps:**
1. In Supabase dashboard: create auth user `orphan@test.com`, do NOT create profiles row
2. Log in as `orphan@test.com` via the login form
3. Observe where the user lands

**Pass criteria:**
- `proxy.ts` line 72: `!profile` → true → redirect to `/admin/access-denied`
- User does NOT get admin or editor access

**Fail criteria:**
- User is granted admin access (role defaulted to "admin")
- User sees any admin data

---

### ADM-AUTH-15 — Session persists across page reload

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin.

**Steps:**
1. Log in as `admin@furniture.com` (see ADM-AUTH-05)
2. Verify you are on `/admin`
3. Press `F5` (hard reload) or `Ctrl+Shift+R`
4. Wait for page to load

**Pass criteria:**
- Dashboard still renders after reload
- No redirect to login page
- Session cookie still present

**Fail criteria:**
- Redirected to login after reload

---

### ADM-AUTH-16 — Expired session redirects to login

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Logged in as admin.

**Steps:**
1. Log in as admin
2. Open DevTools → Application → Cookies
3. Find the `sb-auth-token` cookie and delete it manually
4. Navigate to `http://localhost:3000/admin/products`

**Pass criteria:**
- Proxy middleware finds no valid session
- Redirected to `/admin/login?redirectTo=/admin/products`

**Fail criteria:**
- Products page renders despite deleted cookie
- 500 error

---

### ADM-AUTH-17 — Logout clears session

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Logged in as admin.

**Steps:**
1. While on `/admin`, locate the **logout** button (typically in top-right avatar dropdown or sidebar bottom)
2. Click the logout button
3. Wait for navigation
4. After redirect, attempt to navigate to `http://localhost:3000/admin`

**Pass criteria:**
- After logout: redirected to `/admin/login`
- `sb-auth-token` cookie is cleared
- Navigating to `/admin` again redirects to `/admin/login`

**Fail criteria:**
- Admin dashboard still accessible after logout
- Cookie not cleared

---

### ADM-AUTH-18 — Tab close does not preserve session beyond expected

**Type:** E2E | **Priority:** 🟡 Medium

**Preconditions:** Logged in as admin (session cookie should be a session cookie, not persistent).

**Steps:**
1. Log in as admin
2. Close the browser tab completely (do not close entire browser)
3. Open a new tab
4. Navigate to `http://localhost:3000/admin`

**Pass criteria:**
- If session cookie is `session` type: user is redirected to login
- If session cookie is `persistent` type (has max-age): user may still be logged in (document the actual behavior)

**Fail criteria:**
- No cookie was set at all; this is a configuration error

---

### ADM-AUTH-19 — Editor accessing admin-only routes gets 403 redirect

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor (`editor@furniture.com`).

**Steps:**
1. Log in as editor user
2. Navigate to `http://localhost:3000/admin/users` (defined in `ADMIN_ONLY_PREFIXES` in proxy.ts)
3. Observe redirect

**Pass criteria:**
- Redirected to `/admin/access-denied`
- Users list does NOT render
- Editor's session still valid (not logged out)

**Fail criteria:**
- Users page renders with user data
- Editor gets full admin access

---

### ADM-AUTH-20 — Access-denied page renders properly for editor

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as editor.

**Steps:**
1. Navigate to `http://localhost:3000/admin/access-denied`
2. Inspect page content

**Pass criteria:**
- Page renders (HTTP 200)
- Shows a user-friendly Vietnamese message explaining access is restricted
- Shows a button/link to go back or return to dashboard

**Fail criteria:**
- Blank white page
- JavaScript error
- Raw HTTP error page

---

### ADM-AUTH-21 — Go-back CTA on access-denied navigates correctly

**Type:** E2E | **Priority:** 🟡 Medium

**Preconditions:** Logged in as editor, on `/admin/access-denied` page.

**Steps:**
1. Navigate to `/admin/access-denied`
2. Click the "Quay lại" or "Về trang chủ" button

**Pass criteria:**
- Navigates to `/admin` (dashboard) or the previously accessed safe admin page

**Fail criteria:**
- Button does nothing
- Navigates to a 404 page

---

### ADM-AUTH-22 — Anonymous user on /admin/access-denied redirects to login

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Not logged in (clear cookies).

**Steps:**
1. Navigate to `http://localhost:3000/admin/access-denied` without any session

**Pass criteria:**
- `proxy.ts` detects no user → redirects to `/admin/login`

**Fail criteria:**
- Access-denied page renders without auth
- 500 error

---

### ADM-AUTH-23 — proxy.ts (not middleware.ts) is the active middleware

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Project running.

**Steps:**
1. Check the project root directory for files named `middleware.ts` or `middleware.js`
2. Verify that NO such file exists
3. Confirm that `proxy.ts` in the project root exports `default proxy` and exports `config.matcher`
4. In a terminal, run: `ls d:/THCode/AI/furniture-website/middleware.ts` — should return "not found"
5. Run: `ls d:/THCode/AI/furniture-website/proxy.ts` — should return the file

**Pass criteria:**
- `middleware.ts` does NOT exist in project root
- `proxy.ts` exists and exports `default proxy` and `export const config = { matcher: [...] }`
- Next.js resolves `proxy.ts` as the middleware via the `next.config.ts` or framework convention

**Fail criteria:**
- Both `middleware.ts` and `proxy.ts` exist (conflicting middleware)
- Neither file exists (no route protection at all)

> **Note:** Next.js 15/16 resolves the middleware file via the `matcher` config exported from the default middleware export. In this project, `proxy.ts` IS the middleware — this is correct architecture, not a bug.

---

### ADM-AUTH-24 — New auth.users trigger creates profiles row with role=editor

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Access to Supabase admin dashboard or psql.

**Steps:**
1. Create a new user directly in Supabase Auth dashboard: email `newuser@test.com`, password `Test@123456`
2. Query the `profiles` table: `SELECT id, email, role, is_active FROM profiles WHERE email = 'newuser@test.com'`

**Pass criteria:**
- A row exists in `profiles` with `role = 'editor'` (NOT 'admin')
- `is_active = true`
- `email = 'newuser@test.com'`

**Fail criteria:**
- No profiles row created (trigger not working)
- `role = 'admin'` (dangerous default)
- `role = null`

---

### ADM-AUTH-25 — Token refresh during long AI generation session

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin. Supabase session token expires after ~1 hour.

**Steps:**
1. Log in as admin
2. Navigate to a blog post edit page
3. Click the "Tạo nội dung AI" (Generate by AI) button on the Tiptap editor
4. Wait 61 minutes (or mock a session close to expiry)
5. Submit the AI generation request

**Pass criteria:**
- Supabase client auto-refreshes the session token
- The request completes successfully (or shows a clean re-auth prompt, NOT a 401 error dump)

**Fail criteria:**
- A raw 401 error is thrown to the UI
- The page crashes

---

## 📊 MODULE 2 — Dashboard

### Prereqs for Dashboard tests
- Logged in as admin
- DB has at least 1 product, 1 category, 1 blog post, 1 showroom, 1 quote request, 1 user

---

### ADM-DASH-01 — Dashboard loads with real DB counts

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as admin. `NEXT_PUBLIC_USE_MOCK_DATA=false`.

**Steps:**
1. Navigate to `http://localhost:3000/admin`
2. Wait up to 3 seconds for page to fully load
3. Observe the KPI stat cards on the dashboard

**Pass criteria:**
- All 6 KPI cards visible: Products, Categories, Blog Posts, Showrooms, Quotes, Users
- Numbers are non-negative integers
- Numbers match actual DB counts: e.g., run `SELECT count(*) FROM products WHERE deleted_at IS NULL` and compare

**Fail criteria:**
- Cards show "0" for all when DB has data
- Cards show NaN, undefined, or crash
- Mock data numbers shown instead of real DB counts

---

### ADM-DASH-02 — Editor role hides Quotes and Users KPI cards

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as editor (`editor@furniture.com`).

**Steps:**
1. Navigate to `http://localhost:3000/admin`
2. Inspect visible KPI cards on dashboard

**Pass criteria:**
- "Yêu cầu báo giá" (Quotes) card: NOT visible or hidden
- "Người dùng" (Users) card: NOT visible or hidden
- Other KPI cards (Products, Categories, Blog, Showrooms) ARE visible

**Fail criteria:**
- Quotes or Users cards visible to editor (data exposure)
- Dashboard blank/crashes for editor

---

### ADM-DASH-03 — Admin role sees all 6 KPI cards

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to `http://localhost:3000/admin`
2. Count KPI cards displayed

**Pass criteria:**
- Exactly 6 cards visible including Quotes and Users

**Fail criteria:**
- Fewer than 6 cards for admin

---

### ADM-DASH-04 — Dashboard displays zero-state gracefully

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Connect to a test DB with all tables empty (or mock all counts to 0).

**Steps:**
1. In test DB: `TRUNCATE products, product_categories, blog_posts, showrooms, quote_requests CASCADE` (use test DB only!)
2. Navigate to `/admin`

**Pass criteria:**
- All KPI cards show "0"
- No JavaScript exception in console
- No blank/crash screen

**Fail criteria:**
- Page crashes with TypeError
- Cards show undefined

---

### ADM-DASH-05 — Dashboard fallback when DB query times out

**Type:** IT | **Priority:** 🟡 Medium

**Preconditions:** Ability to simulate slow DB (e.g., add artificial delay via pg_sleep or mock).

**Steps:**
1. Temporarily add delay to `getAdminDashboardStats` function (mock supabase to return after 6 s)
2. Navigate to `/admin`
3. Observe what renders while waiting and after timeout

**Pass criteria:**
- Dashboard renders without crashing
- Either shows loading state or shows fallback mock counts
- `console.warn("Exception fetching admin dashboard stats, falling back to mock:")` in server logs

**Fail criteria:**
- White/blank screen
- Unhandled promise rejection

---

### ADM-DASH-06 — "Thêm sản phẩm" CTA navigates to product create

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin, on `/admin`.

**Steps:**
1. Locate the quick-action card or button labeled "Thêm sản phẩm" or "Tạo sản phẩm mới"
2. Click the button

**Pass criteria:**
- Browser navigates to `/admin/products?create=1` or opens the product create panel
- Create form is in an open/active state

**Fail criteria:**
- Button does nothing
- Navigates to wrong page

---

### ADM-DASH-07 — Chart renders with quote data present

**Type:** E2E | **Priority:** 🟡 Medium

**Preconditions:** Logged in as admin. At least 3 quotes exist in DB.

**Steps:**
1. Navigate to `/admin`
2. Scroll to the dashboard chart section (DashboardInsightChart)

**Pass criteria:**
- Chart renders with visible bars/lines
- No JavaScript errors in DevTools console

**Fail criteria:**
- Chart area is blank
- Console error: "Cannot read properties of undefined"

---

### ADM-DASH-08 — Chart renders empty state with no quotes

**Type:** E2E | **Priority:** 🟡 Medium

**Preconditions:** DB has 0 quote_requests (or use mock with empty quotes).

**Steps:**
1. Navigate to `/admin`
2. Locate the chart area

**Pass criteria:**
- Chart renders an empty/zero state (e.g., "Không có dữ liệu")
- No crash

**Fail criteria:**
- Console error thrown
- Chart area shows broken component

---

### ADM-DASH-09 — Compact QuoteTable shows recent quotes

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin. At least 3 quote_requests in DB.

**Steps:**
1. Navigate to `/admin`
2. Locate the compact quote table / recent quotes widget

**Pass criteria:**
- Widget shows at least 1 row
- Each row shows: full_name, phone, status badge
- Rows are ordered by `created_at DESC` (newest first)

**Fail criteria:**
- Widget not visible
- Rows missing data fields

---

### ADM-DASH-10 — WarningPanel displays when warnings exist

**Type:** E2E | **Priority:** 🟡 Medium

**Preconditions:** App has known warning conditions (e.g., missing env vars in test mode).

**Steps:**
1. Navigate to `/admin`
2. Look for a WarningPanel component (yellow/orange banner area)

**Pass criteria:**
- If warnings exist: panel shows with readable advisory text
- If no warnings: panel not shown (no empty warning box)

**Fail criteria:**
- Panel crashes the page

---

### ADM-DASH-11 — Editor role cannot see admin-only sidebar links

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Navigate to `/admin`
2. Inspect the sidebar navigation
3. Look for links labeled "Người dùng" (Users) and "Cài đặt" (Settings)

**Pass criteria:**
- Neither "Users" nor "Settings" navigation links are visible in the sidebar for editor role

**Fail criteria:**
- Both links visible (editor can navigate to restricted sections)

---

### ADM-DASH-12 — Admin role sees full sidebar with all 10 sections

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to `/admin`
2. Count all visible sidebar navigation items

**Pass criteria:**
- Sidebar shows: Dashboard, Products, Categories, Brands, Promotions, Blogs, Showrooms, Quotes, Users, Settings
- All 10 links are clickable and navigate to correct sections

**Fail criteria:**
- Admin missing any section link

---

## 📦 MODULE 3 — Products

### Prereqs for Products tests
- Logged in as admin (unless stated otherwise)
- At least 1 category exists in DB for FK requirements
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

### ADM-PRD-01 — Product list loads with real DB data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `/admin` → click "Sản phẩm" in sidebar
2. Wait up to 3 seconds

**Pass criteria:**
- Product table renders
- Each row shows: product name (VI), category name, status badge, price
- Row count matches: `SELECT count(*) FROM products WHERE deleted_at IS NULL`

**Fail criteria:**
- Table empty when DB has products
- Mock data shown instead of real data

---

### ADM-PRD-02 — Product list pagination: page 1 shows max 50

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** DB has more than 50 non-deleted products.

**Steps:**
1. Navigate to `/admin` → "Sản phẩm"
2. Count rows in the table

**Pass criteria:**
- Exactly 50 rows shown (or the configured page size)
- Pagination controls visible (Next page button)

**Fail criteria:**
- All 200+ products loaded at once (performance issue / missing pagination)

---

### ADM-PRD-03 — Product list pagination: navigate to page 2

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** DB has >50 products.

**Steps:**
1. On product list page 1
2. Click the "Trang tiếp →" (Next page) button

**Pass criteria:**
- URL updates (e.g., `?page=2` or `?offset=50`)
- A different set of 50 products shown
- "← Trang trước" button becomes active

**Fail criteria:**
- Same products shown
- URL does not update

---

### ADM-PRD-04 — Out-of-range page in URL shows empty state or redirects

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Navigate to `/admin/products?page=9999`

**Pass criteria:**
- Either shows empty state message ("Không tìm thấy sản phẩm") OR redirects to page 1
- No crash

**Fail criteria:**
- 500 error
- JS crash

---

### ADM-PRD-05 — Search products by name

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Products "Bồn cầu Toto" and "Sofa Đen" exist in DB.

**Steps:**
1. On `/admin/products` page
2. Locate the search input field
3. Type `Bồn cầu` into the search field
4. Wait 500ms (debounce) or press Enter

**Pass criteria:**
- Only products with "Bồn cầu" in their name are shown
- "Sofa Đen" is NOT shown

**Fail criteria:**
- All products still shown (search not working)
- Empty results when matching products exist

---

### ADM-PRD-06 — Search with no matching query shows empty state

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. On `/admin/products`
2. Type `zzzzqqqq9999` into search

**Pass criteria:**
- Empty state: "Không tìm thấy sản phẩm phù hợp" or similar
- No crash

**Fail criteria:**
- Table still shows all products (search ignored)

---

### ADM-PRD-07 — Filter by status: published

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Mix of draft and published products in DB.

**Steps:**
1. On `/admin/products`
2. Locate the status filter dropdown
3. Select "Đã xuất bản" (Published)

**Pass criteria:**
- Only products where `products.status = 'published'` are shown
- Status badge on every row is "Đã xuất bản"
- Query `SELECT count(*) FROM products WHERE status='published' AND deleted_at IS NULL` matches displayed count

**Fail criteria:**
- Draft products still visible
- Filter has no effect

---

### ADM-PRD-08 — Filter by status: draft

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. On `/admin/products`
2. Select "Bản nháp" (Draft) from status filter

**Pass criteria:**
- Only `status='draft'` products shown

**Fail criteria:**
- Published products mixed in

---

### ADM-PRD-09 — Sort by name ascending

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. On `/admin/products`
2. Click the "Tên sản phẩm" (Product Name) column header

**Pass criteria:**
- List re-orders: first row name alphabetically precedes second row name (A→Z in Vietnamese/EN)
- Column header shows sort indicator (↑)

**Fail criteria:**
- Order unchanged

---

### ADM-PRD-10 — Sort by name descending (toggle)

**Type:** E2E | **Priority:** 🟡 Medium

**Steps:**
1. Click "Tên sản phẩm" header once (ascending)
2. Click again

**Pass criteria:**
- List re-orders Z→A
- Sort indicator changes to ↓

**Fail criteria:**
- No change on second click

---

### ADM-PRD-11 — Product create: empty name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** On product create form (click "Thêm sản phẩm" or navigate to `/admin/products?create=1`).

**Steps:**
1. Open the product create form/panel
2. Leave **Tên sản phẩm (VI)** field empty
3. Fill in all other required fields:
   - Slug: `test-product-slug`
   - Mô tả ngắn (VI): `Mô tả ngắn test`
   - Danh mục: select any available category
4. Click the **"Lưu"** (Save) or **"Tạo sản phẩm"** button

**Pass criteria:**
- Form stays open / does NOT navigate away
- Inline error under name_vi field: **"Tên sản phẩm tiếng Việt là bắt buộc"**
- No Supabase insert attempted (check Network tab: no POST request)

**Fail criteria:**
- Product created with empty name
- Different or no error message

---

### ADM-PRD-12 — Product create: whitespace-only name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In **Tên sản phẩm (VI)**: type `   ` (3 spaces)
3. Fill other required fields (slug, summary_vi, category)
4. Click Save

**Pass criteria:**
- Zod `.trim().min(1)` reduces `"   "` to `""` → error: "Tên sản phẩm tiếng Việt là bắt buộc"

**Fail criteria:**
- Product saved with `name_vi = "   "`

---

### ADM-PRD-13 — name_vi at 255 characters is accepted

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Open product create form
2. In **Tên sản phẩm (VI)**: paste 255 characters of text (e.g., `A` repeated 255 times)
3. Fill all other required fields
4. Click Save

**Pass criteria:**
- Product saved successfully
- DB row has `name` = 255 chars in product_translations

**Fail criteria:**
- Rejected (if there's an unexpected max length)

---

### ADM-PRD-14 — name_vi with XSS payload stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In **Tên sản phẩm (VI)**: type `<script>alert('xss')</script>`
3. Fill other required fields and save
4. Navigate to the public product listing page `/vi/products`

**Pass criteria:**
- Product is saved (server accepts it as text)
- On the public page, the text is rendered as escaped HTML: `&lt;script&gt;alert(...)` — NOT executed
- No alert dialog appears

**Fail criteria:**
- `alert('xss')` dialog appears on any page
- Server rejects with 500

---

### ADM-PRD-15 — name_vi with SQL injection stored as literal text

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In **Tên sản phẩm (VI)**: type `'; DROP TABLE products;--`
3. Fill other required fields and save

**Pass criteria:**
- Product saved with literal name `'; DROP TABLE products;--`
- DB products table still exists (parameterized query prevents injection)
- No DB error in server logs

**Fail criteria:**
- 500 error
- Table affected

---

### ADM-PRD-16 — name_vi with special Vietnamese characters

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open product create form
2. In name_vi: `Bàn & Ghế <đẹp> "cao cấp"`
3. Save product
4. View product list

**Pass criteria:**
- Saved and displayed with correct Vietnamese diacritics and HTML encoding
- Ampersand & quotes displayed correctly (not corrupted)

**Fail criteria:**
- Characters corrupted (encoding issue)

---

### ADM-PRD-17 — summary_vi empty shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Fill name_vi: `Test Product`
3. Leave **Mô tả ngắn (VI)** empty
4. Fill slug, category, save

**Pass criteria:**
- Error: "Mô tả ngắn tiếng Việt là bắt buộc"
- No product created

**Fail criteria:**
- Product created with empty summary

---

### ADM-PRD-18 — summary_vi whitespace-only shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In summary_vi: `   ` (spaces)
3. Save

**Pass criteria:**
- Trimmed → error same as ADM-PRD-17

---

### ADM-PRD-19 — slug empty shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Fill name_vi, summary_vi, category
3. Clear the **Slug** field (or leave blank if auto-generated, then delete)
4. Save

**Pass criteria:**
- Error: "Slug không được để trống"

**Fail criteria:**
- Product saved with empty slug (DB constraint would catch but FE should show error first)

---

### ADM-PRD-20 — slug with uppercase letters rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Fill required fields
3. In **Slug**: type `My-Product-SLUG`
4. Save

**Pass criteria:**
- Zod slugRegex `/^[a-z0-9-]+$/` rejects uppercase
- Error: "Slug chỉ được chứa ký tự thường, số và dấu gạch ngang"

**Fail criteria:**
- Product saved with uppercase slug

---

### ADM-PRD-21 — slug with spaces rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In **Slug**: type `my product name`
3. Save

**Pass criteria:**
- Regex rejects (spaces not in `[a-z0-9-]`)
- Error shown

---

### ADM-PRD-22 — slug with special characters rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. In Slug: `my-product@2026!`
2. Save

**Pass criteria:**
- `@` and `!` fail regex → error

---

### ADM-PRD-23 — valid slug accepted

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. In Slug: `bon-cau-toto-t2026`
2. All other fields valid
3. Save

**Pass criteria:**
- Product created successfully
- `product_translations.slug = 'bon-cau-toto-t2026'`

---

### ADM-PRD-24 — Duplicate slug in same locale rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Product with slug `existing-slug` already exists in locale `vi`.

**Steps:**
1. Open product create form
2. Enter slug `existing-slug` (same as existing product)
3. Fill all other required fields
4. Save

**Pass criteria:**
- DB unique index `uq_product_translations_locale_slug` triggers
- UI shows error: slug already taken or DB constraint error
- No duplicate product created

**Fail criteria:**
- Second product saved with same slug (breaks public routing)

---

### ADM-PRD-25 — No category selected shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Fill name_vi, summary_vi, slug
3. Leave the **Danh mục** (Category) dropdown at its default empty state
4. Save

**Pass criteria:**
- Error: "Danh mục sản phẩm là bắt buộc"

---

### ADM-PRD-26 — Invalid category UUID blocked server-side

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form, fill all fields normally
2. Using browser DevTools, intercept the form submit request
3. Modify `category_id` in the request payload to `"not-a-uuid"`
4. Resend the modified request

**Pass criteria:**
- Server returns HTTP 400/422
- Response body contains field error for category_id
- No product inserted in DB

**Fail criteria:**
- Server accepts the invalid UUID
- FK constraint violation 500 error returned raw

---

### ADM-PRD-27 — price_min greater than price_max shows cross-field error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. In **Giá tối thiểu (price_min)**: type `5000000`
3. In **Giá tối đa (price_max)**: type `1000000`
4. Fill all other required fields
5. Save

**Pass criteria:**
- Zod `.refine()` catches `price_min > price_max`
- Error: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa"
- Error appears near the `price_min` field

**Fail criteria:**
- Product saved with invalid price range
- DB check `chk_products_price_range` raises raw error instead of friendly message

---

### ADM-PRD-28 — price_min equals price_max is accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Set price_min = `2000000`, price_max = `2000000`
2. Save

**Pass criteria:**
- Zod: `price_min <= price_max` → true → accepted
- Product saved

---

### ADM-PRD-29 — Negative price_min rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Set price_min = `-100` (enter -100 in field)
2. Save

**Pass criteria:**
- DB constraint `chk_products_price_range` (`price_min >= 0`) rejects
- Or Zod catches it if min(0) is defined
- Error shown to user

---

### ADM-PRD-30 — price_min = 0 is accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Set price_min = `0`
2. Save

**Pass criteria:**
- Accepted (0 >= 0 passes DB constraint)

---

### ADM-PRD-31 — Non-numeric value in price_min

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. In price_min field: type `abc`
2. Save

**Pass criteria:**
- FE input prevents non-numeric entry (type=number field)
- OR if text is sent: Zod `z.number()` rejects with type error
- Friendly error shown

---

### ADM-PRD-32 — promo_price_min >= price_min shows error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Set price_min = `2000000`, price_max = `3000000`
2. Set promo_price_min = `3000000` (same as price_max, greater than price_min)
3. Save

**Pass criteria:**
- Zod refine: `promo_price_min < price_min` fails (3M is NOT < 2M)
- Error: "Giá khuyến mãi phải nhỏ hơn giá gốc"

---

### ADM-PRD-33 — Valid promo_price_min accepted

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. price_min = `2000000`, promo_price_min = `1000000`
2. Save

**Pass criteria:**
- 1M < 2M passes Zod refine
- Product saved

---

### ADM-PRD-34 — Dimension width cannot be negative

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. In **Chiều rộng (width)**: enter `-10`
2. Save

**Pass criteria:**
- DB constraint `chk_products_dimensions_non_negative` (`width >= 0`) rejects
- Error shown

---

### ADM-PRD-35 — Dimension width = 0 is accepted

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. In width: enter `0`
2. Save

**Pass criteria:**
- 0 >= 0 passes constraint
- Saved

---

### ADM-PRD-36 — Currency must be exactly 3 uppercase letters

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. In the **Đơn vị tiền tệ** (currency) field: enter `VN` (only 2 chars)
2. Save

**Pass criteria:**
- Zod `z.string().length(3)` rejects
- DB constraint `chk_products_currency_iso_like` (`currency ~ '^[A-Z]{3}$'`) would also reject
- Error shown

---

### ADM-PRD-37 — Valid brand_id accepted

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** At least 1 brand exists in DB.

**Steps:**
1. Open product create form
2. From **Thương hiệu** dropdown: select an existing brand
3. Fill other required fields
4. Save

**Pass criteria:**
- `products.brand_id` = selected brand UUID
- Brand association visible in product list

---

### ADM-PRD-38 — Invalid brand UUID blocked

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Intercept form submit via DevTools
2. Modify `brand_id` to `"not-a-uuid"`
3. Resend

**Pass criteria:**
- Zod `z.string().uuid()` rejects before DB
- HTTP 400

---

### ADM-PRD-39 — Empty promotion_id creates product without promotion link

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Create product with no promotion selected
2. Save

**Pass criteria:**
- Product created
- `SELECT * FROM product_promotions WHERE product_id = '<new_id>'` → 0 rows

---

### ADM-PRD-40 — Custom attribute with empty name_vi shows error

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Open product create form
2. Click "Thêm thuộc tính" (Add attribute)
3. Leave **Tên thuộc tính (VI)** blank
4. Enter value_vi: `Some Value`
5. Save

**Pass criteria:**
- Error: "Tên thuộc tính (VI) bắt buộc"

---

### ADM-PRD-41 — Custom attribute value with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Add attribute with name_vi: `Color`, value_vi: `<img src=x onerror=alert('xss')>`
2. Save
3. Navigate to public product page

**Pass criteria:**
- Stored as escaped text
- No `alert()` executes
- Rendered as literal text on public page

---

### ADM-PRD-42 — Create product with all required fields succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Fill:
   - name_vi: `Ghế Sofa Test ABC`
   - summary_vi: `Mô tả ngắn cho ghế sofa test`
   - slug: `ghe-sofa-test-abc`
   - category_id: select first available category
   - currency: `VND` (default)
   - status: `draft`
3. Click Save

**Pass criteria:**
- Success toast: "Tạo sản phẩm thành công"
- Form closes (or navigates to list/edit)
- DB: `SELECT * FROM products WHERE id = '<returned id>'` returns 1 row
- DB: `SELECT * FROM product_translations WHERE product_id = '<returned id>' AND locale = 'vi'` returns 1 row with correct name/summary/slug

**Fail criteria:**
- Error toast
- DB row not created

---

### ADM-PRD-43 — Audit log written after product create

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Product created in ADM-PRD-42.

**Steps:**
1. After successful product create
2. Query: `SELECT * FROM audit_logs WHERE entity_type = 'product' AND action = 'create' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row exists with:
  - `action = 'create'`
  - `entity_type = 'product'`
  - `entity_id = <product UUID from ADM-PRD-42>`
  - `actor_id = <admin user UUID>`
  - `metadata` contains `{"name": "Ghế Sofa Test ABC", "slug": "ghe-sofa-test-abc"}`

---

### ADM-PRD-44 — Publishing without both vi+en translations blocked by DB trigger

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create a product as draft with only VI translation (name_vi, summary_vi set; name_en left empty)
2. On the edit form, change status to "Đã xuất bản" (Published)
3. Click Save

**Pass criteria:**
- DB trigger `trg_products_require_publish_translations` fires
- Error returned: "Cannot publish without required vi and en translations"
- Product remains in draft status

---

### ADM-PRD-45 — Publish with both vi+en translations succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create product with name_vi AND name_en (and summary_vi, summary_en)
2. Set status = "Đã xuất bản"
3. Save

**Pass criteria:**
- `products.status = 'published'`
- `products.published_at` = current timestamp (not null)
- Product visible on public `/vi/products`

---

### ADM-PRD-46 — Draft → Published state transition updates DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create product as draft (ADM-PRD-42)
2. Edit the product
3. Add name_en and summary_en
4. Change status to Published
5. Save
6. Query: `SELECT status, published_at FROM products WHERE id = '<id>'`

**Pass criteria:**
- `status = 'published'`
- `published_at IS NOT NULL`

---

### ADM-PRD-47 — Published → Archived state transition

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open a published product's edit form
2. Change status to "Đã lưu trữ" (Archived)
3. Save
4. Query DB

**Pass criteria:**
- `products.status = 'archived'`
- `products.deleted_at` is still NULL (archived is not soft-deleted)
- Product no longer appears on public product list

---

### ADM-PRD-48 — Delete product performs soft delete

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. On product list, locate a product
2. Click the delete icon/button for that product
3. Confirm deletion in the confirmation dialog
4. Query DB: `SELECT deleted_at, status FROM products WHERE id = '<id>'`

**Pass criteria:**
- `deleted_at` is NOT NULL (soft delete)
- `status = 'archived'`
- Product no longer visible in the admin product list
- Product no longer visible on public `/vi/products`

---

### ADM-PRD-49 — Deleted product has audit log entry

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. After ADM-PRD-48 (delete)
2. Query: `SELECT * FROM audit_logs WHERE entity_id = '<id>' AND action = 'archive'`

**Pass criteria:**
- Row exists with `action = 'archive'`

---

### ADM-PRD-50 — Category dropdown is populated from real DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product create form
2. Click the **Danh mục** (Category) dropdown

**Pass criteria:**
- Dropdown options match the result of: `SELECT name FROM product_category_translations WHERE locale='vi' AND category_id IN (SELECT id FROM product_categories WHERE deleted_at IS NULL)`
- NOT hardcoded / mock data

---

### ADM-PRD-51 — New category appears in product dropdown after creation

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Create a new category "Danh mục Test ABC" (see Category tests)
2. Navigate to product create form (without full page reload if possible)
3. Open category dropdown

**Pass criteria:**
- "Danh mục Test ABC" appears in the dropdown

**Fail criteria:**
- New category not in dropdown (requires manual page reload to appear)

---

### ADM-PRD-52 — Brand dropdown populated from real DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open product create form
2. Click **Thương hiệu** (Brand) dropdown

**Pass criteria:**
- Options match: `SELECT name_vi FROM brands WHERE deleted_at IS NULL AND status='published'`

---

### ADM-PRD-53 — Promotion dropdown populated from real DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open product create form
2. Look for the **Khuyến mãi** (Promotion) dropdown or select

**Pass criteria:**
- Options match active promotions from `promotions` table

---

### ADM-PRD-54 — Slug auto-generated from name_vi

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Open product create form
2. In name_vi type: `Bàn Ăn Gỗ Óc Chó Cao Cấp`
3. Click into another field (tab away from name_vi)
4. Observe the Slug field

**Pass criteria:**
- Slug is auto-populated with something like `ban-an-go-oc-cho-cao-cap` (lowercase, diacritics removed, spaces replaced with hyphens)
- Uses `slugify()` function from admin-workflows.tsx

**Fail criteria:**
- Slug remains blank
- Slug contains Vietnamese diacritics or spaces

---

### ADM-PRD-55 — Duplicate reference_code rejected

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** A product with `reference_code = 'REF-001'` exists.

**Steps:**
1. Create a new product
2. In **Mã tham chiếu** (reference_code): enter `REF-001`
3. Save

**Pass criteria:**
- DB partial unique index `uq_products_reference_code_active` (on `lower(reference_code)` where `deleted_at IS NULL`) fires
- Error shown to user

---

### ADM-PRD-56 — revalidatePath called after product create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. On public `/vi/products` page: note current product list
2. Create a new published product via admin
3. Without manually reloading the public page (or force refresh once): navigate to `/vi/products`

**Pass criteria:**
- New product appears on the public page within 1 page load (Next.js cache revalidated)

---

### ADM-PRD-57 — Edit form pre-populates existing product data

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Product "Ghế Sofa Test ABC" created in ADM-PRD-42.

**Steps:**
1. In admin product list, click the edit icon for "Ghế Sofa Test ABC"
2. Wait for edit form to load

**Pass criteria:**
- name_vi = `Ghế Sofa Test ABC`
- summary_vi = `Mô tả ngắn cho ghế sofa test`
- slug = `ghe-sofa-test-abc`
- Category = correct category
- status = `draft` (as saved)

**Fail criteria:**
- Fields blank or showing different product's data

---

### ADM-PRD-58 — Edit name_vi and save updates DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open edit form for a product
2. Change name_vi to `Ghế Sofa Test ABC UPDATED`
3. Click Save

**Pass criteria:**
- `SELECT name FROM product_translations WHERE product_id='<id>' AND locale='vi'` = `Ghế Sofa Test ABC UPDATED`
- Product list shows new name

---

### ADM-PRD-59 — Edit slug and save updates DB (with URL consequence warning)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open product edit form
2. Change slug from `ghe-sofa-test-abc` to `ghe-sofa-test-abc-v2`
3. Save

**Pass criteria:**
- `product_translations.slug = 'ghe-sofa-test-abc-v2'`
- Old URL `/vi/products/ghe-sofa-test-abc` now 404s (expected — no auto-redirect created)
- New URL `/vi/products/ghe-sofa-test-abc-v2` works

---

### ADM-PRD-60 — Edit category updates product's category_id

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product edit form; note current category
2. Change category dropdown to a different category
3. Save

**Pass criteria:**
- `products.category_id` = new category UUID
- In product list, product now appears under new category filter

---

### ADM-PRD-61 — Edit price_min saves correctly

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product edit form
2. Change price_min from current value to `3000000`
3. Ensure price_max >= 3000000
4. Save
5. Query: `SELECT price_min FROM products WHERE id = '<id>'`

**Pass criteria:**
- `price_min = 3000000`

---

### ADM-PRD-62 — Edit promotion link syncs product_promotions table

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** A promotion "SUMMER2026" exists.

**Steps:**
1. Open product edit form; product has no promotion linked
2. From promotion dropdown, select "SUMMER2026"
3. Save
4. Query: `SELECT promotion_id FROM product_promotions WHERE product_id = '<id>'`

**Pass criteria:**
- 1 row exists with correct promotion_id

**Then:**
5. Edit again, change promotion to "No Promotion" / empty
6. Save
7. Query again

**Pass criteria:**
- Old `product_promotions` row deleted; 0 rows for this product_id

---

### ADM-PRD-63 — Edit with conflicting slug rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Product B exists with slug `existing-other-slug`.

**Steps:**
1. Edit Product A
2. Change its slug to `existing-other-slug`
3. Save

**Pass criteria:**
- DB unique constraint `uq_product_translations_locale_slug` rejects
- Error shown: slug already taken
- Product A unchanged

---

### ADM-PRD-64 — Edit: price_min > price_max shows cross-field error

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit a product with price_min=1M, price_max=2M
2. Change price_min to `3000000` (now > price_max)
3. Save

**Pass criteria:**
- Error: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa"

---

### ADM-PRD-65 — Edit: clear name_vi shows required error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open product edit form
2. Clear the name_vi field entirely
3. Save

**Pass criteria:**
- Error: "Tên sản phẩm tiếng Việt là bắt buộc"
- No DB update made

---

### ADM-PRD-66 — Edit: gallery images unchanged if not touched

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Product has 2 gallery images linked.

**Steps:**
1. Open product edit form
2. Do NOT interact with the image fields
3. Change only name_vi
4. Save
5. Query: `SELECT count(*) FROM product_media WHERE product_id = '<id>'`

**Pass criteria:**
- Same 2 gallery images still linked (count = 2 or 3 if cover included)
- No images deleted by the edit

---

### ADM-PRD-67 — Concurrent edit in two tabs (last-write-wins)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Open Tab A: edit Product X, change name_vi to `Name From Tab A`
2. Open Tab B: edit same Product X, change name_vi to `Name From Tab B`
3. In Tab A: click Save → success
4. In Tab B: click Save → success

**Pass criteria:**
- No crash in either tab
- Final name_vi in DB = `Name From Tab B` (last save wins)
- No silent data loss (no 500 error exposed)

---

### ADM-PRD-68 — Upload valid JPG cover image

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Cloudinary credentials configured. Test image file: `test_cover.jpg` (~500KB, valid JPEG).

**Steps:**
1. Open product create/edit form
2. Locate the **Ảnh bìa** (Cover Image) upload zone
3. Drag-and-drop `test_cover.jpg` onto the upload zone (or click to select)
4. Wait for upload progress indicator to complete
5. Observe the preview thumbnail

**Pass criteria:**
- Upload progress completes without error
- Image thumbnail preview visible in the form
- In background (after form save): `product_media` row with `is_primary=true` inserted
- `media_assets` row: `size_bytes > 0`, `format = 'jpg'`, `mime_type = 'image/jpeg'`, `original_filename = 'test_cover.jpg'`

**Fail criteria:**
- Upload fails / error message
- Thumbnail not shown
- DB row has `size_bytes = 0` or `size_bytes = 1`

---

### ADM-PRD-69 — Upload valid PNG cover image

**Type:** IT | **Priority:** 🔴 Critical

**Steps:** Same as ADM-PRD-68 but use a `.png` file.

**Pass criteria:**
- `format = 'png'`, `mime_type = 'image/png'`

---

### ADM-PRD-70 — Upload valid WebP cover image

**Type:** IT | **Priority:** 🟠 High

**Steps:** Same as ADM-PRD-68 but use a `.webp` file.

**Pass criteria:**
- Accepted and previewed

---

### ADM-PRD-71 — Upload oversized image (>10MB) is rejected client-side

**Type:** E2E | **Priority:** 🔴 Critical

**Preconditions:** Test file: `large_image.jpg` larger than 10MB (e.g., 16MB).

**Steps:**
1. Open product form image upload zone
2. Attempt to drag-and-drop `large_image.jpg`

**Pass criteria:**
- Error message appears IMMEDIATELY (before any upload begins): e.g., "File quá lớn. Tối đa 10MB"
- DevTools Network tab: NO request to Cloudinary made
- No `media_assets` row created

**Fail criteria:**
- File uploaded to Cloudinary then rejected
- No error shown

---

### ADM-PRD-72 — Upload unsupported PDF rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Attempt to drag-and-drop a `.pdf` file onto the cover image upload zone

**Pass criteria:**
- Client-side `allowedImageMimeTypes` check rejects immediately
- Error: "Định dạng file không được hỗ trợ"
- No Cloudinary upload

---

### ADM-PRD-73 — Upload shell script (.sh) rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Create a file `evil.sh` with content `#!/bin/bash; rm -rf /`
2. Attempt to drag-and-drop onto cover image zone

**Pass criteria:**
- Rejected client-side
- No upload

---

### ADM-PRD-74 — Upload 0-byte empty file rejected

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create a 0-byte file: `touch empty.jpg`
2. Attempt upload

**Pass criteria:**
- Client-side size check rejects
- OR: if uploaded, DB constraint `chk_media_assets_positive_size` rejects: `size_bytes > 0`

---

### ADM-PRD-75 — Upload SVG with embedded JS (security audit)

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Create file `evil.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('xss')</script>
</svg>
```

**Steps:**
1. Bypass the UI dropzone (use Postman or curl):
   ```
   POST /api/admin/media/upload
   Body: { public_id: "test/evil", secure_url: "https://res.cloudinary.com/test/evil.svg", format: "svg", bytes: 100, resource_type: "image" }
   ```
2. If accepted, note the returned `public_url`
3. Navigate to any public page that displays the SVG

**Pass criteria (expected fail — known risk):**
- Either: server rejects SVG format, OR
- The SVG is served with `Content-Disposition: attachment` preventing inline execution, OR
- CSP headers block inline script execution

**Fail criteria (current risk state):**
- SVG accepted AND served inline AND `alert('xss')` executes in browser

> 🔴 **This is a known risk in the current codebase (SVG is in ALLOWED_FORMATS). Document the result.**

---

### ADM-PRD-76 — Cover image linked as primary in product_media after save

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Product created with cover image (ADM-PRD-68 flow, then save product).

**Steps:**
1. Create product with cover image and save
2. Query: `SELECT * FROM product_media WHERE product_id = '<id>' AND is_primary = true`

**Pass criteria:**
- 1 row exists with `is_primary = true`
- `media_id` is a valid UUID in `media_assets` table
- NOT a URL string stored in media_id column

---

### ADM-PRD-77 — Gallery images linked in product_media after save

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload 3 gallery images in product create form
2. Save product
3. Query: `SELECT * FROM product_media WHERE product_id = '<id>' AND is_primary = false ORDER BY sort_order`

**Pass criteria:**
- 3 rows exist with `is_primary = false`
- `sort_order` values: 1, 2, 3 (sequential)
- All `media_id` are valid UUIDs

---

### ADM-PRD-78 — Replace cover image on edit deletes old product_media row

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Open product edit form (product already has a cover image)
2. Remove existing cover image
3. Upload a new cover image
4. Save
5. Query: `SELECT * FROM product_media WHERE product_id = '<id>' AND is_primary = true`

**Pass criteria:**
- Only 1 row with `is_primary = true`
- The `media_id` is the NEW image's UUID (old one replaced)

---

### ADM-PRD-79 — media_assets.size_bytes > 0 after upload

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload a valid image
2. Note the `media_assets.id` from the upload response
3. Query: `SELECT size_bytes FROM media_assets WHERE id = '<id>'`

**Pass criteria:**
- `size_bytes > 0` (e.g., 204800 for a 200KB image)

**Fail criteria:**
- `size_bytes = 0` (DB constraint should prevent this but API may pass `bytes ?? 0`)
- `size_bytes = 1` (ghost asset created by getOrCreateMediaAssetId)

---

### ADM-PRD-80 — media_assets.original_filename set correctly

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Upload a file named `gheso_product_photo.jpg`
2. Query: `SELECT original_filename FROM media_assets ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- `original_filename = 'gheso_product_photo.jpg'` (or without extension, per Cloudinary convention)

---

### ADM-PRD-81 — Upload 5 gallery images linked in order

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Upload 5 images to the gallery section of a product form
2. Save product
3. Query: `SELECT sort_order FROM product_media WHERE product_id='<id>' AND is_primary=false ORDER BY sort_order`

**Pass criteria:**
- 5 rows with sort_order: 1, 2, 3, 4, 5

---

### ADM-PRD-82 — Delete one gallery image removes product_media row

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Product has 3 gallery images
2. Open edit form
3. Click "X" on the 2nd gallery image to remove it
4. Save
5. Query product_media

**Pass criteria:**
- Only 2 `is_primary=false` rows remain

---

### ADM-PRD-83 — Editor role can create a product

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Navigate to `/admin/products` → create product
2. Fill required fields and save

**Pass criteria:**
- `requireEditorOrAdmin()` passes for editor role
- Product created successfully

---

### ADM-PRD-84 — Editor role can edit a product

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. As editor, open product edit form
2. Change name_vi and save

**Pass criteria:**
- Update successful

---

### ADM-PRD-85 — Anonymous cannot create product (server action auth check)

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Clear session (delete cookies)
2. Attempt to call `createAdminProduct` server action directly (or POST to the form endpoint)

**Pass criteria:**
- `requireEditorOrAdmin()` throws → returns `{ success: false, error: "Unauthorized" }`
- HTTP 401 or redirect to login

---

### ADM-PRD-86 — DB error on product insert shows user-friendly message

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Simulate DB error (e.g., temporarily set a FK constraint to fail by providing a fake category UUID that doesn't exist in the real flow).

**Steps:**
1. Intercept form submit
2. Modify `category_id` to a valid-format UUID that doesn't exist: `00000000-0000-0000-0000-000000000001`
3. Resend

**Pass criteria:**
- Server catches FK violation
- Returns `{ success: false, error: "..." }` with a message
- UI shows error toast (NOT a raw 500 stack trace)

---

### ADM-PRD-87 — Translation insert failure triggers product row cleanup

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Simulate translation insert failure (e.g., violate a translation unique constraint with a pre-existing slug for that locale).

**Steps:**
1. Ensure slug `dupe-slug-for-cleanup-test` already exists for locale `vi`
2. Create a new product with slug `dupe-slug-for-cleanup-test`

**Pass criteria:**
- Translation insert fails (unique constraint)
- `mutations.ts` cleanup code runs: `await supabase.from("products").delete().eq("id", product.id)`
- Query: `SELECT count(*) FROM products WHERE id = '<new_id>'` = 0 (product deleted)

---

### ADM-PRD-88 — dimension_display_text_en mapping bug verification

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create a product
2. In **Mô tả kích thước (VI)**: enter `Dài 120cm x Rộng 60cm`
3. In **Mô tả kích thước (EN)**: enter `120cm Long x 60cm Wide`
4. Save
5. Query: `SELECT dimension_display_text FROM product_translations WHERE product_id='<id>' AND locale='en'`

**Pass criteria:**
- Result = `120cm Long x 60cm Wide` (the EN value)

**Fail criteria (current bug in mutations.ts:322):**
- Result = `Dài 120cm x Rộng 60cm` (VI value shown for EN translation — this IS a confirmed bug)

---

### ADM-PRD-89 — getOrCreateMediaAsset creates ghost asset when URL passed

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. In product create form, paste a direct Cloudinary URL string into the cover image field (bypass upload widget, e.g., using DevTools to modify the form payload)
2. Send `cover_image = "https://res.cloudinary.com/test/image/upload/sample.jpg"` (a string URL, not a UUID)
3. Save product
4. Query: `SELECT size_bytes, mime_type FROM media_assets ORDER BY created_at DESC LIMIT 1`

**Pass criteria (expected fail — known issue):**
- If `getOrCreateMediaAssetId()` is called with a URL: creates a ghost asset with `size_bytes=1`, `mime_type='image/jpeg'`
- **Document this as a known data quality issue**

---

### ADM-PRD-90 — SVG XSS via Cloudinary upload endpoint (known risk)

**See ADM-PRD-75 above — same test.** Document result: is SVG accepted? Is it sanitized before storage? Is it blocked by CSP?

---

### ADM-PRD-91 — Publish trigger does NOT fire when updating non-status fields

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** A published product exists.

**Steps:**
1. Edit a published product
2. Change only `price_min` (do not change status)
3. Save

**Pass criteria:**
- `trg_products_require_publish_translations` trigger defined as `BEFORE INSERT OR UPDATE OF status` — does NOT fire
- Product updates successfully
- No trigger error

---

### ADM-PRD-92 — console.log in admin-queries.ts line 372 present in production build

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. Run production build: `npm run build`
2. Run production server: `npm start`
3. Navigate to `/admin/products`
4. Check server terminal/log output

**Pass criteria (expected fail — known issue):**
- Server terminal shows: `getAdminBlogPosts query result: { dataCount: N, error: null }`
- **This is a data/log leak — document that it exists in production and should be removed**

---

## 🗂️ MODULE 4 — Categories

### Prereqs for Category tests
- Logged in as admin
- `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

### ADM-CAT-01 — Category list loads from DB

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Navigate to `/admin` → click "Danh mục" in sidebar
2. Observe the category list

**Pass criteria:**
- Table rows match: `SELECT count(*) FROM product_categories WHERE deleted_at IS NULL`
- Each row shows: name (VI), group_key, status, parent (if any), sort_order

---

### ADM-CAT-02 — Parent-child hierarchy visible in list

**Type:** E2E | **Priority:** 🟠 High

**Preconditions:** Category "Sofa" exists as parent. Category "Sofa góc" has `parent_id = Sofa.id`.

**Steps:**
1. View category list

**Pass criteria:**
- "Sofa góc" shows its parent as "Sofa" (either indented display or "Parent: Sofa" label)

---

### ADM-CAT-03 — Search by name filters correctly

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. In category search input, type `Gạch`
2. Wait for results

**Pass criteria:**
- Only categories with "Gạch" in name shown

---

### ADM-CAT-04 — product_count reflects correct number

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Category "Sofa" has exactly 5 products.

**Steps:**
1. View category list, find "Sofa" row

**Pass criteria:**
- product_count column = 5

---

### ADM-CAT-05 — Create: empty name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Open category create form
2. Leave name_vi blank
3. Fill slug: `test-category`, select group_key
4. Click Save

**Pass criteria:**
- Error: "Tên danh mục tiếng Việt là bắt buộc"
- No category created

---

### ADM-CAT-06 — Create: whitespace-only name_vi shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `   ` (spaces)
2. Save

**Pass criteria:**
- Trimmed → same error as ADM-CAT-05

---

### ADM-CAT-07 — Create: name_vi with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. name_vi = `<script>alert('cat-xss')</script>`
2. Save (assuming other fields valid)
3. Navigate to public `/vi/products` (category filter)

**Pass criteria:**
- Stored as escaped text
- No `alert()` fires

---

### ADM-CAT-08 — Create: empty slug shows error

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. Fill name_vi; leave slug empty
2. Save

**Pass criteria:**
- Error: "Slug không được để trống"

---

### ADM-CAT-09 — Create: slug with uppercase rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. slug = `My-Category`
2. Save

**Pass criteria:**
- Error: "Slug chỉ được chứa ký tự thường, số và dấu gạch ngang"

---

### ADM-CAT-10 — Create: slug with spaces rejected

**Type:** E2E | **Priority:** 🔴 Critical

**Steps:**
1. slug = `my category`
2. Save

**Pass criteria:**
- Slug regex fails → error shown

---

### ADM-CAT-11 — Create: duplicate slug in same locale rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Category with slug `existing-cat-slug` already exists in locale `vi`.

**Steps:**
1. Create new category with slug `existing-cat-slug`
2. Save

**Pass criteria:**
- DB unique index `uq_product_category_translations_locale_slug` violation
- Error shown to user
- No duplicate category created

---

### ADM-CAT-12 — Create: valid group_key "wood" mapped to "wooden_furniture" in DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create category with group_key = "Nội thất gỗ" (UI: "wood")
2. Save
3. Query: `SELECT group_key FROM product_categories WHERE id = '<id>'`

**Pass criteria:**
- DB value = `'wooden_furniture'` (mapped by `mapGroupKeyToDb()`)

---

### ADM-CAT-13 — Create: invalid group_key rejected

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Intercept form submit
2. Modify `group_key = "invalid_group"`
3. Resend

**Pass criteria:**
- Zod enum `z.enum(["wood", "sanitary", "tiles"])` rejects
- HTTP 400

---

### ADM-CAT-14 — Create: sort_order as float rejected

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. In sort_order: enter `1.5`
2. Save

**Pass criteria:**
- Zod `z.number().int()` rejects
- Error shown

---

### ADM-CAT-15 — Create: sort_order negative (boundary behavior)

**Type:** IT | **Priority:** 🟡 Medium

**Steps:**
1. In sort_order: enter `-5`
2. Save

**Pass criteria:**
- Accepted (no min constraint in Zod for sort_order; documents current behavior)

---

### ADM-CAT-16 — Create: parent_id = self rejected

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Category "Sofa" exists with id `cat-uuid-sofa`.

**Steps:**
1. Edit "Sofa" category
2. In **Danh mục cha** (Parent Category) dropdown: select "Sofa" (itself)
3. Save

**Pass criteria:**
- Server check: `data.parent_id === id` → error "Circular parent-child relationship detected"

---

### ADM-CAT-17 — Create: valid parent_id accepted

**Type:** IT | **Priority:** 🟠 High

**Preconditions:** Category "Sofa" exists.

**Steps:**
1. Create new category "Sofa Góc"
2. In parent dropdown: select "Sofa"
3. Save

**Pass criteria:**
- `product_categories.parent_id = Sofa.id`

---

### ADM-CAT-18 — Create as draft: status=draft saved correctly

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create category with all required fields
2. Status = "Bản nháp" (Draft)
3. Save

**Pass criteria:**
- `product_categories.status = 'draft'`
- `published_at IS NULL`

---

### ADM-CAT-19 — Publish category with vi+en translations: succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create category with name_vi AND name_en
2. Status = "Đã xuất bản" (Published)
3. Save

**Pass criteria:**
- Trigger passes (both vi and en translations with non-blank name and slug exist)
- `status = 'published'`
- `published_at IS NOT NULL`

---

### ADM-CAT-20 — Publish category with only vi translation: trigger blocks

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create category with name_vi only (name_en blank)
2. Status = Published
3. Save

**Pass criteria:**
- `trg_product_categories_require_publish_translations` fires
- Error returned: "Cannot publish product_categories without required vi and en translations"
- Category remains draft

---

### ADM-CAT-21 — Category cover image upload links image_media_id

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Create category form; upload PNG to cover image zone
2. Save
3. Query: `SELECT image_media_id FROM product_categories WHERE id = '<id>'`

**Pass criteria:**
- `image_media_id` is a valid UUID (not null)
- Corresponding `media_assets` row has `size_bytes > 0`

---

### ADM-CAT-22 — Category cover image reachable on public page

**Type:** E2E | **Priority:** 🟠 High

**Steps:**
1. Publish a category with a cover image
2. Navigate to `/vi/products` (or wherever categories are shown with images)
3. Inspect the category card image

**Pass criteria:**
- Image URL is accessible (HTTP 200, not 404)
- Image renders in browser

---

### ADM-CAT-23 — Soft delete category hides it from list

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. On category list, click delete on a category
2. Confirm deletion
3. Query: `SELECT deleted_at FROM product_categories WHERE id = '<id>'`

**Pass criteria:**
- `deleted_at IS NOT NULL`
- `status = 'draft'` (set by deleteAdminCategory)
- Category no longer visible in admin list

---

### ADM-CAT-24 — Delete category with products: products remain (FK behavior)

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Category "Sofa" has 3 products linked.

**Steps:**
1. Soft-delete "Sofa" category
2. Query: `SELECT count(*) FROM products WHERE category_id = '<sofa_id>' AND deleted_at IS NULL`

**Pass criteria:**
- 3 products still exist (category soft-delete does NOT cascade delete products)
- Products' `category_id` still references the deleted category (may cause FK dangling; document behavior)

---

### ADM-CAT-25 — Audit log on category create

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create a category "Audit Test Category"
2. Query: `SELECT * FROM audit_logs WHERE entity_type = 'category' AND action = 'create' ORDER BY created_at DESC LIMIT 1`

**Pass criteria:**
- Row with `action='create'`, `entity_type='category'`, correct `entity_id`, `actor_id`

---

### ADM-CAT-26 — Edit form loads existing category data

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Click edit on a category in the list

**Pass criteria:**
- name_vi, slug, group_key, status, sort_order, parent_id all pre-populated correctly

---

### ADM-CAT-27 — Edit name_vi and save updates translation

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit category; change name_vi to `Danh mục Test UPDATED`
2. Save
3. Query: `SELECT name FROM product_category_translations WHERE category_id='<id>' AND locale='vi'`

**Pass criteria:**
- = `Danh mục Test UPDATED`

---

### ADM-CAT-28 — Edit slug updates translation and breaks old URL

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Change slug from `old-slug` to `new-slug`
2. Save
3. Check public URL: `/vi/products?category=old-slug`

**Pass criteria:**
- DB: new slug saved
- Old URL may 404 (no automatic redirect — document as expected behavior)
- New URL `/vi/products?category=new-slug` works

---

### ADM-CAT-29 — Edit: create circular reference A→B→C→A blocked

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:**
- Cat A has parent_id = null
- Cat B has parent_id = A
- Cat C has parent_id = B

**Steps:**
1. Edit Cat A
2. Set parent_id = Cat C (would create cycle: C is a child of A, now A is child of C)
3. Save

**Pass criteria:**
- `checkCircularCategory()` detects cycle
- Error: "Circular parent-child relationship detected"

---

### ADM-CAT-30 — Edit parent to valid new parent saves correctly

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Category "Sub-Cat" has parent = "Parent A"
2. Edit "Sub-Cat" → change parent to "Parent B"
3. Save

**Pass criteria:**
- `product_categories.parent_id = Parent B UUID`

---

### ADM-CAT-31 — Edit group_key and save maps correctly to DB

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Edit category with group_key = "wood"
2. Change to "sanitary"
3. Save
4. Query: `SELECT group_key FROM product_categories WHERE id='<id>'`

**Pass criteria:**
- DB = `'sanitary_equipment'` (mapped by `mapGroupKeyToDb`)

---

### ADM-CAT-32 — Edit status to Published with only vi: trigger blocks

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit a draft category that has only vi translation (no en)
2. Change status to Published
3. Save

**Pass criteria:**
- Trigger fires: "Cannot publish without vi and en translations"
- Status remains draft

---

### ADM-CAT-33 — Edit status to Published with vi+en: succeeds

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Edit category; ensure name_en is filled
2. Change status to Published
3. Save

**Pass criteria:**
- `status = 'published'`, `published_at IS NOT NULL`

---

### ADM-CAT-34 — Editor can edit a category

**Type:** IT | **Priority:** 🔴 Critical

**Preconditions:** Logged in as editor.

**Steps:**
1. Open category edit form
2. Change name_vi, save

**Pass criteria:**
- Update succeeds (`requireEditorOrAdmin()` passes for editor)

---

### ADM-CAT-35 — Edit name_vi with XSS stored safely

**Type:** IT | **Priority:** 🔴 Critical

**Steps:**
1. Change name_vi to `<b>Bold</b><script>alert('cat-edit-xss')</script>`
2. Save
3. View category in public page

**Pass criteria:**
- Escaped; no script executed

---

### ADM-CAT-36 — Slug shared between vi and en translations (uniqueness scope)

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create category with slug `shared-slug` (applies to both vi and en translations per mutations.ts)
2. Query: `SELECT locale, slug FROM product_category_translations WHERE category_id = '<id>'`

**Pass criteria:**
- Both rows (vi and en) have `slug = 'shared-slug'`
- No unique constraint violation (since vi and en are different locale rows)

---

### ADM-CAT-37 — mapGroupKeyToDb behavior for "tiles" group

**Type:** IT | **Priority:** 🟠 High

**Steps:**
1. Create category with group_key = "tiles"
2. Save
3. Query: `SELECT group_key FROM product_categories WHERE id = '<id>'`

**Pass criteria:**
- `mapGroupKeyToDb("tiles")` returns `"tiles"` as-is (no mapping)
- DB stores `'tiles'` — verify if DB enum `product_group` includes 'tiles'
- If DB does not have 'tiles' as valid enum value: an error occurs (document the result)

---

**[PAUSED — Modules 1-4 complete (164 test cases with full steps). Send "continue" to resume from: Module 5 — Brands]**
