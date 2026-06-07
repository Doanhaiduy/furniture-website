# Architecture Decisions

This document details the key technical architecture decisions for the Showroom Nội Thất Phương Đông website.

---

## AD-001: Supabase-First Execution is Binding
- **Status**: Accepted
- **Context**: Evaluated Supabase database schemas and `@supabase/supabase-js` dependencies.
- **Decision**: The custom `/admin` panel and public pages will connect directly to Supabase Auth and database tables, rather than installing Payload CMS or other database engines.
- **Consequences**: Relational joins, RLS policies, and RPC handlers are the standard queries strategy.

---

## AD-002: Next.js Root `app/` Directory
- **Status**: Accepted
- **Context**: The existing prototype code exists in the root folders.
- **Decision**: Retain the existing root directory layout. Do not migrate code to a `src/` directory.

---

## AD-003: Docker/Docker Compose Runtime
- **Status**: Accepted
- **Context**: Requires reproducible development setups.
- **Decision**: Implement a local container runtime using Docker Compose. The Next.js dev server runs in Docker, linking with host ports or remote databases.

---

## AD-004: Gemini API as the AI Provider
- **Status**: Accepted
- **Context**: Needs dynamic text outlines and translations.
- **Decision**: Google Gemini API is our only AI integration provider for launch.
- **Consequences**: Connect using `@google/generative-ai` server-side client library.

---

## AD-005: Gemini Secrets Custom Table Storage
- **Status**: Accepted
- **Context**: Confirmed by user choices.
- **Decision**: Gemini API keys and settings will be stored in a custom `integration_secrets` table (not Supabase Vault or environment-only variables).
- **Consequences**:
  - Keys are encrypted using AES-GCM-256 with a server-side `AI_SECRET_ENCRYPTION_KEY`.
  - Keys are masked in all JSON outputs.
  - Access is restricted to `admin` roles via RLS policies and middleware check gates.
  - Rotation events are written to `audit_logs`.

---

## AD-006: Role Model Option A
- **Status**: Accepted
- **Context**: Requires distinct admin capabilities.
- **Decision**: Implement two roles:
  - `editor`: Publishable content (products, categories, blogs, showrooms, media).
  - `admin`: Users, settings, quote requests, media governance, integrations, Gemini settings.
- **Consequences**: Middleware, server-side actions, and database RLS must reject Editor access to Admin-only resources.

---

## AD-007: Cloudinary and Resend Integrations
- **Status**: Accepted
- **Context**: Requires rich media and mail dispatches.
- **Decision**:
  - Cloudinary handles all media uploads and CDN optimizations.
  - Resend handles HTML formatted notifications.
