## ADDED Requirements

### Requirement: Sector checklist catalog SHALL define inspectable scope
The system SHALL maintain a catalog of sectors/rooms and required checklist components for each sector so inspections are validated against a known template.

#### Scenario: Create sector with standard components
- **WHEN** an administrator defines a sector named "Main Hall" with checklist components
- **THEN** the system stores the sector and its inspectable component list as structured records

#### Scenario: Prevent duplicate component assignment within one sector
- **WHEN** an administrator attempts to assign "Walls" twice to the same sector template
- **THEN** the system rejects the duplicate assignment

### Requirement: Checklist components SHALL support ordered presentation
The system SHALL preserve component display order within each sector checklist template.

#### Scenario: Render sector checklist
- **WHEN** a client requests the checklist template for a sector
- **THEN** components are returned in the configured order
