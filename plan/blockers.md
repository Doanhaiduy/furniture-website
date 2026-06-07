# Blocker Log & Clarifications

This file tracks all active blockers, unresolved questions, architectural ambiguities, or critical decisions requiring human input.

If a task is blocked, the agent must document it here, mark the status as `blocked` in `execution-status.md`, and stop execution.

---

## 1. Active Blockers

*There are currently no active blockers. The planning phase audits are fully reconciled.*

---

## 2. Unresolved Questions & Human Input Needed

*No outstanding questions at this time.*

---

## 3. Resolved Blockers & Decisions History

### Resolved on June 7, 2026

- **Gemini Key Storage Mechanism**:
  - *Context*: Deciding between Supabase Vault and a custom `integration_secrets` table.
  - *Decision*: A custom `integration_secrets` table with Admin-only RLS and AES-GCM-256 server-side encryption via a server-only environment key `AI_SECRET_ENCRYPTION_KEY`.
- **Quote Form Rate Limiting**:
  - *Context*: Deciding between Upstash Redis and local container memory rate limiting.
  - *Decision*: Container-local, in-memory sliding-window throttling. This is sufficient since we will run in a containerized environment and do not need distributed state.
- **Docker Local Runtime**:
  - *Context*: Determining if local development should use Docker.
  - *Decision*: Docker compose will run Next.js and mock backend assets locally for clean reproducibility.
