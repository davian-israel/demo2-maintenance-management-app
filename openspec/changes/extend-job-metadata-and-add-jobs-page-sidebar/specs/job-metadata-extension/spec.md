## ADDED Requirements

### Requirement: Job model SHALL include structured location and accountability metadata
The system SHALL persist `location`, `subLocation`, `doneBy`, and `checkedBy` for each job as first-class fields.

#### Scenario: Create job with metadata
- **WHEN** a client creates a job including location and accountability fields
- **THEN** the job is persisted with those values and returned in API responses

#### Scenario: Create job without optional metadata
- **WHEN** a client omits one or more metadata fields
- **THEN** the system stores missing metadata as null and still creates the job

### Requirement: Job responses SHALL expose metadata fields consistently
All job read/list endpoints SHALL include `location`, `subLocation`, `doneBy`, and `checkedBy` fields.

#### Scenario: List jobs
- **WHEN** a client requests the jobs list
- **THEN** each job in the response includes all metadata fields (possibly null)
