## ADDED Requirements

### Requirement: Team Members page SHALL provide add-new-member action
The Team Members page SHALL include an `Add New Team Member` button that starts member creation workflow.

#### Scenario: Open create form
- **WHEN** a user clicks `Add New Team Member`
- **THEN** the UI presents a form to enter new team-member details

### Requirement: Team Members create form SHALL create members
The create form SHALL submit member data and append the created member to the Team Members list.

#### Scenario: Successful team-member create
- **WHEN** user submits valid team-member values in the form
- **THEN** the system creates the team member and the list displays the new record

#### Scenario: Invalid team-member create
- **WHEN** user submits missing or invalid values
- **THEN** the UI shows a validation error and no member is created
