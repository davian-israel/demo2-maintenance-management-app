## 1. Domain Modeling

- [x] 1.1 Add domain entities/value objects for Sector, ChecklistComponent, SectorChecklistItem, InspectionSession, and Observation
- [x] 1.2 Add observation status enum (`Pass`, `Fail`, `NotApplicable`, `NotInspected`) and validation invariants
- [x] 1.3 Extend Job aggregate with source observation reference metadata for generated corrective jobs

## 2. Persistence and Repositories

- [x] 2.1 Create Prisma schema/migration for sector catalog, checklist templates, sessions, observations, and finding-job linkage
- [x] 2.2 Implement repository methods for checklist catalog CRUD and inspection session writes/reads
- [x] 2.3 Add idempotency constraints/indexes to prevent duplicate active corrective jobs per failed observation

## 3. Application Use Cases and APIs

- [x] 3.1 Implement use cases to create/update sector checklist catalog definitions
- [x] 3.2 Implement use case to create/finalize inspection sessions with required-coverage validation
- [x] 3.3 Implement failure-to-job orchestration service that creates linked corrective jobs on failed observations
- [x] 3.4 Add API routes/contracts for checklist catalog, inspection sessions, and unresolved finding queries

## 4. Reporting and Read Models

- [x] 4.1 Add projections for unresolved failed observations by sector/component
- [x] 4.2 Add trend reporting for failure counts over date ranges and sector filters
- [x] 4.3 Update dashboard/report endpoints to include checklist-origin metrics and job traceability context

## 5. UI and Workflow

- [x] 5.1 Add checklist entry UI mirroring sector/component worksheet layout with inspector/date/comments fields
- [x] 5.2 Add unresolved findings view with linked corrective job status
- [x] 5.3 Update job detail UI to show source inspection session and failed observation metadata

## 6. Validation, Migration, and Rollout

- [x] 6.1 Seed baseline sector/component catalog aligned with current worksheet taxonomy
- [x] 6.2 Add domain/application tests for session validation, status handling, and idempotent job generation
- [x] 6.3 Add end-to-end tests for checklist submission -> failure -> corrective job lifecycle
- [x] 6.4 Release behind feature flag and document rollback steps for disabling checklist-to-job orchestration
