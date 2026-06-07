# Phase 07 Testing – Media & Third-Party Service Integration

## Test Levels & Frameworks
- **Unit Testing**: Vitest testing for MIME checks, Google Maps allowed URL formats, and email templates compiling.
- **Integration Testing**: Vitest testing for Gemini decryption helpers and Cloudinary signed token generators.
- **E2E Testing**: Playwright checks for drag-and-drop actions, maps rendering, and AI draft loads.
- **Manual Verification**: Visual check of email formatting, maps interfaces, and upload indicators.

---

## Concrete Scenarios & Verification Steps

### Scenario 1: Upload Validation Constraints (Cloudinary Check)
1. Navigate to `/admin/media` as an Editor.
2. Attempt to upload a non-image file (e.g. `malicious-code.sh` or a 10MB image).
3. Verify that:
   - The upload is blocked on the client before submission.
   - The UI displays an error message: `"Định dạng tệp không được hỗ trợ hoặc tệp quá lớn" / "File format not supported or file too large"`.
4. Run a backend test bypassing client checks to POST directly to `/api/admin/media/upload`. Verify the endpoint returns `400 Bad Request`.

### Scenario 2: Google Maps Embed Rendering & Fallback
1. Open a showroom page: `/vi/showrooms`.
2. Verify that:
   - The map iframe resolves successfully using the configured Google Maps credentials.
   - The map renders coordinates correctly.
3. Update the showroom database record to set coordinates to invalid parameters.
4. Refresh the page and confirm the iframe falls back to a safe Google Maps link pointing to the text address.

### Scenario 3: HTML Email compilation
1. Execute a mock quote form submission on the contact page.
2. Confirm the sent email parameters in Resend mock logs:
   - The mail body contains valid HTML tags (`<html>`, `<body>`, styles).
   - Dynamic parameters (Client name, product of interest) are correctly compiled.
   - The email contains a link to the admin panel.

### Scenario 4: Gemini Draft Generation & Fallback
1. Log in to the admin panel as an Editor.
2. Navigate to the blog post creation page: `/admin/blog/new`.
3. Input a title: `"Xu hướng nội thất phòng khách 2026"` and click "Generate outline with AI".
4. Verify that:
   - A loading indicator is displayed.
   - The outlines are generated and populated inside the description textarea.
5. Simulate Gemini API failure (e.g. setting an invalid key).
6. Click the AI generate button.
7. Verify that:
   - The application does not crash.
   - An alert toast displays: `"Dịch vụ AI hiện không khả dụng. Vui lòng nhập thủ công" / "AI service is currently unavailable. Please enter content manually"`.
   - The API endpoint returns `503 Service Unavailable` with a safe error payload.
