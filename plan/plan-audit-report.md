# Plan Audit Report

## Executive Summary

The existing `plan/` folder was useful as a first pass, but it was not execution-ready. It correctly identified that public/admin UI is already present, that mock data remains, and that Supabase migrations exist. It was still too generic, treated the backend path as undecided, omitted Docker, and retained old AI/provider assumptions.

This repair makes the plan Supabase-first, Docker-aware, and Gemini-specific. It also adds Admin-only Gemini settings, masking, rotation, validation, fallback behavior, audit logging, and explicit RLS/security requirements.

## Overall Quality Assessment Before Repair

| Dimension | Assessment |
| --- | --- |
| Project-specific route awareness | Partial |
| Supabase schema/RLS awareness | Partial |
| Execution order | Mostly reasonable but missing Docker and still treating backend as undecided |
| Admin/Editor security handling | Partial |
| AI provider handling | Incorrect |
| Docker/runtime handling | Missing |
| Handoff readiness | Partial; prompts were too generic |
| Definition of done | Incomplete |

## What Was Accurate

- Public routes under `app/[locale]` were correctly identified.
- Admin prototype under `app/admin` was correctly identified.
- `lib/showroom-data.ts` was correctly identified as the mock data concentration point.
- `/api/contact` was correctly identified as validation-only.
- Supabase migrations through `0009_optional_local_seed.sql` were correctly identified.
- The need to replace public/admin mock reads with database-backed reads was correct.
- Role Model A was included.

## What Was Incomplete

- Docker/Docker Compose local runtime was absent.
- Supabase-first execution was not made binding despite the database audit.
- Current Next.js 16.2.6 runtime was not treated as the actual package state.
- Admin Settings requirements for AI provider secrets were absent.
- Gemini API provider requirements were absent.
- Admin-only Gemini key visibility, masking, rotation, validation, audit logs, and fallback behavior were absent.
- RLS implications for settings, quotes, users, `ai_drafts`, and `audit_logs` were not detailed enough.
- Phase files did not consistently include route mapping, DB/RLS impacts, env needs, rollback/fallback notes, and definition of done.

## What Was Misleading Or Wrong

- The plan framed the main backend decision as still open. The repo and audit evidence support Supabase-first execution.
- AI integration referenced an older provider rather than Gemini.
- The plan did not call out that current Supabase schema lacks a dedicated encrypted Gemini secret storage mechanism.
- The plan implied a replacement-backend direction rather than wiring the existing custom Next.js admin prototype.
- Env planning still carried outdated variables and did not include Supabase/Gemini/Docker needs.

## Key Execution Risks If Followed As-Is

- A future agent could waste time restarting the backend architecture instead of wiring Supabase.
- AI work could be implemented against the wrong provider.
- Gemini secrets could be exposed to Editors or client code.
- Docker support could remain an afterthought, making local onboarding unreliable.
- Admin Settings could accidentally return privileged settings to Editors because RLS/server guards were underspecified.
- Quote, AI, settings, and user mutations could miss audit logging.

## Repair Summary

- Added `architecture-decisions.md`.
- Added `docker-runtime-plan.md`.
- Added `ai-gemini-integration-plan.md`.
- Added `plan-gap-matrix.md`.
- Rewrote top-level roadmap/context/next action.
- Updated all phases to include concrete objectives, scope, impacted files, database/RLS impacts, env needs, testing, acceptance criteria, fallback notes, risks, and phase-specific handoff prompts.
- Updated appendices to reflect Supabase-first and Gemini-specific execution.
