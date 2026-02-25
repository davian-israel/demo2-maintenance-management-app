## ADDED Requirements

### Requirement: Inspection session SHALL group observations for one walkthrough
The system SHALL represent each walkthrough as an inspection session containing multiple observations.

#### Scenario: Start session
- **WHEN** a technician starts a walkthrough for a property on a given date
- **THEN** the system creates an inspection session record with inspector and timestamp metadata

#### Scenario: Record multiple observations
- **WHEN** the technician records outcomes for several sector components
- **THEN** all observations are linked to the same inspection session

### Requirement: Observation SHALL capture worksheet-equivalent fields
Each observation SHALL include sector, component, status, observed date, inspector, comments, and optional additional notes.

#### Scenario: Persist failed observation with notes
- **WHEN** a technician marks "Kitchen / Hot Water" as `Fail` and provides comments
- **THEN** the system stores status, inspector, observed date, comments, and notes on that observation

#### Scenario: Reject invalid status value
- **WHEN** a client submits an observation status outside the allowed enum
- **THEN** the system rejects the request with a validation error

### Requirement: Session submission SHALL validate required checklist coverage
The system SHALL validate that required sector components are either inspected or explicitly marked `NotApplicable`/`NotInspected` before finalizing a session.

#### Scenario: Missing required component outcome
- **WHEN** a session is finalized without an outcome for a required component
- **THEN** finalization is rejected and missing components are returned
