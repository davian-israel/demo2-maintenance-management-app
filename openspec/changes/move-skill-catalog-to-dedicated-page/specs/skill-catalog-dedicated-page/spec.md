## ADDED Requirements

### Requirement: System SHALL provide a dedicated Skill Catalog page
The application SHALL expose a dedicated page for skill catalog management.

#### Scenario: Open Skill Catalog page
- **WHEN** a user navigates to the Skill Catalog route
- **THEN** the page renders the skill creation form and current skill list

### Requirement: Skill creation SHALL function on dedicated page
The dedicated Skill Catalog page SHALL allow users to create skills using existing validation and API behavior.

#### Scenario: Create skill from dedicated page
- **WHEN** user submits valid skill data on Skill Catalog page
- **THEN** the new skill is created and appears in the displayed skill list

#### Scenario: Invalid skill submission on dedicated page
- **WHEN** user submits invalid skill payload
- **THEN** the page displays a validation error and no skill is created
