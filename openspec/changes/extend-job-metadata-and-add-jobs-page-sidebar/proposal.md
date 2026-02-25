## Why

Jobs currently miss key accountability and location details used by operations teams, and there is no dedicated page to review all jobs from a persistent sidebar navigation. Adding these fields and navigation improves data quality and makes daily job tracking faster.

## What Changes

- Extend the job model with `location`, `subLocation`, `doneBy`, and `checkedBy`.
- Update create/edit/read flows so these fields are captured and displayed consistently.
- Add a new Jobs page that lists all jobs in a table/list optimized for scanning.
- Introduce a sidebar navigation menu and add a link to the new Jobs page.
- **BREAKING**: Job API payload contracts will include required/optional metadata fields that were not previously present.

## Capabilities

### New Capabilities
- `job-metadata-extension`: Adds structured job metadata fields for location hierarchy and accountability users.
- `jobs-directory-view`: Adds a dedicated page to view all jobs with essential metadata and status.
- `sidebar-navigation-jobs-link`: Adds a sidebar navigation shell and links to jobs view.

### Modified Capabilities
- None (no archived baseline capabilities exist yet in `openspec/specs`).

## Impact

- Domain/application/persistence layers for job entities and repository mappings.
- API contracts and validation schemas for job create/update/list responses.
- Frontend routing/layout to support sidebar navigation and jobs page.
- Playwright/e2e flows to cover new metadata fields and navigation path.
