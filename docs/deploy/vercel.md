# Vercel Frontend Deployment

This document covers the current Next.js frontend deployment for Showroom Noi That Phuong Dong.

## Scope

- Deploys the public Next.js frontend and the current prototype admin routes.
- Uses Vercel as the frontend host.
- Does not deploy Payload CMS, PostgreSQL, Cloudinary upload processing, Resend delivery, or OpenAI server actions. Those remain separate service slices.

## Project Settings

Use these settings when importing the repository into Vercel:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Development Command | `pnpm dev` |
| Output Directory | Leave empty / Vercel default |
| Node.js Version | 22.x |
| Package Manager | pnpm 11.5.0 |

These values are also encoded in `vercel.json` and `package.json`.

## Required Environment Variables

Current frontend build:

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production and Preview | Set to the deployed site URL. Used by sitemap and robots. |

Optional public variable:

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_PAYLOAD_PUBLIC_URL` | Production and Preview | Only set when the public CMS URL is safe to expose in browser code. |

Do not add server-only secrets with a `NEXT_PUBLIC_` prefix.

Future backend/API variables are listed in `.env.example` and `docs/architecture/deployment.md`, but the current frontend build does not require them.

## Dashboard Deployment

1. Push the repository to GitHub.
2. In Vercel, create a new project from the repository.
3. Confirm the project settings above.
4. Add `NEXT_PUBLIC_SITE_URL`.
5. Deploy the Preview build.
6. Open `/vi`, `/vi/products`, `/vi/blog`, `/vi/contact`, and `/admin` for smoke checks.
7. Promote to Production after checks pass.

## CLI Deployment

Use CLI deployment only after logging into the correct Vercel team:

```bash
vercel link
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL preview
vercel deploy
vercel deploy --prod
```

## Pre-Deploy Checks

Run before promoting a production deployment:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e --project=chromium
```

## pnpm 11 Build Script Approval

Vercel uses `pnpm install --frozen-lockfile` during deployment. With pnpm 11,
dependency install scripts must be reviewed through `allowBuilds` in
`pnpm-workspace.yaml`; older `ignoredBuiltDependencies` settings are no longer
valid for this project.

The current approved/disallowed list is intentionally explicit:

- Allowed: `@parcel/watcher`, `@swc/core`, `sharp`, `unrs-resolver`.
- Disallowed: `msw`.

If a future dependency update adds a new package with install scripts, Vercel may
fail at install time with `ERR_PNPM_IGNORED_BUILDS`. Review the package, then add
it to `allowBuilds` as `true` or `false`.

## Current Limitations

- Contact API currently validates and returns a demo success response; real persistence and Resend notification are not wired yet.
- Payload CMS deployment is separate from Vercel frontend deployment.
- Production monitoring and alert ownership are still required before claiming availability coverage complete.
