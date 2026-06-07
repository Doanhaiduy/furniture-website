# Phase 04 Implementation Guide – Authentication & Admin Access Control

## Implementation Order
1. **User Bootstrap Setup**: Seed development profiles (`admin` and `editor` user entries) using a database script.
2. **Auth Context Configuration**: Code `components/providers/AuthProvider.tsx` to handle authentication states.
3. **Login Form Integration**: Connect `app/admin/login/page.tsx` to Supabase client auth methods.
4. **Middleware Protection**: Implement route interceptors in `middleware.ts`.
5. **Server Guards**: Write validation helpers inside `lib/supabase/auth.ts`.
6. **Sidebar Navigation Updates**: Adapt elements inside `components/showroom/admin-shell.tsx` dynamically.

---

## Route & Page Mapping
- `/admin/login` -> Public login interface. Resolves redirects if session is already authenticated.
- `/admin/access-denied` -> Public authorization error page.
- `/admin/quotes`, `/admin/users`, `/admin/settings` -> Admin-only routes.
- Other `/admin/*` routes -> Accessible to both `admin` and `editor` roles.

---

## Backend, Frontend, and Database Impacts
- **Database**: Reads the `profiles` table to resolve user roles.
- **Backend (Next.js server)**: Server components query profiles and enforce role checks before rendering. Middleware intercepts requests to block unauthorized routing.
- **Frontend**: The Admin Sidebar adapts dynamically.

---

## Docker & Local Runtime Implications
- Add Supabase environment variables to Docker Compose files.
- Session tokens are stored in cookie headers. Secure flags on cookies should be disabled in local dev mode (over HTTP) and enabled in production mode (over HTTPS).

---

## Gemini Settings & API Secret Implications
- Gemini configuration sections must be hidden from Editor profiles.
- Any API route handling Gemini config checks that the profile role is `admin` before returning data.

---

## Security & RLS Details
- RLS policies must allow authenticated users to read their own profile, but only users with the `admin` role can read other profiles:
  ```sql
  CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
  ```
- Ensure client-side route hiding is backed by server-side verification: a user navigating to `/admin/quotes` manually will be blocked at the middleware layer.

---

## Edge Cases & Rollback/Fallback Considerations
- **First Admin Account Bootstrapping**: In production, the first user signup must be handled securely. We will implement a database trigger or run a manual migration script to promote the first created profile to the `admin` role.
- **Stale Sessions**: If a user's role is changed from `editor` to `admin` in the database, the local session token might still reflect the old role. The server-side guards must perform a direct database query or force token refresh to verify roles dynamically.

---

## Open Questions & Assumptions
- **Assumption**: Supabase Auth email invitations can be bypassed in development, allowing developers to sign up users directly using credentials.
- **Open Question**: Will we support password reset flows? We assume password reset is deferred to a future phase and users must be managed by the administrator.
