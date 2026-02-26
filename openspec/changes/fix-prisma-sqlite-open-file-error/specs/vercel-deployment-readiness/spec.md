## MODIFIED Requirements

### Requirement: Production readiness checks SHALL enforce datasource/provider compatibility
Deployment readiness checks SHALL prevent production deploys that would boot with incompatible Prisma datasource/provider configuration.

#### Scenario: Production preflight with SQLite datasource
- **WHEN** production preflight detects `DATABASE_URL=file:*`
- **THEN** preflight fails with explicit remediation guidance
- **AND** deploy command exits non-zero before deployment

#### Scenario: Production preflight with PostgreSQL datasource
- **WHEN** production preflight detects PostgreSQL `DATABASE_URL`
- **THEN** preflight passes datasource/provider compatibility checks
