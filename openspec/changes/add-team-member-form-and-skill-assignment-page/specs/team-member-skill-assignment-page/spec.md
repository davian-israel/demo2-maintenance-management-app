## ADDED Requirements

### Requirement: System SHALL provide team-member skill assignment page
The application SHALL expose a dedicated page for assigning existing skills to a selected team member.

#### Scenario: Open assignment page
- **WHEN** a user navigates to the assignment route
- **THEN** the page renders team-member selection and existing-skill selection controls

### Requirement: Assignment page SHALL require selecting a team member
The assignment workflow SHALL require a selected team member before saving assignments.

#### Scenario: Submit without team-member selection
- **WHEN** a user attempts to submit assignments without selecting a team member
- **THEN** the UI blocks submission with an actionable validation message

### Requirement: Assignment page SHALL assign existing skills to selected member
Users SHALL be able to select one or more existing skills and assign them to the chosen team member.

#### Scenario: Assign selected existing skills
- **WHEN** a user selects a team member and existing skills then saves
- **THEN** the selected member is updated with those skills and assignments are visible in member views

#### Scenario: No existing skills available
- **WHEN** no skills exist in the catalog
- **THEN** the page shows a clear empty-state message indicating skills must be created first
