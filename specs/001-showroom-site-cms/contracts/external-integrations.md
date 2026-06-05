# External Integration Contracts

## Resend Email

Purpose: quote request notification.

Trigger:

- After a valid quote request is persisted.

Inputs:

- Customer name, phone, optional email/company.
- Message.
- Source path.
- Optional product/category context.
- Submission locale.

Outputs:

- `notificationStatus = sent` when accepted by email provider.
- `notificationStatus = failed` and `notificationError` when delivery request fails.

Rules:

- Failure does not delete or reject the saved quote request.
- Email API key and recipients are server-only settings.
- Public response must not expose provider errors.

## Google Maps Embed API

Purpose: showroom location display.

Inputs:

- Google map embed URL per active showroom.
- Fallback Google Maps URL per active showroom.

Rules:

- Public page renders the embed when available.
- Public page renders a visible fallback link when embed fails, is blocked, or is not
  available.
- API keys or embed configuration must be restricted by deployment domain where
  supported.

## OpenAI

Purpose: CMS content assistant.

Allowed tasks:

- Generate product descriptions.
- Generate SEO metadata.
- Translate or draft Vietnamese/English content.

Inputs:

- CMS user prompt or action.
- Selected product/blog/homepage/SEO content context.
- Source and target locale when translating.

Outputs:

- Editable AI-assisted draft.
- Error message safe for CMS users when generation fails.

Rules:

- Output is never auto-published.
- API key is server-only in Payload runtime.
- Prompt content must not include private lead data or secrets.
- Accepted draft content still passes normal publication validation.

## Cloudinary

Purpose: media object storage.

Inputs:

- Validated image file from authorized Admin or Editor.
- Content field context and validation metadata: allowed origin, size/type/dimensions
  when available, and alt text where the owning content requires it.

Outputs:

- Public Cloudinary URL for approved public media.
- URL stored directly in the owning Payload document image field or image array.

Rules:

- Only approved image MIME types are accepted.
- Public delivery is allowed only for approved public media folders/assets.
- Upload/update/delete operations are role-gated and signed server-side.

## Deployment And CI/CD

Platforms:

- Vercel for public Next.js frontend.
- Railway or Render for Payload CMS service.
- managed PostgreSQL for data and Cloudinary for media.
- GitHub Actions for lint, typecheck, tests, build, and deployment workflows.

Required checks before merge/deploy:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run E2E checks when changed routes/workflows affect public browsing, quote submission,
CMS auth, i18n, SEO, or responsive behavior.

