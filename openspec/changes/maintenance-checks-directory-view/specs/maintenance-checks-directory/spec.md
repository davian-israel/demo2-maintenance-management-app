## ADDED Requirements

### Requirement: System SHALL expose a maintenance checks directory page
The application SHALL provide a dedicated route that lists all maintenance inspection sessions (maintenance checks) in a layout and visual style consistent with the jobs directory page (hero summary, card-wrapped table, similar typography and spacing).

#### Scenario: User opens maintenance checks from navigation
- **WHEN** a user follows the sidebar link to the maintenance checks directory
- **THEN** the application navigates to the new route and renders the maintenance checks list view

#### Scenario: Empty list state
- **WHEN** no inspection sessions exist
- **THEN** the UI SHALL display a clear empty state comparable in tone to the jobs directory when there are no jobs

### Requirement: System SHALL provide a session list API for the directory
The backend SHALL expose an authenticated or same-origin API that returns all inspection sessions (or a documented page of them) with fields sufficient to populate the directory table without loading full observation payloads for every session.

#### Scenario: Successful list fetch
- **WHEN** the client requests the maintenance checks list endpoint with checklist features enabled
- **THEN** the response includes a sessions array with stable identifiers and summary metadata for each session

### Requirement: Row selection SHALL open a detail dialog
When the user selects a row representing a maintenance check, the application SHALL open a modal dialog (not a full-page navigation) that presents maintenance check details for that session.

#### Scenario: Open dialog from row
- **WHEN** the user activates a row (or its primary view action) for a given session
- **THEN** a dialog opens displaying details for that maintenance check

#### Scenario: Close dialog
- **WHEN** the user dismisses the dialog using the provided close control or standard platform dismissal (for example ESC on native dialog)
- **THEN** the dialog closes and focus returns to a sensible element on the page

### Requirement: Dialog SHALL show substantive session detail
The dialog content SHALL include at minimum: inspector, inspection timestamp, whether the session is finalized, and a structured list or summary of observations (sector, component, status, and comments where present).

#### Scenario: Detail content visible
- **WHEN** the dialog is open for a session that has observations
- **THEN** the user can read observation-level information without leaving the directory page
