## ADDED Requirements

### Requirement: Application SHALL use SQLite datasource for Prisma
The system SHALL configure Prisma to use SQLite for application persistence.

#### Scenario: Start app with configured database URL
- **WHEN** app starts with SQLite `DATABASE_URL`
- **THEN** repositories operate against SQLite without requiring Postgres/Neon

### Requirement: SQLite schema migrations SHALL be executable in local workflow
The project SHALL provide migration setup compatible with SQLite provider.

#### Scenario: Run Prisma migration commands
- **WHEN** developer runs Prisma generate/migrate commands
- **THEN** schema is created/updated successfully for SQLite
