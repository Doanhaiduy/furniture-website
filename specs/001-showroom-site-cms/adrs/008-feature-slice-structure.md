# ADR-008: Feature-Sliced `/src` Structure

## Status

Accepted

## Date

2026-05-31

## Context

The user requested a `/src` structure separating public routes, admin/Payload handling,
shared UI, feature slices, utilities, and Payload collections/globals/hooks.

## Decision

Use `src/app`, `src/components`, `src/features`, `src/lib`, `src/payload`, and
`src/messages`. Keep public routes locale-aware, admin entry under an admin route group,
feature-specific domain logic under `src/features`, integration clients under
`src/lib`, and Payload service definitions under `src/payload`.

## Rationale

- Feature slices keep catalog, showrooms, blog, contact, homepage, i18n, SEO, media,
  and auth work independently testable.
- Payload definitions need a clear service-owned area.
- Shared UI remains separate from domain behavior.
- The layout supports future modules without architecture changes.

## Alternatives Considered

- **Root-level App Router only**: rejected because the requested structure is `/src`
  and Payload needs service-specific organization.
- **Flat component folders only**: rejected because domain, CMS, routes, and clients
  would be mixed.
- **Multiple repositories**: rejected for now because shared contracts and traceability
  are easier in one repository.

## Consequences

- Existing root-level `app/` code must be migrated or replaced carefully during
  implementation.
- Tests should mirror feature slices where practical.
- New modules should follow the same app/features/lib/payload separation.
