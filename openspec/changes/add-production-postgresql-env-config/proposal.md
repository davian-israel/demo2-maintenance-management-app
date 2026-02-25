## Why

The app currently defaults to SQLite for local workflows, but production deployment on Vercel requires a network-accessible PostgreSQL database. A production-specific environment configuration is needed to use the provided Neon PostgreSQL connection string safely.

## What Changes

- Add production environment configuration guidance for PostgreSQL (`DATABASE_URL`) using the provided Neon connection string.
- Add non-committed production env workflow (`.env.production.local`) and tracked example/template docs.
- Ensure runtime/deploy readiness checks validate production database configuration.
- Keep local development and tests on SQLite unless explicitly overridden.

## Capabilities

### New Capabilities
- `production-postgresql-environment-config`: Defines production env variable requirements and secure handling for PostgreSQL connection strings.
- `runtime-database-target-selection`: Defines environment-based database target behavior (SQLite local, PostgreSQL production).

### Modified Capabilities
- `vercel-deployment-readiness`: Extend readiness requirements to explicitly validate production PostgreSQL configuration and secret handling.

## Impact

- Environment management: new production env file pattern and documentation.
- Deployment safety: stronger checks before production deploy.
- Runtime configuration: explicit environment-based database target selection.
- Operations: requires setting Neon `DATABASE_URL` in Vercel project settings.
