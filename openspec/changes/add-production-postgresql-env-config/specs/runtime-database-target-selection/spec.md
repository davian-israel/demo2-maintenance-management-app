## ADDED Requirements

### Requirement: Runtime SHALL select database target by environment intent
The runtime SHALL preserve SQLite defaults for local development/test workflows while allowing PostgreSQL configuration for production deployment context.

#### Scenario: Local development runtime
- **WHEN** local environment uses SQLite `DATABASE_URL` or local SQLite defaults
- **THEN** the application continues operating with SQLite-backed persistence

#### Scenario: Production deployment runtime
- **WHEN** production environment sets PostgreSQL `DATABASE_URL`
- **THEN** runtime uses PostgreSQL connection settings for persistence

### Requirement: Production deploy checks SHALL block incompatible local-only database URLs
The deployment readiness flow SHALL reject production deployment when the configured database URL is local-file SQLite.

#### Scenario: Production preflight with `DATABASE_URL=file:*`
- **WHEN** production preflight runs with local SQLite file URL
- **THEN** preflight fails with actionable error and production deploy does not proceed
