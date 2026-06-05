\---

name: nextjs-feature-slice

description: Implement one small Next.js feature slice from docs/specs/tasks.md with TypeScript, Tailwind, shadcn/ui, validation, tests, and traceability.

\---



\# Next.js Feature Slice Skill



Use this skill when implementing one task from docs/specs/tasks.md.



\## Rules



\- Implement only one task at a time.

\- Read AGENTS.md first.

\- Read requirements.md, design.md, data-model.md, tasks.md.

\- State requirement IDs before coding.

\- List files to edit before editing.

\- Do not modify unrelated modules.

\- Add or update tests.

\- Update traceability matrix.



\## Verification



Run:



```bash

pnpm lint

pnpm typecheck

pnpm test

pnpm build

````



If E2E is affected, run:



```bash

pnpm test:e2e

```



\## Done Criteria



\* Acceptance criteria met

\* Tests pass

\* No TypeScript errors

\* No production mock data

\* i18n considered

\* SEO considered for public pages



