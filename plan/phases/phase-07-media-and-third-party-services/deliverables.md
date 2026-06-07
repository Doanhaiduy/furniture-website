# Phase 07 Deliverables – Media & Third-Party Service Integration

## Concrete Expected Outputs
- **lib/cloudinary/client.ts**: Server-side Cloudinary client configuration executing uploads, deletions, and signature verification.
- **components/admin/MediaUpload.tsx**: UI component supporting drag-and-drop file imports, rendering upload progress bars.
- **components/public/GoogleMap.tsx**: Render client for showroom pages executing maps embeds using validated domain configs.
- **lib/email/templates/manager-notification.tsx**: HTML template rendering details (logo, contact parameters, message metadata).
- **lib/ai/gemini.ts**: Server client configuring the Gemini connection, temperature bounds, safety limits, and decryption hooks.
- **app/api/admin/ai/generate-draft/route.ts**: API route processing draft generation from content titles or guidelines, returning draft text bodies.

## Affected Routes, Components, APIs, Tables, and Configurations
- **Routes**:
  - `app/api/admin/media/upload/route.ts` [NEW] (Signed upload handler)
  - `app/api/admin/ai/generate-draft/route.ts` [NEW]
  - `app/admin/media/page.tsx` [MODIFY] (Media library UI integration)
  - `app/[locale]/showrooms/page.tsx` [MODIFY] (Integrate maps component)
- **Components**:
  - `components/admin/AIContentGenerator.tsx` [NEW]
- **Tables**:
  - `media_assets` [WRITE]
  - `quote_notifications` [WRITE]
  - `ai_drafts` [WRITE]
  - `audit_logs` [WRITE]

## Future Touchpoints
- **Cloudinary upload component** will be used inside product/blog forms in Phase 09.
- **AI settings forms** will render Gemini configuration inputs in Phase 09.
- **Email notifications retry logic** will be hardened in Phase 10.

## Verification Evidence Required
1. **Cloudinary Upload logs**: Console output showing successful execution of signed file uploads, returning Cloudinary asset URLs.
2. **Dynamic Maps render**: Screenshots of showroom pages displaying the correct Google Maps embed.
3. **Resend dynamic email capture**: Visual confirmation of HTML notification emails in the receiver mailbox.
4. **Gemini API execution logs**: Server-side output confirming prompt dispatches to Gemini and the returned markdown drafts.
