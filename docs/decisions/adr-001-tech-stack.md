# ADR-001: Tech Stack

## Status

Accepted

## Date

2026-06-01

## Context

The project is a bilingual showroom marketing and catalog website with lead capture and an Admin CMS. It excludes cart, payment, order management, and mobile app scope.

Earlier docs referenced Supabase Auth and Supabase Storage. The official architecture baseline now standardizes Payload CMS, managed PostgreSQL, and Cloudinary.

## Decision

Use:

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- CMS/admin backend: Payload CMS 3.x.
- Database: managed PostgreSQL through Payload's PostgreSQL adapter.
- Media: Cloudinary.
- i18n: next-intl.
- Forms/validation: Zod and React Hook Form.
- Email: Resend.
- Maps: Google Maps Embed.
- AI in CMS: OpenAI for draft-only content/SEO assistance.
- Testing: Vitest and Playwright.
- Deployment: Vercel frontend, separate Payload app/runtime, managed PostgreSQL.

## Rationale

- Next.js App Router fits localized public pages, metadata, sitemap, robots, and server-side BFF boundaries.
- Payload CMS provides admin UI, authentication, access controls, collections, globals, hooks, drafts, and editorial workflows.
- PostgreSQL is a durable relational backend for Payload and quote lead data.
- Cloudinary is purpose-built for media upload, transformations, responsive delivery, and CDN behavior.
- Resend, Google Maps Embed, and OpenAI cover required external capabilities without adding custom infrastructure.

## Consequences

- Admin/CMS behavior should be implemented in Payload first, not as a custom Next.js CRUD dashboard unless a slice explicitly needs a thin admin bridge.
- Browser code must not receive database credentials, Payload secrets, Cloudinary signing secrets, Resend keys, or OpenAI keys.
- Existing package drift remains an implementation precondition: current dependencies must be aligned to Next.js 15 and Payload CMS 3.x before feature coding.
- Supabase-specific Auth/Storage/RLS docs and skills are superseded by Payload access control, PostgreSQL, and Cloudinary guidance.

## Alternatives Considered

- Supabase Auth/Storage with custom CMS: rejected because the approved CMS/admin backend is Payload CMS and media is Cloudinary.
- Static site only: rejected because CMS, quote capture, admin roles, and dynamic catalog filtering are required.
- Ecommerce platform: rejected because ecommerce is explicitly out of scope.
- Third-party hosted CMS SaaS: rejected for launch because Payload CMS is the selected admin/backend model.
