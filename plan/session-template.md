# Execution Session Template

Future AI agents must use this template to append new entries to the bottom of `plan/execution-log.md` after every work session.

Copy the block below, replace the placeholder text in angle brackets (`<...>`), and append it to the log file.

---

```markdown
## [<YYYY-MM-DD>T<HH:MM:SS>+07:00] - Session <XX>: <Brief Title of Work Done>

- **Agent ID**: <e.g., Gemini-2.5-Pro, Antigravity, etc.>
- **Phase**: <e.g., Phase 01: Foundation>
- **Tasks Attempted**:
  - <Task 1 from phase checklist>
  - <Task 2 from phase checklist>
- **Files Created**:
  - `<file_path_1>`
- **Files Modified**:
  - `<file_path_2>`
- **Files Deleted**:
  - `<file_path_3>`
- **Tests/Checks Run**:
  - `<Command run, e.g., pnpm test or docker compose run app pnpm test>`
- **Result**: <SUCCESS / FAILED / BLOCKED> - <Brief summary of outcomes and verification status>
- **Encountered Blockers**: <Detail any blockers encountered, or "None" if none>
- **Next Action**: <Pointer to next task to be executed, referencing phase folder and task ID>
```
