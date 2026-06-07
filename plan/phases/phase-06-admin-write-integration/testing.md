# Phase 06 Testing – Admin Write Integration & Audit Logging

## Test Levels & Frameworks
- **Unit Testing**: Vitest checks for slug Zod validation rules and payload normalization helpers.
- **Integration Testing**: Vitest testing for database write helper functions with transaction rollbacks.
- **E2E Testing**: Playwright checks for form creation, validation alerts, and revalidation refreshes.
- **Manual Verification**: Direct database checks on table states and `audit_logs` entries.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Valid Content Creation & Audit Log Check
1. Log in to the admin panel as an Editor.
2. Navigate to `/admin/products/new`.
3. Fill out the form:
   - Name (VI): `"Bàn trà gỗ sồi cao cấp"`
   - Name (EN): `"Premium Oak Coffee Table"`
   - Slug: `"ban-tra-go-soi-cao-cap"`
   - Price: `15000000`
   - Category: Select an active category.
4. Click "Submit".
5. Verify that:
   - A success toast is displayed.
   - The user is redirected to `/admin/products`.
   - The product table displays the new item.
6. Check the database `audit_logs` table:
   ```sql
   SELECT action_type, target_table, metadata FROM audit_logs ORDER BY created_at DESC LIMIT 1;
   ```
7. Verify the output displays `action_type = 'INSERT'`, `target_table = 'products'`, and the metadata contains the new product details.

### Scenario 2: Form Validation Error Handling (Zod Check)
1. Navigate to `/admin/products/new`.
2. Input an invalid slug containing uppercase letters and spaces: `"Ban Tra Go Soi"`.
3. Click "Submit".
4. Verify that:
   - The form is not submitted.
   - The slug input field renders a red border and validation message: `"Slug chỉ được chứa chữ thường, số và dấu gạch ngang" / "Slug must contain only lowercase letters, numbers, and hyphens"`.

### Scenario 3: Soft-Deletion Verification (Archive Action)
1. Navigate to `/admin/products`.
2. Locate a product card row and click the "Archive" action button.
3. Verify a confirmation modal is shown with the warning message: `"Bạn có chắc chắn muốn lưu trữ sản phẩm này?" / "Are you sure you want to archive this product?"`.
4. Click "Confirm".
5. Verify that:
   - The product row disappears from the active table list (or updates its status indicator to "Archived").
   - A check on the database `products` table shows `is_active = false` (the record is not deleted).
   - The public products directory no longer displays the archived product.

### Scenario 4: Unauthorized Writer Block (RBAC Test)
1. Log in to the admin panel as an Editor.
2. Attempt to update system configurations via a direct API request:
   ```bash
   curl -i -X POST http://localhost:3000/api/admin/settings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <editor-token>" \
     -d '{"key":"gemini_model","value":"gemini-ultra"}'
   ```
3. Verify that:
   - The response returns `403 Forbidden`.
   - The database settings table is not updated.
   - A new row is written to `audit_logs` recording the unauthorized access attempt.
