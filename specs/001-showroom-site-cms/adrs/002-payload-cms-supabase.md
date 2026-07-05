# ADR-002: Payload CMS With managed PostgreSQL

## Status

Accepted

## Date

2026-05-31

## Context

The Admin CMS must manage bilingual products, blog posts, showrooms, quote requests,
users/roles, media, homepage content, and AI-assisted drafts. The constitution approves
Payload CMS 3.x and managed PostgreSQL.

## Decision

Use Payload CMS 3.x with its PostgreSQL adapter connected to managed PostgreSQL.
Payload owns CMS collections, globals, admin UI, REST/GraphQL APIs, access control
hooks, validation hooks, and publication workflows.

## Rationale

- Payload provides built-in admin UI and content modeling.
- managed PostgreSQL provides managed relational persistence.
- Payload access hooks can enforce Admin/Editor behavior near CMS operations.
- REST and GraphQL APIs give the Next.js frontend typed server-side read paths.

## Alternatives Considered

- **Custom database-only CMS**: duplicates admin UI and editorial workflows.
- **Separate CMS SaaS**: adds vendor complexity and conflicts with the requested stack.
- **Flat tables without Payload collections**: weakens editorial management and access
  workflows.

## Consequences

- The plan must define Payload collection schemas and access rules before coding.
- Payload access-control assumptions still need security review for data protection.
- Migration and seed workflows must account for Payload-managed schemas.

