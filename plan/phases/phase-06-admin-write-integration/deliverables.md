# Phase 06 Deliverables – Admin Write Integration & Audit Logging

## Concrete Expected Outputs
- **lib/supabase/mutations.ts**: Collection of server-side data insertion and update functions (such as `createProduct`, `updateProduct`, `archiveProduct`).
- **lib/supabase/audit.ts**: Security logging wrapper executing SQL inserts into the `audit_logs` table.
- **lib/validations/admin.ts**: Zod schemas validating admin inputs (e.g. `productFormSchema`, `blogFormSchema`).
- **components/admin/DeleteConfirmDialog.tsx**: Confirmation modal displaying warnings before destructive actions.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `app/admin/products/new/page.tsx` [NEW/MODIFY] (Create Product form)
  - `app/admin/products/[id]/edit/page.tsx` [NEW/MODIFY] (Edit Product form)
  - `app/admin/categories/new/page.tsx` [NEW/MODIFY] (Create Category form)
  - `app/admin/categories/[id]/edit/page.tsx` [NEW/MODIFY] (Edit Category form)
  - `app/admin/blog/new/page.tsx` [NEW/MODIFY] (Create Blog post form)
  - `app/admin/blog/[id]/edit/page.tsx` [NEW/MODIFY] (Edit Blog post form)
  - `app/admin/showrooms/new/page.tsx` [NEW/MODIFY] (Create Showroom form)
  - `app/admin/showrooms/[id]/edit/page.tsx` [NEW/MODIFY] (Edit Showroom form)
- **Tables**:
  - `products`, `categories`, `blog_posts`, `showrooms` [WRITE]
  - `audit_logs` [WRITE]

## Future Touchpoints
- **Product and Blog forms** will receive image upload buttons integrated with Cloudinary in Phase 07.
- **Blog form** will receive AI drafting assistance in Phase 09.
- **User profiles management** will be enabled for Admin in Phase 09.

## Verification Evidence Required
1. **Database Persistence logs**: SQL query outputs confirming successful insertion of new records:
   ```sql
   SELECT id, name_vi, price FROM products WHERE name_vi = 'Bàn trà gỗ sồi';
   ```
2. **Audit Log verification**: Database check proving audit logs record the actions:
   ```sql
   SELECT actor_id, action_type, target_table FROM audit_logs ORDER BY created_at DESC LIMIT 1;
   ```
3. **Revalidation checks**: Dynamic revalidation logs proving public paths update immediately on save.
4. **Validation Test suite**: Vitest outputs verifying Zod rules block invalid slugs or blank strings.
