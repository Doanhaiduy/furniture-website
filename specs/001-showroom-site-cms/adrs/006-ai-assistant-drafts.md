# ADR-006: Draft-Only AI Assistant

## Status

Accepted

## Date

2026-05-31

## Context

The CMS must support AI-generated product descriptions, SEO metadata, and vi/en
translation. The clarification phase resolved that AI output must not auto-publish.

## Decision

Use OpenAI through Payload CMS custom field hooks or admin actions to generate
editable draft suggestions. AI output can be accepted, edited, discarded, or saved as a
draft by a CMS user, but it cannot auto-publish public content.

## Rationale

- Human review protects brand voice and translation quality.
- Draft-only behavior reduces accidental publication and security risk.
- Keeping AI calls in the CMS service keeps API keys server-only.

## Alternatives Considered

- **Auto-publish AI output**: rejected due to editorial and brand risk.
- **Public chatbot**: rejected because the requirement is CMS content assistance.
- **No AI in CMS**: rejected because AI assistance is explicitly in scope.

## Consequences

- Prompt inputs and outputs must be validated and scoped to CMS content.
- AI errors must return user-actionable messages without exposing secrets.
- Tests must verify generated content remains draft-only until reviewed.
