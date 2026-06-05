# ADR-004: Role Access Control

## Status

Accepted

## Date

2026-06-01

## Context

The official baseline requires Role Model Option A:

- Editor manages publishable content only.
- Admin manages users, settings, quote requests, and all content.

## Decision

Implement two CMS roles in Payload:

- `admin`
- `editor`

Payload collection/global access controls enforce permissions server-side. Any Next.js route handler or BFF action that touches protected data must repeat or delegate to the same server-side checks.

## Permission Matrix

| Capability | Editor | Admin |
| --- | --- | --- |
| Products/categories | Manage publishable content | Full |
| Blog/categories | Manage publishable content | Full |
| Homepage/about content | Manage publishable content fields | Full |
| Showrooms | Manage publishable content | Full |
| Media for publishable content | Upload/use | Full |
| Quote requests | No access | Full |
| Users/roles | No access | Full |
| Privileged settings/integrations | No access | Full |
| AI drafts | Eligible publishable content only | Eligible content plus admin-scoped controls |

## Consequences

- Editors cannot view or manage quote requests.
- User and settings screens must be hidden in UI and blocked at API/access-rule level.
- Tests must verify denied Editor access, not just hidden navigation.
- Future roles require a new ADR or amendment.
