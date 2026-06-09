# Agent Modes & State Transitions

This document defines the behavior of the Plan Orchestrator Agent under each operating mode and the rules governing transitions between states, utilizing `plan/pending-approval.md` as the state container.

---

## 1. Mode Definitions

### Mode 1: REVIEW
- **Purpose**: Assess workspace health, inspect plan trackers, choose the next safe task, and compile the proposal.
- **Allowed Actions**:
  - Read-only file inspections (code, tests, config, logs).
  - Write **only** to `plan/pending-approval.md` to record the proposed task scope, settings, and expected tests. Set `status` to `pending`.
- **Prohibited Actions**:
  - Writing or editing source code files, configurations, or database migrations.
  - Resetting databases or executing modifying tests.
- **Trigger**: Prompted via `plan/run-orchestrator-review-prompt.md`.
- **Exit State**: Outputs the Vietnamese proposal, sets `plan/pending-approval.md` to `pending`, and halts.

---

### Mode 2: EXECUTION
- **Purpose**: Implement the proposed scope, run validation tests, and update project trackers on disk.
- **Allowed Actions**:
  - Modifying codebase files, configuration assets, and migrations.
  - Writing to checklists (`checklist.md`), `execution-status.md`, `execution-log.md`, `blockers.md`, and `99-next-action.md`.
  - Updating `plan/pending-approval.md` to `completed` upon success, or `cancelled` upon blocker failure.
- **Prohibited Actions**:
  - Implementing tasks not listed in the approved `plan/pending-approval.md` scope.
- **Trigger**: The user inputs `confirm` (or paste `plan/run-orchestrator-execute-prompt.md`), which changes `status` to `confirmed` in `plan/pending-approval.md`.
- **Exit State**: Synchronizes progress, sets bridge to `completed`, outputs the Vietnamese summary, and halts.

---

### State: END
- **Purpose**: Terminate the session cleanly when the user rejects the proposal.
- **Allowed Actions**:
  - Outputting the Vietnamese resumption guide.
  - Updating `plan/pending-approval.md` status to `cancelled`.
- **Trigger**: The user inputs `kết thúc`.
- **Exit State**: Clean exit.

---

## 2. Transition Guard Rules

- **Guard 1 (Status Flag Check)**: Prior to starting any code implementation, the agent must check that `plan/pending-approval.md` exists and that its `status` is exactly `confirmed`.
- **Guard 2 (Match Verification)**: The agent must verify that the tasks listed in `pending-approval.md` match the target phase checklist.
- **Guard 3 (Cancellation on Interruption)**: If a blocker is encountered during EXECUTION, the agent must write the details to `plan/blockers.md` and update `plan/pending-approval.md` status to `cancelled`.
- **Guard 4 (Bypassing Execution)**: If the user inputs `kết thúc`, the agent immediately transitions to the END state, writes `cancelled` to `plan/pending-approval.md`, and exits.
