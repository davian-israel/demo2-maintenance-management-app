## MODIFIED Requirements

### Requirement: Runtime SHALL select a provider-compatible Prisma client
Runtime SHALL select the Prisma client that matches the configured datasource protocol.

#### Scenario: PostgreSQL datasource in production
- **WHEN** `DATABASE_URL` starts with `postgres://` or `postgresql://`
- **THEN** runtime uses the PostgreSQL-compatible Prisma client
- **AND** Prisma-backed repositories execute without SQLite driver/file access

#### Scenario: SQLite datasource in local workflows
- **WHEN** `DATABASE_URL` starts with `file:` in non-production contexts
- **THEN** runtime uses the SQLite-compatible Prisma client
- **AND** local/e2e SQLite workflows remain functional

### Requirement: Production runtime SHALL reject SQLite file datasource
Production runtime SHALL fail fast when configured with a SQLite file datasource.

#### Scenario: Production env with SQLite `file:*` URL
- **WHEN** `NODE_ENV=production` and `DATABASE_URL` starts with `file:`
- **THEN** application startup fails with an actionable configuration error
- **AND** error message instructs operator to set PostgreSQL `DATABASE_URL`
