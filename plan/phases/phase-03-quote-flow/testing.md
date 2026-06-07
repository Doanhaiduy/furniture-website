# Phase 03 Testing – Quote Request Flow

## Test Levels & Frameworks
- **Unit Testing**: Vitest checks phone/email/empty input validation rules.
- **Integration Testing**: Vitest mocks the Resend SDK to verify HTML emails compile.
- **E2E Testing**: Playwright checks honeypot actions and validation UI alerts.
- **Manual Verification**: Database query checks for audit logs and notification status fields.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Form Validation Verification
1. Run `pnpm test tests/unit/quote-schema.test.ts`.
2. Verify that:
   - Invalid phone formats (e.g. `123456`, `abcdef`, or international numbers lacking formatting) are rejected.
   - Vietnamese formats (e.g. `0912345678`, `0312345678`) are accepted.
   - Missing required fields (Name, Message) yield appropriate error structures.

### Scenario 2: Honeypot Validation Checks (Spam Mitigation)
1. Execute a payload submission with the honeypot filled:
   ```bash
   curl -i -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Bot Test","email":"bot@test.com","phone":"0912345678","message":"Spam body text","website_confirm":"some-bot-value"}'
   ```
2. Verify the response yields a `200 OK` code and JSON output `{"submitted": true}`.
3. Check the database `quote_requests` table to verify that no new rows were inserted.

### Scenario 3: Rate Limiting Verification
1. Run a loop executing 5 rapid submissions to `http://localhost:3000/api/contact` using curl.
2. Verify that:
   - The first 3 submissions return `200 OK`.
   - The 4th and 5th submissions are rejected, yielding `429 Too Many Requests`.
   - The response headers contain rate-limiting window indicators if active.

### Scenario 4: Email Delivery Fallback Check
1. Mock the Resend client connection to throw a timeout error.
2. Submit a valid quote request via the contact API.
3. Verify that:
   - The record is successfully written to the database `quote_requests` table.
   - The database `quote_notifications` table records a new row with the status `failed` and logs the error.
   - The API returns a success code `200 OK` to the client page, ensuring the user experience is unaffected.
