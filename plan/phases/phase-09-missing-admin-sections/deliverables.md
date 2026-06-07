# Phase 09 Deliverables – Admin Settings, Users, Media, & AI Completion

## Concrete Expected Outputs
- **app/admin/settings/page.tsx**: Settings management page (Admin only) displaying General settings, SEO settings, and Gemini config tabs.
- **app/admin/users/page.tsx**: User management page (Admin only) listing users, and allowing role changes or account deactivations.
- **lib/security/mask.ts**: Helper utility masking confidential values (e.g. returning `****5678` for a 32-byte API key).
- **lib/security/encrypt.ts**: Crypto-backed helper encrypting and decrypting settings values using GCM specifications.
- **app/api/admin/users/route.ts**: Route Handler managing user roles and active flags.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `app/admin/settings/page.tsx` [MODIFY]
  - `app/admin/users/page.tsx` [MODIFY]
  - `app/api/admin/settings/route.ts` [NEW/MODIFY] (Settings API handler – Admin only)
  - `app/api/admin/users/route.ts` [NEW/MODIFY] (Users API handler – Admin only)
- **Components**:
  - `components/admin/AIContentGenerator.tsx` [MODIFY] (Add draft review triggers)
- **Tables**:
  - `profiles` [WRITE]
  - `settings` [WRITE]
  - `audit_logs` [WRITE]

## Future Touchpoints
- **Whole application** will be packaged inside the final Docker configurations in Phase 10.
- **All Admin endpoints** will undergo a final security penetration audit in Phase 10.

## Verification Evidence Required
1. **Masked Metadata verification**: Screen capture of Admin Settings page displaying `****` masks for the Gemini API key.
2. **Editor denial logs**: Integration tests verifying that Editor access to Settings API routes yields a `403 Forbidden` code.
3. **Database Audit Entries**: Database log rows showing audit records created upon user role updates and settings modifications.
4. **Draft Persistence**: SQL output verifying that clicking "Generate Draft" inserts record details inside the `ai_drafts` table.
