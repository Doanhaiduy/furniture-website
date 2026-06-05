# ADR-001: Application And Deployment Topology

## Status

Accepted

## Date

2026-05-31

## Context

The product needs fast public localized pages and a capable CMS admin surface. The
approved stack includes Next.js 15 App Router, Payload CMS 3.x, managed PostgreSQL,
Cloudinary, Vercel, and a self-hosted Payload runtime.

## Decision

Deploy the public frontend as a Next.js 15 application on Vercel. Deploy Payload CMS
3.x as a separate self-hosted service on Railway or Render. Keep both in the same repo
and share contracts, types, environment conventions, and traceability.

## Rationale

- Public routes need optimized rendering, metadata, sitemap, robots, and localized
  routing.
- Payload CMS needs admin UI, REST/GraphQL APIs, hooks, collection access control, and
  upload/AI/email integrations.
- Separate deployments reduce runtime coupling while preserving one source of truth.

## Alternatives Considered

- **Single Next.js monolith**: simpler deployment, but weaker separation for Payload
  admin/API runtime concerns.
- **Third-party hosted CMS**: adds vendor coupling and conflicts with self-hosted
  Payload decision.
- **Separate repositories**: increases coordination cost and weakens traceability.

## Consequences

- Environment variables must be split by runtime and kept server-only where sensitive.
- CI/CD must deploy both Vercel frontend and Payload service.
- Public frontend must tolerate CMS/API downtime with safe error states and cache where
  appropriate.
