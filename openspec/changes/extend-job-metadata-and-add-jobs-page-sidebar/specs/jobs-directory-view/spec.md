## ADDED Requirements

### Requirement: System SHALL provide a dedicated jobs directory page
The application SHALL expose a route that displays all jobs in a dedicated list view.

#### Scenario: Open jobs page
- **WHEN** a user navigates to the jobs route
- **THEN** the UI renders a list of all jobs with title, status, due date, and metadata fields

### Requirement: Jobs directory SHALL show new metadata fields
The jobs page SHALL display `location`, `subLocation`, `doneBy`, and `checkedBy` per job.

#### Scenario: Job row with metadata
- **WHEN** a job has all metadata fields populated
- **THEN** the jobs list shows each field value in the job row/card

#### Scenario: Job row without metadata
- **WHEN** a job is missing any metadata field
- **THEN** the jobs list renders a clear fallback value (for example, "Not set")
