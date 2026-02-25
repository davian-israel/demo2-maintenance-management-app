## Context

The project is a Next.js application with Prisma and currently uses SQLite-oriented local workflows. Vercel deployment requires a repeatable CLI process and explicit runtime-readiness checks so deployments do not fail due to missing CLI auth, missing environment variables, or incompatible database URLs.

## Goals / Non-Goals

**Goals:**
- Define a repeatable deployment path using Vercel CLI commands.
- Default to preview deployments unless production is explicitly requested.
- Validate deployment prerequisites (CLI installed, auth/link state, required env vars).
- Document exact commands and expected outputs for operators.

**Non-Goals:**
- Migrating database providers in this change.
- Replacing Vercel with another hosting platform.
- Adding custom CI/CD pipeline orchestration beyond local CLI commands.

## Decisions

1. **Use Vercel CLI as the single deployment interface**
- Decision: Add npm scripts that call `vercel deploy -y` for preview and `vercel deploy --prod -y` only for explicit production deploys.
- Rationale: Keeps deployment behavior consistent and auditable.
- Alternative considered: Deploy via Vercel dashboard only. Rejected due to reduced repeatability.

2. **Enforce preview-first semantics**
- Decision: Treat preview as default deployment mode and require explicit production command.
- Rationale: Reduces accidental production releases.
- Alternative considered: single deploy script with prod toggle prompt. Rejected for script simplicity.

3. **Add deployment-readiness validation**
- Decision: Add a predeploy check script to fail fast when prerequisites are missing.
- Rationale: Improves reliability and operator feedback.
- Alternative considered: allowing deploy command to fail naturally. Rejected because failures are less actionable.

4. **Validate database/runtime env suitability for Vercel**
- Decision: Readiness checks should reject clearly incompatible runtime DB values (for example local `file:` SQLite URL in production deployment context) unless user intentionally runs preview with known constraints.
- Rationale: Prevents misleading “successful” deployments with broken persistence.
- Alternative considered: no DB checks. Rejected due to high risk of runtime failures.

## Risks / Trade-offs

- **[Risk] Deployment blocked by stricter checks** -> **Mitigation:** provide clear error messages and bypass guidance for non-production experiments.
- **[Risk] CLI auth/link state differs per machine** -> **Mitigation:** document `vercel login` and `vercel link` prerequisites.
- **[Risk] Runtime DB compatibility unresolved for production** -> **Mitigation:** keep explicit warnings and gate production deploy command on env readiness.

## Migration Plan

1. Add deployment and readiness scripts.
2. Add npm commands for preview and production deploys.
3. Add deployment documentation for setup and execution.
4. Validate command behavior locally (without forcing a live prod deploy).

Rollback: remove deploy scripts/commands and restore current manual workflow.

## Open Questions

- Should production deploy command hard-fail on `DATABASE_URL=file:*` in all cases, or allow an override flag for temporary demos?
