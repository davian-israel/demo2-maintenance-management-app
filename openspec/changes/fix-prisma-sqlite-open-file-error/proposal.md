## Why

Production requests that read team members are failing with:

`Invalid prisma.teamMember.findMany() invocation ... Error code 14: Unable to open the database file`

This happens when runtime is effectively using SQLite file access in an environment where the file path is unavailable or non-writable (e.g., serverless runtime). The current Prisma setup is SQLite-bound, which can conflict with production PostgreSQL intent.

## What Changes

- Introduce provider-compatible Prisma client selection so runtime can use PostgreSQL in production and SQLite in local workflows.
- Add a runtime fail-fast guard that prevents production from booting with a SQLite `file:` datasource.
- Strengthen deployment readiness checks to block production deploys that would trigger SQLite file-open errors.
- Add verification for team-member reads to ensure production no longer hits SQLite error code 14.

## Capabilities

### New Capabilities
- `team-member-read-availability`: Ensures team-member query paths remain available under production database configuration.

### Modified Capabilities
- `runtime-database-target-selection`: Extend from intent-level behavior to provider-compatible Prisma client resolution at runtime.
- `vercel-deployment-readiness`: Enforce production database/provider compatibility checks before deploy.

## Impact

- Runtime infrastructure: Prisma client bootstrap and datasource resolution logic.
- Build/deploy flow: provider-aware client generation and stricter preflight checks.
- API reliability: team member endpoints protected from SQLite file-open failures in production.
- Operations: clearer startup/deploy error messages when env is misconfigured.
