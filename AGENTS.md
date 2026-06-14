* [ ] AGENTS.md

## Project Overview

Showroom Ná»™i Tháº¥t PhÆ°Æ¡ng ÄÃ´ng: A bilingual (Vietnamese/English) corporate business website for a furniture and sanitary equipment showroom.

The website showcases products, blog posts, showroom locations, company values, and provides a contact quote request form to capture potential customer leads. It includes an Admin CMS for content management, role-based controls, audit trails, and Google Gemini-powered content/SEO/translation assistants.

### Primary Project Scope

- Public website for marketing and lead generation.
- Custom Admin CMS supporting role management (Role Model Option A).
- Google Gemini API for draft-only content generation.
- Lead capture via quote forms.

### Out of Scope

- No cart, checkout, or online payments.
- No order tracking or inventory management.
- No mobile applications.

---

## Technical Stack

- **Frontend & Admin**: Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS v4, shadcn/ui.
- **Backend & Database**: Supabase-first architecture. All persistence through Supabase PostgreSQL, RLS policies, and RPC functions.
- **Media Storage**: Cloudinary signed uploads and optimized CDN delivery.
- **Email**: Resend HTML templates for quote notifications.
- **Localization**: next-intl v4 (`vi` and `en` locales, default `vi`).
- **AI Integration**: Google Gemini API via server-only decryption helpers.
- **Spam & Rate Limiting**: Honeypot inputs + container-local in-memory sliding-window rate limiting on `/api/contact`.
- **Testing**: Vitest for unit/integration tests; Browser MCP as the default for browser-visible user-flow validation, automation, debugging, exploratory testing, screenshots, and responsive checks. Playwright is backup only when Browser MCP cannot cover the scenario, or when CI/headless/deterministic scripts are explicitly required.
- **Local Environment**: Docker & Docker Compose container runtime.

---

## Planning Source of Truth

The absolute source-of-truth for planning and execution boundaries is the `plan/` folder:

- **Project Context**: `plan/00-project-context.md`
- **Master Roadmap**: `plan/01-master-roadmap.md`
- **Plan Specs**: `plan/ai-gemini-integration-plan.md`, `plan/gemini-secret-storage-spec.md`, `plan/rate-limit-runtime-notes.md`
- **Orchestration Spec**: `plan/agent-orchestrator.md`
- **Mode Controls**: `plan/agent-modes.md`
- **Confirmation Rules**: `plan/confirmation-protocol.md`
- **Current Execution Status**: `plan/execution-status.md`
- **Execution Log**: `plan/execution-log.md`
- **Active Blockers**: `plan/blockers.md`
- **Current Execution Pointer**: `plan/99-next-action.md`
- **Phase Directories**: `plan/phases/` (Phase 01 through Phase 10)

Future AI coding agents must read and follow this planning context to guide their execution.

---

## Execution Workflow Rules

### Required Read Order Before Coding

Every time an execution agent starts a task, it must read these files in the following order:

1. `AGENTS.md` (This file - project rules)
2. `plan/README.md` (Overview of plan structure and orchestrator system)
3. `plan/execution-status.md` (Current execution states)
4. `plan/99-next-action.md` (The next recommended step)
5. `plan/blockers.md` (Check for active blocker entries)
6. The specific phase folder (e.g. `plan/phases/phase-01-foundation/`) containing goals, checklist, dependencies, and testing.

### Review-before-Execute Rule

To prevent context drift and ensure human alignment, agents must operate in two distinct modes:

1. **REVIEW MODE (Mode 1)**: Scan the workspace, check status boards, identify the earliest incomplete phase/tasks, and write a detailed Vietnamese implementation proposal in the chat. **Do not modify any codebase files or run migrations during this phase.** Ask the user for explicit confirmation.
2. **EXECUTION MODE (Mode 2)**: If and only if the user explicitly answers `confirm`, perform the proposed implementation, run verification tests, update status boards/checklists, and write a Vietnamese completion summary.
   - If the user answers `káº¿t thÃºc`, stop without implementing. Summarize the status in Vietnamese and exit cleanly.

### Vietnamese User-Facing Summary Requirement

All user-facing communication in the chat must be written in **Vietnamese**.

- In **Review Mode**, the response must follow [plan/review-output-template.md](file:///d:/THCode/AI/furniture-website/plan/review-output-template.md) containing:
  - `TÃ¬nh tráº¡ng hiá»‡n táº¡i`
  - `Phase Ä‘á» xuáº¥t tiáº¿p theo`
  - `Viá»‡c sáº½ triá»ƒn khai`
  - `Kiá»ƒm tra / test dá»± kiáº¿n`
  - `Lá»±a chá»n` (confirm / káº¿t thÃºc)
- In **Execution Mode**, the response must follow [plan/execution-output-template.md](file:///d:/THCode/AI/furniture-website/plan/execution-output-template.md) containing:
  - `ÄÃ£ triá»ƒn khai`
  - `File Ä‘Ã£ cáº­p nháº­t`
  - `Checklist Ä‘Ã£ hoÃ n táº¥t`
  - `Káº¿t quáº£ kiá»ƒm tra`
  - `BÆ°á»›c tiáº¿p theo`

### Task Selection Logic

- Always execute tasks from the earliest incomplete phase.
- Do not proceed to the next phase until the current phase's definition of done is satisfied.
- Within a phase, prioritize foundational database schema/RLS and API connection tasks before coding frontend interfaces.
- If a phase is blocked, record the block in `plan/blockers.md` and stop. Do not jump ahead or start parallel tasks unless explicitly allowed.

### Required Update/Logging Behavior After Coding

Following every coding session, the agent must update:

1. The checklist inside the active phase folder (marking completed items).
2. `plan/execution-status.md` (updating phase statuses, timestamp, last completed task, and next step).
3. `plan/execution-log.md` (appending a chronological log record detailing files changed, tests run, and next action).
4. `plan/99-next-action.md` (detailing the next concrete step).
5. `plan/blockers.md` (if any unresolved decisions or human clarifications arise).

### Commit & Checkpoint Recommendations

- Commit changes to Git frequently: make atomic commits for each finished checklist item (e.g. `git commit -m "feat(auth): add middleware route guards"`).
- Run linting, typechecking, and test runs before making commits.

---

## Security, Credentials, & Role Restrictions

### Role Model Option A Rules

- **Editor Role**: Can CRUD publishable content only (`products`, `categories`, `blog_posts`, `showrooms`, `media`).
- **Admin Role**: Full access. Only admins can view quote requests, manage users, modify site configurations, and manage Gemini secrets.
- Editors must be denied access to quotes, users, and privileged setting/API routes at both the UI layer (menu options) and server-side layers (Next.js middleware, Server Actions, RLS database rules).

### Secrets Handling

- Raw credentials (`CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_SECRET_ENCRYPTION_KEY`) must never be hardcoded, exposed in client bundles, or prefix-exposed (e.g. using `NEXT_PUBLIC_`).
- Gemini API keys are encrypted at rest using AES-GCM-256 via a server-only encryption key. GET endpoints return only masked parameters (e.g. `****5678`).

---

## Testing Expectations & Verification Commands

### Local Testing Command Suite

Run before completing any task:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Browser MCP User-Flow Testing

Use Browser MCP first if layout, page routing, auth redirects, translation switches, form validations, rate limits, SEO-visible routes, or responsive behavior are affected:

- Open the affected route in the real browser.
- Inspect the current visible state before acting.
- Perform the user journey in natural language steps.
- Verify the expected visible state, URL/state changes, role access, persisted data, and safe error handling.
- Capture screenshot/snapshot evidence when useful.
- Check console/network logs only when they help explain unexpected behavior.

Use Playwright only as backup:

```bash
pnpm test:e2e
```

Playwright backup is appropriate when Browser MCP cannot support the scenario, or when CI/headless/deterministic regression is explicitly required.

### Docker Verification

Ensure the application runs cleanly inside the Docker container:

```bash
docker compose up app -d
curl http://localhost:3000/api/health
```

---

## When to Stop & Ask for Help

Stop execution and request human clarification if:

- Database RLS policies prevent the authenticated test user from executing necessary queries.
- Cloudinary, Resend, or Gemini service keys are missing or invalid, preventing service validations.
- You encounter conflicting requirements between the SRS Excel sheet and planning documentation.
- You identify security flaws (such as client-side auth bypasses or secret exposure risks).
- The current phase has active, unresolved blockers in `plan/blockers.md`.

---

## Agent Integration (Codex & Claude Code)

### For Codex-style AI Agents:

- Codex-style agents read `AGENTS.md` and files in `plan/` as plain text documentation.
- You must strictly respect the Review-before-Execute boundary. Present your proposal in Vietnamese and wait for the user to explicitly write `confirm` before performing any write/implement actions.

### For Claude Code / local CLI agents:

- Claude Code can trigger local skills defined in `.claude/skills/`.
- Ensure all skills in `.claude/skills/` are loaded and execute in compliance with the status checking and execution workflows.
