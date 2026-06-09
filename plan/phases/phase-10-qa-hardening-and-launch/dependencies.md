# Phase 10 Dependencies – QA Hardening & Launch Preparation

## Upstream Prerequisites
- **Phases 01-09 Complete**: All functional features, migrations, seed routines, auth configurations, and third-party integrations must be active.
- **Production Environment Profile**: Target deployment configurations and server configurations must be finalized.

## Required Services / Configuration / Auth State
- **Staging / Preview Environment**: A test deployment environment (or a local Docker Compose production environment) is required for Browser MCP launch journeys and any backup regression scripts.
- **Testing Credentials**: Seeded active user profiles (`admin` and `editor`) are required for Browser MCP role/access validation and any Playwright backup scripts.
- **Audit Tools**: PageSpeed Insights / Lighthouse tools, axe-core scanners, and security validation utilities must be available in development setups.

## Blockers
- **Failing Core Tests**: Any failing unit or integration tests from previous phases will block launch activities.
- **Critical Security Gaps**: Unprotected database tables or leaked secrets will halt launch operations until they are resolved.

## Parallelization and Constraints
- **Parallel Work**:
  - Writing the operations runbook (backups, monitoring guides) can be done in parallel with accessibility improvements.
  - Testing cross-browser layout support on different platforms can proceed alongside performance optimizations.
- **Sequential Constraints**:
  - Final performance benchmarks must be run only after all image optimizations and code minifications are applied.
  - The final launch checklist verification must be performed as the absolute last step prior to deployment.
