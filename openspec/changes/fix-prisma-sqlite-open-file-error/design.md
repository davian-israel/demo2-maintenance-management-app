## Context

The current schema/client path is SQLite-centric. In production, this can produce runtime SQLite file access failures (`Error code 14`) when a file datasource is used in serverless environments. The failure surfaced in `prisma.teamMember.findMany()` but affects all Prisma-backed reads/writes.

## Goals / Non-Goals

**Goals:**
- Prevent SQLite file-open runtime errors in production.
- Preserve local SQLite workflows for development/e2e.
- Ensure production runtime uses a PostgreSQL-compatible Prisma path.
- Fail fast with actionable errors when production env is incompatible.

**Non-Goals:**
- Re-architecting the domain model or repository contracts.
- Changing business logic in team-member services.
- Introducing multi-primary database failover.

## Decisions

1. **Provider-compatible Prisma clients**
- Decision: Maintain explicit Prisma client generation for each provider context used by this app (SQLite local/e2e, PostgreSQL production).
- Rationale: Prisma datasource provider is schema-bound; explicit clients avoid ambiguous runtime behavior.
- Alternative considered: single schema/provider for all environments. Rejected because it breaks either local SQLite portability or production PostgreSQL compatibility.

2. **Runtime datasource resolution + guard**
- Decision: Add runtime resolver that selects the provider-compatible Prisma client based on `DATABASE_URL` protocol and environment intent.
- Rationale: deterministic runtime behavior and safer env drift handling.
- Alternative considered: lazy fallback to in-memory repositories on Prisma errors. Rejected because it masks configuration faults and risks data inconsistency.

3. **Fail-fast production startup rule**
- Decision: If `NODE_ENV=production` and datasource resolves to SQLite `file:*`, startup should fail with explicit remediation.
- Rationale: prevents partial runtime availability and hidden data loss scenarios.
- Alternative considered: warning-only logs. Rejected as too permissive for production reliability.

4. **Preflight/deploy enforcement**
- Decision: Extend readiness checks to reject production deploy when runtime/provider mapping is invalid.
- Rationale: catches misconfiguration before traffic reaches broken endpoints.
- Alternative considered: runtime-only protection. Rejected because earlier feedback is better for deployment safety.

## Risks / Trade-offs

- **[Risk] Increased build complexity with multi-client generation** -> **Mitigation:** encapsulate generation in scripts and CI checks.
- **[Risk] Drift between provider schemas** -> **Mitigation:** document synchronization workflow and add verification tests for generated clients.
- **[Risk] Hard fail in production on misconfig** -> **Mitigation:** provide clear error text with exact env fix (`DATABASE_URL` PostgreSQL).

## Migration Plan

1. Add/organize provider-compatible Prisma schema/client generation.
2. Implement runtime client resolver and production guard.
3. Wire repositories to resolver-managed Prisma client export.
4. Extend deploy readiness checks.
5. Validate with tests focused on team-member reads and startup guard behavior.

Rollback: restore previous single-provider client path and readiness checks.

## Open Questions

- Should production reject `USE_IN_MEMORY_REPO=true` unconditionally, or only when Prisma repositories are enabled?
