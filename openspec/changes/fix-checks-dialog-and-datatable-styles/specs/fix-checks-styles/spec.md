## MODIFIED Requirements

### Requirement: Checks directory table SHALL use DataTableComponent
The maintenance checks directory SHALL render the session list using the same `DataTableComponent` used by the jobs directory, including sorting, pagination, search, and responsive behaviour.

#### Scenario: DataTable features present
- **WHEN** the user views the maintenance checks directory with data
- **THEN** the table renders with DataTables sorting arrows, pagination controls, and search input matching the jobs page

### Requirement: Detail dialog SHALL be centered on screen
The maintenance check detail dialog SHALL be horizontally and vertically centered on all viewports when open.

#### Scenario: Dialog centering
- **WHEN** the user opens a maintenance check detail dialog
- **THEN** the dialog appears centered in the viewport
