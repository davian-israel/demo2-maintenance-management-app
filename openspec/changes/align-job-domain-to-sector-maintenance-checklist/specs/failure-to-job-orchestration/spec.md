## ADDED Requirements

### Requirement: Failed observations SHALL generate corrective jobs
The system SHALL create corrective maintenance jobs from observations with status `Fail`.

#### Scenario: Generate corrective job from failure
- **WHEN** an observation is saved with status `Fail`
- **THEN** the system creates a job linked to the source observation and sector/component context

### Requirement: Corrective jobs SHALL be traceable to source observations
Generated jobs SHALL preserve `sourceObservationId`, sector, component, and session metadata for auditability.

#### Scenario: View generated job
- **WHEN** a user views a job created from a checklist failure
- **THEN** the job displays reference to the originating inspection session and observation

### Requirement: Job generation SHALL be idempotent per active failure
The system SHALL prevent duplicate active jobs for the same failed observation.

#### Scenario: Retry processing failure event
- **WHEN** failure-to-job orchestration processes the same failed observation more than once
- **THEN** the system keeps one active corrective job for that observation

### Requirement: Failure resolution SHALL update finding state
The system SHALL mark failed observations as resolved when linked corrective work is completed, or explicitly keep them unresolved when work is cancelled.

#### Scenario: Complete linked corrective job
- **WHEN** a corrective job linked to a failed observation transitions to `Completed`
- **THEN** the failed observation is marked resolved with resolution timestamp

#### Scenario: Cancel linked corrective job
- **WHEN** the linked corrective job is cancelled
- **THEN** the failed observation remains unresolved and visible in unresolved findings reports
