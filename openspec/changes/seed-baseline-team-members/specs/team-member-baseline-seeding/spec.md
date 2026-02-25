## ADDED Requirements

### Requirement: System SHALL seed the baseline team-member roster
The system SHALL provide a seed flow that ensures the following team members exist in the database:
- Officer Nathan
- Officer Aaron
- Officer Ree-al
- Officer Joshua
- Officer Reuben
- Officer Joel
- Soldier Benjah
- Soldier Benjamin
- Soldier Mushi
- Soldier Zuriel
- Soldier Naboth
- Soldier Arthur
- Soldier Shemuel
- Brother Isaiah
- Brother Kassi
- Brother Beresford
- Soldier Micah
- Soldier Yeamiah

#### Scenario: Seed baseline roster into empty database
- **WHEN** the team-member seed command is executed against a database with no team members
- **THEN** the system creates all baseline roster members

### Requirement: Team-member seed flow SHALL be idempotent
The seed workflow SHALL be repeatable and MUST NOT create duplicate team members when run multiple times with unchanged baseline data.

#### Scenario: Re-run seed with unchanged baseline roster
- **WHEN** the seed command is executed multiple times
- **THEN** the team-member table retains one logical record per baseline member and no duplicate records are created

### Requirement: Team-member seed flow SHALL be non-destructive for non-baseline members
The seed workflow SHALL upsert baseline roster members without deleting unrelated existing team members.

#### Scenario: Seed run on database with existing non-baseline members
- **WHEN** the seed command executes and the database contains manually created non-baseline members
- **THEN** non-baseline members remain present after seeding

### Requirement: Baseline seeded members SHALL use deterministic identifiers
The seed workflow SHALL derive consistent `teamMemberId` values from member names so reruns target the same records.

#### Scenario: Seed command updates existing baseline member
- **WHEN** a baseline member already exists with the deterministic identifier
- **THEN** the seed flow updates/upserts that existing member record instead of creating a new one
