## ADDED Requirements

### Requirement: Team-member read paths SHALL be available with production database configuration
Team-member query operations SHALL not fail due to SQLite file-open errors in production.

#### Scenario: Team-member list query under production PostgreSQL configuration
- **WHEN** production runtime is configured with PostgreSQL `DATABASE_URL`
- **AND** `/api/team-members` executes `prisma.teamMember.findMany()`
- **THEN** request succeeds or fails only for domain/validation reasons
- **AND** it does not fail with SQLite `Error code 14: Unable to open the database file`
