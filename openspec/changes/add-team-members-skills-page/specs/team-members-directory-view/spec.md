## ADDED Requirements

### Requirement: System SHALL provide a dedicated Team Members page
The application SHALL expose a route that displays all team members in a dedicated list view.

#### Scenario: Open team members page
- **WHEN** a user navigates to the team members route
- **THEN** the UI renders a list of team members with name and id

### Requirement: Team Members page SHALL show member skills
Each team member row/card SHALL display the member skill list including skill name and skill percentage.

#### Scenario: Team member with skills on page
- **WHEN** a listed team member has one or more skills
- **THEN** the page shows each skill name with its percentage value

#### Scenario: Team member without skills on page
- **WHEN** a listed team member has no skills
- **THEN** the page renders a clear fallback label indicating no skills assigned
