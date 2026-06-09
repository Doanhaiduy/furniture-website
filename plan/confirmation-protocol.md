# Confirmation Protocol Specification

This document defines the strict protocol for transitioning the Plan Orchestrator Agent from Mode 1 (REVIEW) to Mode 2 (EXECUTION) using `plan/pending-approval.md` as the gatekeeper.

---

## 1. Actionable Options and Inputs
Upon completing the REVIEW scan, the agent must present exactly two options in Vietnamese:
- **`confirm`**: Triggers transition to Mode 2. The agent sets `status` to `confirmed` in `plan/pending-approval.md` and begins implementation.
- **`kết thúc`**: Triggers transition to the END state. The agent sets `status` to `cancelled` in `plan/pending-approval.md` and halts.

No other input triggers execution. If the user replies with questions or instructions, the agent must remain in REVIEW mode and provide a new proposal or clarification.

---

## 2. Validation of the State Bridge (`pending-approval.md`)
To prevent accidental file changes:
1. **REVIEW Mode Output**: The agent writes the proposed scope to `plan/pending-approval.md` and sets its status to `pending`.
2. **EXECUTION Mode Trigger**: The user must explicitly send `confirm` or use the copy-paste prompt `plan/run-orchestrator-execute-prompt.md`.
3. **Execution Guard Check**:
   - The executor skill loads `plan/pending-approval.md`.
   - If the status is **not** `confirmed`, the executor halts and outputs:
     `[ERROR] Trạng thái phê duyệt (status) trong plan/pending-approval.md không phải là 'confirmed'. Từ chối thực thi.`
   - If the status is `confirmed`, the agent proceeds to implement only the tasks listed under `selected_tasks`.

---

## 3. Case Matching Rules
- Case-insensitive string matching.
- Trim leading/trailing whitespace.
- Reject multi-clause commands (e.g. `confirm and add test`) as confirmation; these require a fresh REVIEW proposal.
