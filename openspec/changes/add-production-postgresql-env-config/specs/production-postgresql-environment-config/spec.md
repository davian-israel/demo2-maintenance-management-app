## ADDED Requirements

### Requirement: System SHALL support production PostgreSQL configuration via environment variables
The system SHALL use `DATABASE_URL` from production environment configuration to connect to PostgreSQL in production runtime.

#### Scenario: Production environment configured
- **WHEN** production runtime starts with a valid PostgreSQL `DATABASE_URL`
- **THEN** the application uses that database URL for persistence

### Requirement: Production database secrets SHALL not be committed to tracked files
The system SHALL require production database connection strings to be provided through non-committed local env files and platform secret settings.

#### Scenario: Repository configuration setup
- **WHEN** operators configure production database access
- **THEN** the real PostgreSQL connection string is stored in `.env.production.local` and/or Vercel Environment Variables, not committed source files

### Requirement: Deployment docs SHALL define Neon PostgreSQL usage for production
The system documentation SHALL define how to apply the provided Neon PostgreSQL connection string to production `DATABASE_URL`.

#### Scenario: Configure production env for deploy
- **WHEN** an operator follows deployment docs
- **THEN** they can set the provided Neon connection string as production `DATABASE_URL` without editing committed source files
