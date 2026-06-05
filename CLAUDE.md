# CLAUDE.md

Follow `AGENTS.md`.

This repository is documentation-governed. Before coding, read the required docs listed in `AGENTS.md`, keep work to one vertical slice, state requirement IDs, add tests, run verification, and update `docs/specs/traceability-matrix.md`.

Current architecture decisions:

- Next.js 15 frontend.
- Payload CMS admin/backend.
- Managed PostgreSQL database.
- Cloudinary media.
- next-intl Vietnamese/English.
- Resend, Google Maps Embed, and OpenAI through server-side boundaries.

Do not add cart, payment, order management, order tracking, or mobile app scope.
