## ADDED Requirements

### Requirement: Dashboard SHALL not render Skill Catalog management section
The dashboard page SHALL remove inline Skill Catalog create/list UI after migration to dedicated page.

#### Scenario: Open dashboard after migration
- **WHEN** a user visits dashboard route
- **THEN** the dashboard does not display Skill Catalog create/list components

## MODIFIED Requirements

### Requirement: Dashboard SHALL focus on maintenance operations without inline skill management
The dashboard SHALL present maintenance summary, jobs, and checklist flows without embedding the full skill catalog management module.

#### Scenario: Dashboard rendering
- **WHEN** dashboard page loads
- **THEN** jobs/checklist/reporting sections are visible and skill management is accessed via dedicated route
