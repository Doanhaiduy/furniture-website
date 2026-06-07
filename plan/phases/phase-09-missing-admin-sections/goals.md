# Phase 09 Goals – Admin Settings, Users, Media, & AI Completion

## Measurable Goals
- **Secure Gemini settings UI**: Implement the configuration panel in Admin Settings allowing Admins to manage Gemini settings (enabled status, API key, model selection, temperature, max tokens).
- **Mask Secrets**: Ensure saved secrets (such as the Gemini API key) are returned from the server as masked values (e.g. `****1234`) and never displayed raw.
- **Key Rotation**: Provide a validation check when the Admin updates the Gemini API key, ensuring the key is valid before committing it to database settings and logging the rotation event in `audit_logs`.
- **Admin-only User Management**: Build the user profile management interface allowing Admins to view user accounts, update roles (`admin` or `editor`), and deactivate/activate accounts.
- **AI Drafting Panel**: Complete the AI description and blog draft panels, ensuring Editors can use the assistant to generate drafts but cannot view or modify the underlying configurations.

## Phase Success Conditions
- Navigating to `/admin/settings` as an Admin displays the AI configurations. Saving settings encrypts the Gemini key and creates a record in `audit_logs`.
- An Editor user is blocked from viewing `/admin/settings` or `/admin/users` (or fetching their backend APIs), receiving a `403 Forbidden` response.
- Editing a product outline via the AI Assistant calls the backend Gemini client, populates the description textarea as an uncommitted draft, and writes a metadata record to the `ai_drafts` database table.
- If Gemini is disabled or unconfigured, the AI drafting panel degrades gracefully, showing an "AI Offline" alert while leaving the manual editing fields fully operational.

## Concrete Results
- Fully functional `/admin/settings` and `/admin/users` pages in the admin panel.
- Decryption helper integration wiring the blog/product form AI widgets.
- Masked secret formatter and audit logging hooks for configurations updates.
- Verification tests proving Editor accounts are denied settings and user management pages.
