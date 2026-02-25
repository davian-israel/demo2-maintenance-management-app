## MODIFIED Requirements

### Requirement: Deployment workflow SHALL validate runtime environment configuration
The deployment workflow SHALL validate required runtime environment variables before deployment is attempted, and SHALL enforce production-safe database configuration.

#### Scenario: Required env value missing
- **WHEN** deployment is requested and required env variables are not configured
- **THEN** the workflow exits with explicit missing-variable errors

#### Scenario: Production deploy with non-production-safe database URL
- **WHEN** production deployment is requested with `DATABASE_URL` using local `file:*` SQLite value
- **THEN** the workflow exits with an actionable compatibility error and does not run production deploy

#### Scenario: Production deploy with configured PostgreSQL URL
- **WHEN** production deployment is requested with a valid PostgreSQL `DATABASE_URL`
- **THEN** runtime env validation passes for database configuration

### Requirement: Deployment workflow SHALL validate secret-handling path for database connection
The deployment workflow and documentation SHALL require production database secrets to be supplied through non-committed env sources.

#### Scenario: Production configuration review
- **WHEN** operators follow deployment setup guidance
- **THEN** the PostgreSQL connection string is configured via `.env.production.local` and/or Vercel Environment Variables, not committed files
