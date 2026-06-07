# Phase 08 Testing – Data Migration & Seeding

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for media asset mapping logic.
- **Integration Testing**: Vitest testing verifying database seeding transaction logs.
- **E2E Testing**: Playwright check confirming public page listings render values from the database seeds.
- **Manual Verification**: SQL table queries verifying record counts and encoding characters.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Seed Script Idempotency (Repeatable Run Check)
1. Run database reset: `supabase db reset`.
2. Check total product count:
   ```sql
   SELECT COUNT(*) FROM products;
   -- Should display exactly the target count (e.g. 15).
   ```
3. Re-run the seed migration script manually.
4. Check total product count again.
5. Verify that:
   - The count is still exactly the same target count (no duplicate rows were created).
   - No primary key constraint or unique index errors were thrown.

### Scenario 2: Vietnamese diacritics integrity checks
1. Run the database seed.
2. Query specific Vietnamese text fields inside the database:
   - `SELECT name_vi FROM products WHERE slug = 'ban-tra-go-soi';`
3. Verify the output is exactly `"Bàn trà gỗ sồi"`.
4. Search for other accent characters (e.g., `đ`, `ư`, `ô`, `ế`) and confirm they are not converted to question marks (`?`) or garbled characters.

### Scenario 3: Production Code Quarantine Audit
1. Execute a codebase search for `lib/showroom-data.ts`.
2. Verify that:
   - No imports are present in `app/[locale]/` files or `app/admin/` pages.
   - The only references are located inside `tests/` or deprecated backup files.

### Scenario 4: Public Site Render Smoke
1. Start the dev server and access `http://localhost:3000/vi`.
2. Verify that:
   - The featured products section renders the seeded items.
   - Click a card to navigate to `/vi/products/[slug]` and confirm the details match the seed specs.
   - Check the product images render successfully using the seeded Cloudinary URL formats.
