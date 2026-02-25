## Context

The field worksheet is organized by sector/room rows and repeated checklist components (walls, ceiling, floor, lights, windows, doors), with repeated inspection columns that capture status, inspector initials, date, and comments. The current domain is job-centric and does not preserve this tabular checklist structure, making it hard to represent routine building sweeps and systematically convert failures into corrective work.

## Goals / Non-Goals

**Goals:**
- Add a first-class sector checklist catalog aligned to the worksheet structure.
- Capture inspection sessions with per-item observations and metadata (status, inspector, observed date, comments, additional notes).
- Generate corrective jobs from failed observations while preserving traceability back to source observation and sector/component.
- Keep reporting-compatible timestamps for trends and unresolved findings.

**Non-Goals:**
- Replacing identity/role systems.
- OCR/parsing directly from uploaded spreadsheet images in this change.
- Full redesign of every existing dashboard screen.

## Decisions

1. **Introduce a checklist model alongside jobs**
- Decision: Add `Sector`, `ChecklistComponent`, `SectorChecklistItem`, `InspectionSession`, and `Observation` domain concepts, while retaining `Job` as the execution aggregate.
- Rationale: The worksheet structure is inspection-first; jobs represent follow-up work, not the primary observation record.
- Alternative considered: Encode sector/component in job description only. Rejected due to weak validation and no structured reporting.

2. **Use enumerated observation status, not boolean-only**
- Decision: Observation status uses `Pass | Fail | NotApplicable | NotInspected`.
- Rationale: The sheet uses mostly FALSE placeholders and comments; tri/quad-state handles real inspection lifecycle better than binary pass/fail.
- Alternative considered: Boolean only. Rejected because it cannot represent skipped/NA conditions clearly.

3. **Create one inspection session per sweep per date/technician group**
- Decision: An `InspectionSession` groups many observations for one sweep (e.g., morning walkthrough).
- Rationale: Matches repeated date/tech column groups in the source sheet and supports auditing.
- Alternative considered: Independent observation records without session container. Rejected due to weak chronology and harder review workflows.

4. **Failure-to-job linkage is explicit and idempotent**
- Decision: Persist `sourceObservationId` on generated jobs and enforce one active corrective job per failed observation.
- Rationale: Prevents duplicate job creation when imports/replays occur and preserves full traceability.
- Alternative considered: Best-effort matching by text/title. Rejected as unreliable.

5. **Keep migration additive first**
- Decision: Add new tables and APIs without immediately removing existing job endpoints.
- Rationale: Enables phased rollout and backfill of inspection data.
- Alternative considered: Big-bang replacement. Rejected due to operational risk.

## Risks / Trade-offs

- **[Risk] Increased model complexity** -> **Mitigation:** keep clear bounded contexts and repository interfaces.
- **[Risk] Duplicate corrective jobs from repeated failures** -> **Mitigation:** idempotency key on `sourceObservationId + active`.
- **[Risk] Ambiguity in mapping historical FALSE values** -> **Mitigation:** default import mapping policy and manual review queue.
- **[Risk] UI workflow drift from field process** -> **Mitigation:** session-based entry form that mirrors sector/component layout.

## Migration Plan

1. Add new schema objects for sectors, checklist items, sessions, observations, and finding-job link.
2. Seed baseline sector/component catalog from current worksheet taxonomy.
3. Add new API endpoints for creating sessions and observations.
4. Add domain service to generate corrective jobs from failed observations.
5. Update reporting projections to include unresolved failures and trend metrics.
6. Roll out UI with feature flag; keep current job flow operational.
7. Backfill/import historical checklist data where available.

Rollback: disable feature flag and stop checklist-to-job generation; existing job workflows remain intact because migration is additive.

## Open Questions

- Should generated jobs auto-assign based on sector ownership rules?
- Do repeated failures on the same checklist item reopen existing jobs or spawn new revision-linked jobs?
- What exact enum mapping should be used for legacy FALSE/blank cells during import?
