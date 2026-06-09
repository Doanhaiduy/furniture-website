---
name: seo-i18n
description: Implement or review SEO and Vietnamese English i18n behavior for public pages in the furniture and sanitary equipment website using next-intl, localized metadata, slug routes, sitemap, robots, schema, tests, and traceability.
---

# SEO i18n Skill

## Scope

Use this skill for public SEO metadata, localized routes, Vietnamese/English messages, canonical URLs, alternate locale links, sitemap, robots, schema, and slug-based product or article pages.

Primary requirement IDs:

- FR-01 home page
- FR-02 about page
- FR-04 product filters
- FR-05 product search
- FR-06 articles
- FR-08-PUB showrooms
- FR-12-PUB public language switching
- NFR-03 responsive UI
- NFR-06 SEO

## Rules

- Read `AGENTS.md` and all required files in `docs/specs/` before coding.
- State requirement IDs and files to edit before making changes.
- Do not hardcode public UI text outside i18n message files.
- Localize page titles, descriptions, Open Graph fields, structured data, and visible public text.
- Keep product and article pages slug-based.
- Generate or preserve canonical and alternate locale URLs where relevant.
- Use semantic HTML and accessible navigation for language switching.
- Keep locale switching to one clear user action.
- Do not add cart, payment, order, or mobile-app behavior.
- Add tests for routing, metadata helpers, localized messages, or key page behavior.
- Update `docs/specs/traceability-matrix.md`.

## Required Outputs

- Requirement IDs covered.
- Locale files changed.
- Public routes or metadata files changed.
- SEO artifacts changed, such as sitemap, robots, schema, canonical, or hreflang.
- Tests added or updated.
- Manual SEO or responsive checks performed.
- Traceability matrix update.
- Verification command results and any skipped checks with reasons.

## Verification Commands

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If localized browser journeys or public navigation changed, run Browser MCP checks first for the affected routes, locale switching, visible metadata-related behavior, sitemap/robots visibility, and responsive state.

Use Playwright only as backup when Browser MCP cannot cover the scenario or a deterministic CI/headless route regression is required:

```bash
pnpm test:e2e
```
