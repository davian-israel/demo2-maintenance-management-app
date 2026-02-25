## ADDED Requirements

### Requirement: Deployment workflow SHALL validate Vercel CLI prerequisites
Before deployment execution, the system SHALL validate that required Vercel CLI prerequisites are satisfied.

#### Scenario: Vercel CLI missing
- **WHEN** the deploy workflow runs on a machine without `vercel` CLI
- **THEN** the workflow exits with a clear error describing how to install or enable Vercel CLI

#### Scenario: CLI auth/link missing
- **WHEN** the deploy workflow runs without required Vercel authentication or project link
- **THEN** the workflow exits with a clear error describing required `vercel login` and/or `vercel link` steps

### Requirement: Deployment workflow SHALL validate runtime environment configuration
The deployment workflow SHALL validate required runtime environment variables before deployment is attempted.

#### Scenario: Required env value missing
- **WHEN** deployment is requested and required env variables are not configured
- **THEN** the workflow exits with explicit missing-variable errors

### Requirement: Deployment workflow SHALL guard against incompatible database URL for production deploy
The deployment workflow SHALL detect and reject clearly incompatible database URLs for production deployment context.

#### Scenario: Production deploy with local SQLite URL
- **WHEN** production deployment is requested with `DATABASE_URL` using a local `file:` SQLite value
- **THEN** the workflow exits with an actionable compatibility error and does not run production deploy
