# Phase 09 Implementation Guide – Admin Settings, Users, Media, & AI Completion

## Implementation Order
1. **Security Helpers Setup**: Code encryption/decryption utilities in `lib/security/encrypt.ts` and masks in `lib/security/mask.ts`.
2. **Settings API Routing**: Build `/api/admin/settings` executing validation and encryption hooks.
3. **Settings Panel UI**: Integrate input fields and tabs in `app/admin/settings/page.tsx`.
4. **User Profiles Management API**: Code Route Handlers in `/api/admin/users`.
5. **Users Dashboard Page**: Integrate lists and role toggles in `app/admin/users/page.tsx`.
6. **Form AI Integrations**: Connect dynamic AI buttons inside Product and Blog edit forms.

---

## Route & Page Mapping
- `/admin/settings` -> Configuration manager. Displays General, SEO, and Gemini tabs. Requires the `admin` role.
- `/admin/users` -> Dashboard listing and managing user accounts. Requires the `admin` role.
- `/api/admin/settings` -> Configuration write endpoint.
- `/api/admin/users` -> User profile update endpoint.

---

## Backend, Frontend, and Database Impacts
- **Database**: Updates user metadata in `profiles` and saves configurations to `settings`. Writes log records to `audit_logs` and saves output drafts to `ai_drafts`.
- **Backend (Next.js server)**: Invokes the Supabase Auth Admin API using service-role clients, manages secret encryption, and processes Gemini config audits.
- **Frontend**: Settings fields display masked keys, user manager panels display toggles, and forms display AI widgets.

---

## Docker & Local Runtime Implications
- Verify `AI_SECRET_ENCRYPTION_KEY` is loaded inside the app container.
- Auth Admin API operations may require special configurations in the local dev database config to permit service-role actions.

---

## Gemini Settings & API Secret Implications
- Raw keys must never be returned from database settings select endpoints. Implement key masking inside settings GET APIs.
- Key updates require format checks (e.g. prefix and length checks) before saving.

---

## Security & RLS Details
- Settings and User routes are blocked at both middleware and route controller boundaries for non-admin accounts.
- RLS database policies prevent modification of the `settings` and `profiles` tables by Editor users:
  ```sql
  CREATE POLICY "Admin write settings" ON settings FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
  ```

---

## Edge Cases & Rollback/Fallback Considerations
- **Encryption Failures**: If settings fail to decrypt, display an "AI Offline" warning and prompt the Admin to re-enter the API key, without crashing settings views.
- **Invalid Key Seeding**: If the seeded key is an invalid format, flag verification failures in settings and disable generation buttons in product forms.
- **Self-Deactivation Block**: Prevent the currently authenticated Admin user from deactivating their own account or changing their own role to prevent lockout states.

---

## Open Questions & Assumptions
- **Assumption**: Only full Admin accounts can access user list views or setting configurations. Editor accounts are strictly blocked.
- **Open Question**: Will we support password reset triggers? We assume password changes are handled via the Supabase Dashboard, and the admin panel only manages roles and activations.
