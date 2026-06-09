# Phase 07 Handoff Prompt

## Instructions for Executing Agent
1. **Scope Boundary**: Read all files in `plan/phases/phase-07-media-and-third-party-services/` before commencing work. Execute only the scope defined for Phase 07. Do not perform launch data migration, or write settings/users CRUD flows.
2. **Context Alignment**: Integrate signed Cloudinary uploads, HTML Resend email templates, Google Maps validation filters, and server-side Gemini AI draft queries.
3. **Execution Instructions**:
   - Create Cloudinary client helper `lib/cloudinary/client.ts` and signed upload handler API route.
   - Build Maps renderer `components/public/GoogleMap.tsx` with fallback verification.
   - Update Resend triggers to compile HTML layouts inside `lib/email/templates/`.
   - Setup Gemini provider client `lib/ai/gemini.ts` reading config parameters.
   - Save generated drafts inside `ai_drafts` database table.
4. **Verifications**:
   - Run the full verification checklist:
     ```bash
     pnpm lint
     pnpm typecheck
     pnpm test
     pnpm build
     ```
   - Run Browser MCP journey checks for media upload UI, map rendering/fallbacks, quote email visible states, and Gemini draft UI behavior.
   - Use `pnpm test:e2e` only as Playwright backup for file-upload automation, mocked service CI scripts, or unsupported Browser MCP scenarios.
5. **Marking Complete**: Ensure all tasks in `checklist.md` are marked complete, and record changes inside `docs/specs/traceability-matrix.md`. Do not start Phase 08 until third-party service bounds are verified.

## Key Rules
- **No Secret Exposure**: Credentials (Resend key, Cloudinary secret keys, Gemini keys) must never be loaded in browser files or client components.
- **Strict Editor Denial**: Editor profiles must not be returned raw Gemini config values.
- **Fail-Safe Service Fallback**: AI and email dispatch failures must degrade gracefully, alerting the user without blocking parent transactions.
