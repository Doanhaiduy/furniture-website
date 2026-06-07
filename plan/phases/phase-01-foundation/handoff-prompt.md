# Phase 01 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-01-foundation/` before commencing work. Execute only the scope defined for Phase 01. Do not begin integrating dynamic data into public pages, writing auth guards, or writing CRUD screens.
2. **Context Alignment**: Align your implementation with Next.js 16.2.6, React 19.2.4, Tailwind CSS v4, and the Supabase migrations schema.
3. **Execution Instructions**:
   - Create Docker support in the workspace.
   - Setup Supabase server and client wrappers using `@supabase/ssr`.
   - Setup environment variable verification.
   - Implement the `integration_secrets` settings table migration.
4. **Verifications**:
   - Run the full validation commands:
     ```bash
     docker compose up app -d
     curl http://localhost:3000/api/health
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
5. **Marking Complete**: Ensure all check items in `checklist.md` are marked complete, and document your changes inside `docs/specs/traceability-matrix.md` before concluding. Do not start Phase 02 or Phase 03 until this foundation is validated.

## Key Rules
- **No Client Secrets**: The `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, and `GEMINI_API_KEY` must never be exposed to browser bundles or prefix-exposed (e.g. `NEXT_PUBLIC_`).
- **Encrypted Storage**: The Gemini API key must be encrypted at rest inside the database using AES-GCM-256 with a server-side `AI_SECRET_ENCRYPTION_KEY`.
- **Docker Mounts**: The Docker Compose mounts must enable hot-reloading for development but exclude `node_modules` and `.next` from synchronization.
