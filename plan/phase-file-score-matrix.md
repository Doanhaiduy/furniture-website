# Phase File Score Matrix

This document provides a quantitative evaluation of all Markdown files in the `plan/phases/` directory prior to our comprehensive rewrites.

## Evaluation Criteria
Each file is scored from 0 to 5 on the following ten criteria:
1. **Accuracy**: Alignment with the actual project state (Next.js 16.2.6, React 19.2.4, Supabase-first backend, Gemini API, Docker).
2. **Mapping**: Direct mapping to actual frontend pages, backend APIs, database tables, and schema components.
3. **Completeness**: Coverage of all relevant aspects (no placeholders or TBD areas).
4. **Specificity**: Use of concrete names, routes, variables, schemas, and queries instead of generic assertions.
5. **Actionability**: Clarity of instructions for an AI coding agent without requiring external context.
6. **Dependencies**: Upstream/downstream mapping, parallelization logic, and blocker mitigation.
7. **Acceptance**: Explicit, measurable, and verified Definition of Done criteria.
8. **Testing**: Detailed unit, integration, E2E, and manual verification instructions with roles, locales, and input/output edge cases.
9. **Security**: RLS awareness, Role Model Option A enforcement (Admin vs. Editor), and secret masking.
10. **Handoff**: Quality of instructions to guide the next AI execution agent.

### Scoring Rubric
- **0–1** = Unusable (generic boilerplate or empty)
- **2** = Poor (vague references, missing project details)
- **3** = Acceptable but weak (some details, but lacks deep specificity)
- **4** = Strong (detailed, actionable, well-mapped)
- **5** = Execution-ready (highly specific, production-grade details)

### Verdict Rules
- **0–19** = Rewrite required (unusable or generic boilerplate)
- **20–29** = Major improvement required (has structure but lacks project-specific depth)
- **30–39** = Acceptable but should improve
- **40–50** = Strong / Execution-ready

---

## Pre-Audit Score Matrix (Baseline)

| Phase | File | Accuracy | Mapping | Completeness | Specificity | Actionability | Dependencies | Acceptance | Testing | Security | Handoff | Total | Verdict |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Phase 01** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 02** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 2 | 3 | **26** | Major improvement required |
| **Phase 03** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 04** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 4 | 3 | **32** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 3 | 2 | **21** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 3 | 2 | **25** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 3 | 2 | **23** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 3 | 2 | **22** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 3 | 2 | **21** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 3 | 2 | **22** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 4 | 3 | **28** | Major improvement required |
| **Phase 05** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 06** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 07** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 08** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 09** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
| **Phase 10** | README.md | 4 | 4 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | **31** | Acceptable but should improve |
| | goals.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | dependencies.md | 4 | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **24** | Major improvement required |
| | deliverables.md | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **22** | Major improvement required |
| | checklist.md | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **21** | Major improvement required |
| | implementation-guide.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **20** | Major improvement required |
| | testing.md | 3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **21** | Major improvement required |
| | handoff-prompt.md | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 3 | **27** | Major improvement required |
