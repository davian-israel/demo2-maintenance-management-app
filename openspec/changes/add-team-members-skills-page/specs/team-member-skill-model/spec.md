## ADDED Requirements

### Requirement: System SHALL define TeamMember identity and profile fields
The system SHALL represent a team member with `teamMemberId` and `name` as first-class fields.

#### Scenario: Create team member
- **WHEN** a client creates a team member with valid id and name
- **THEN** the system persists and returns `teamMemberId` and `name`

### Requirement: System SHALL define Skill fields for team-member capability
The system SHALL represent a skill with `skillId`, `name`, and `skillPercentage` for team-member profiles.

#### Scenario: Add skill with percentage
- **WHEN** a client submits a skill containing `skillId`, `name`, and `skillPercentage`
- **THEN** the system stores and returns all three fields

#### Scenario: Reject invalid percentage
- **WHEN** `skillPercentage` is outside accepted bounds
- **THEN** the system rejects the request with a validation error

### Requirement: TeamMember SHALL own a list of skills
A team member record SHALL support zero or more Skill entries and return them as a list in read responses.

#### Scenario: Team member with multiple skills
- **WHEN** a team member has multiple skill records
- **THEN** the team member response includes a list containing each skill entry

#### Scenario: Team member without skills
- **WHEN** a team member has no skills assigned
- **THEN** the response includes an empty skills list
