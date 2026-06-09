# Deployment

## Targets

| Component | Target |
| --- | --- |
| Public frontend | Vercel |
| Payload CMS app | Separate Node runtime such as Render, Railway, Fly.io, or equivalent |
| Database | Managed PostgreSQL |
| Media | Cloudinary |
| Email | Resend |
| Maps | Google Maps Embed |
| AI | OpenAI |

## Environments

Use at least:

- Local development.
- Preview/staging.
- Production.

Each environment needs separate database, Payload secret, Cloudinary folder/preset policy, Resend sender/recipients, and OpenAI usage controls where possible.

## Required Environment Variables

Public-safe:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_PAYLOAD_PUBLIC_URL` only if safe public URL is needed

Server-only:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PAYLOAD_INTERNAL_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`
- `RESEND_API_KEY`
- `QUOTE_NOTIFICATION_RECIPIENTS`
- `GOOGLE_MAPS_EMBED_ALLOWED_ORIGIN` or equivalent config
- `OPENAI_API_KEY`
- `REVALIDATION_SECRET`

## Release Checks

Before production deployment:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For changed browser-visible or admin flows, run Browser MCP journey checks first and record visible pass/fail evidence, screenshots/snapshots when useful, and console/network notes when relevant. Use `pnpm test:e2e` only as Playwright backup when Browser MCP cannot cover the scenario or a deterministic CI/headless regression script is required.

## Monitoring

Production must monitor:

- Public site uptime and response time.
- Payload app health endpoint.
- Error rates for quote submission.
- Resend notification failures.
- Cloudinary upload failures.
- OpenAI AI-assistant errors and spend alerts when AI is enabled.

The release cannot claim NFR-02 complete until monitoring tool, alert channel, and owner are documented.
