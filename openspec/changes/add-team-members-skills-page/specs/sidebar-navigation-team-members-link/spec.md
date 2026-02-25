## ADDED Requirements

### Requirement: Sidebar SHALL include Team Members navigation link
The persistent sidebar menu SHALL include a `Team Members` item.

#### Scenario: Render Team Members link
- **WHEN** a user opens a main application page
- **THEN** the sidebar contains a Team Members navigation link

### Requirement: Team Members link SHALL route to team-members page
Clicking the Team Members link SHALL navigate to the team-members route and indicate active state.

#### Scenario: Navigate using Team Members link
- **WHEN** a user clicks Team Members in the sidebar
- **THEN** the app navigates to the team-members page and highlights the Team Members nav item as active
