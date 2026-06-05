# Admin UI Handoff

## Overview

This package documents a targeted admin UI stabilization pass. The admin structure, routes, and visual direction were preserved; the work focused on behavior, interaction states, background stability, and review-ready exports.

Requirement coverage: FR-03, FR-06, FR-07-ADM, FR-08-ADM, FR-10, FR-11, FR-12-ADM, NFR-03, NFR-07.

## What Was Fixed

- Restored dynamic /admin/[section] routes so products, blog, showrooms, media, quotes, users, settings, and AI assistant render inside the admin shell.
- Reworked admin date selection into shared state across dashboard chart and right utility rail.
- Calendar triggers expose open state via aria-expanded/data-state and render a real Radix popover dialog in a portal above the shell.
- Selected calendar days use aria-selected and visible dark selected styling; selected chart and rail date buttons use aria-pressed.
- Removed fragile closed-popover animation classes that could leave calendar UI half-visible during screenshots/interactions.
- Fixed admin background layering so the fixed background sits behind the full admin shell and is not hidden by the root shell wrapper.
- Added consistent admin open/selected/focus state styling for buttons, tabs, select triggers, and calendar controls.
- Added small accessibility polish for publish confirmation and editor toolbar controls.

## Interaction Notes

- Calendar: click a date to update chart trigger, selected chart day, right-rail date, weekday control, and selected work link together.
- Calendar close: Escape, outside click, Today, Open work, and date selection all close the popover.
- Selects: admin tone uses white portal content, selected option checkmarks, and purple open/focus ring.
- Sidebar/header: collapse controls keep aria-pressed and retain sticky behavior.
- Editor tabs/toolbars: selected/active state is visible and reflected with aria-selected or aria-pressed.
- Fixed background: desktop uses fixed pseudo-elements behind shell; mobile/reduced-motion contexts fall back to non-fixed/absolute behavior.

## Admin Behavior Notes

- This remains a frontend/admin prototype and does not add Payload backend persistence or server-side RBAC.
- Editor/Admin role model notes remain visible in the UI; production enforcement still belongs to the Payload backend slice.
- AI assistant remains draft-only UI behavior and does not call OpenAI in this slice.
- No cart, payment, order management, order tracking, or mobile-app behavior was introduced.

## File / Component Map

- `app/admin/[section]/page.tsx`
- `components/showroom/admin-dashboard-widgets.tsx`
- `components/showroom/admin-shell.tsx`
- `components/showroom/admin-interactions.tsx`
- `app/globals.css`
- `tests/e2e/public-admin.spec.ts`
- `docs/specs/traceability-matrix.md`

## Verification Summary

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 2 files, 8 tests.
- `pnpm build` passed and shows `/admin/[section]` as a dynamic route.
- `pnpm test:e2e --project=chromium` passed: 8 tests.
- `pnpm test:e2e` passed: 24 tests across Chromium, Firefox, and WebKit.

## Export Contents

See `review-board.html` for stakeholder review, JSON files for implementation/design mapping, and `figma-ready/` for Figma reconstruction assets.
