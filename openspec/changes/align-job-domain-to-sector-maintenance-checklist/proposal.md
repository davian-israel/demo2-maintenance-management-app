## Why

The current job domain models maintenance as standalone jobs and run logs, but the provided operations sheet captures work as a recurring sector checklist with per-item pass/fail outcomes, timestamps, technicians, comments, and follow-up actions. We need the domain to match this field workflow so data entry, reporting, and job generation are consistent with how inspections are actually performed.

## What Changes

- Introduce a checklist-first maintenance model centered on inspection sessions.
- Add sector/room and checklist-item taxonomy (e.g., Main Hall, Nursery Room; walls, ceiling, floor, lights, windows, doors).
- Record per-item observations with status (pass/fail/na), inspector, observed date, comments, and optional follow-up action.
- Derive corrective maintenance jobs automatically from failed checklist observations.
- Add query/reporting support for failures by sector, unresolved findings, and trend counts over time.
- **BREAKING**: Job creation is no longer only manual-first; jobs can be system-generated from inspection failures and must retain traceability to originating checklist observations.

## Capabilities

### New Capabilities
- `sector-checklist-catalog`: Defines sectors/rooms and required checklist items/components for each sector.
- `inspection-session-recording`: Captures recurring checklist inspections with per-item outcomes, metadata, and comments.
- `failure-to-job-orchestration`: Creates and tracks corrective jobs from failed inspection findings with linkage back to source findings.

### Modified Capabilities
- None (no existing OpenSpec capabilities are currently defined in this repository).

## Impact

- Domain model: new entities/value objects for Sector, ChecklistItem, InspectionSession, and Observation; Job gains origin/reference metadata.
- Persistence: new tables and relations for catalog + inspections + findings + finding-to-job mapping.
- APIs/UI: checklist submission and review endpoints/screens; job views include source-finding context.
- Reporting: overdue/unresolved findings and failure trends added to read models.
- Tests: domain invariants, API contracts, and e2e flows updated for checklist-driven maintenance.
