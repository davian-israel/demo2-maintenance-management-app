## Context

Current local workflows run with SQLite and custom migration scripts, which is suitable for local development and test portability. Production deployment on Vercel requires a managed database reachable over the network, and the user supplied a Neon PostgreSQL connection string for that purpose.

## Goals / Non-Goals

**Goals:**
- Support production runtime with PostgreSQL via `DATABASE_URL`.
- Provide a secure pattern for production env files and Vercel env configuration.
- Preserve existing SQLite behavior for local/dev/e2e workflows.
- Add validation that prevents production deployment with incompatible local-only DB URLs.

**Non-Goals:**
- Migrating historical SQLite data to PostgreSQL in this change.
- Replacing local SQLite tooling and tests.
- Introducing multi-database runtime failover behavior.

## Decisions

1. **Use environment-scoped database URLs**
- Decision: Keep SQLite defaults for local env files while requiring PostgreSQL `DATABASE_URL` for production context.
- Rationale: minimizes disruption to current local/test flow.
- Alternative considered: globally switch all environments to PostgreSQL. Rejected for local portability and current test design.

2. **Do not commit secret connection strings**
- Decision: Store production connection strings only in `.env.production.local` (ignored) and Vercel Environment Variables; commit only example placeholders.
- Rationale: prevents secret leakage in repository history.
- Alternative considered: committing `.env.production` with real value. Rejected for security reasons.

3. **Enforce readiness checks before deploy**
- Decision: Extend deploy readiness checks to reject production deploys when `DATABASE_URL` is absent or local-file SQLite.
- Rationale: avoids successful deploys with broken persistence.
- Alternative considered: warning-only behavior. Rejected for production safety.

4. **Use provided Neon URL as operator input**
- Decision: Document that the provided Neon connection string should be configured as production `DATABASE_URL`.
- Rationale: aligns with user request while keeping secret out of tracked files.
- Alternative considered: embedding the raw connection string in committed config. Rejected for secret hygiene.

## Risks / Trade-offs

- **[Risk] Production deploy blocked by stricter env checks** -> **Mitigation:** provide explicit remediation messages and preflight command.
- **[Risk] Secret accidentally committed in env files** -> **Mitigation:** keep `.env*` ignore patterns and add documentation warnings.
- **[Risk] Configuration drift between local and Vercel** -> **Mitigation:** define one canonical required variable (`DATABASE_URL`) and preflight validation.

## Migration Plan

1. Add/update production env templates and docs.
2. Extend runtime/deploy checks for production PostgreSQL requirements.
3. Verify local SQLite workflows remain unchanged.
4. Validate deploy preflight for both success and failure scenarios.

Rollback: revert production checks/template changes; local SQLite workflows remain intact.

## Open Questions

- Should production deploy allow `USE_IN_MEMORY_REPO=true` as an explicit temporary override, or require PostgreSQL unconditionally?
