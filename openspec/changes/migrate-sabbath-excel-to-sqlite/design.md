## Context

The current app has domain and API support for jobs, checklist, skills, and team members, but bootstrapping data currently depends on manual API interactions and Postgres configuration. The source-of-truth operational dataset is maintained in `WIP - Maintenance Sabbath Check.xlsx`, which includes multiple sheets for skills and maintenance checks. This change formalizes an ETL path from that workbook and shifts the DB backend to SQLite for simpler local portability.

## Goals / Non-Goals

**Goals:**
- Use SQLite as the primary app database in local/dev flows.
- Provide a deterministic import command that reads only the specified workbook file.
- Persist imported records into existing app entities with explicit mapping and validation.
- Ensure `.env` files contain all required variables to run app + import flow.

**Non-Goals:**
- Ongoing real-time sync with Excel.
- Importing data from any workbook besides the specified path.
- Redesigning domain model beyond what is required for migration mapping.

## Decisions

1. **SQLite as Prisma datasource**
- Decision: change Prisma `datasource db.provider` to `sqlite` and use `DATABASE_URL` with `file:` URI.
- Rationale: simple local setup, no external DB dependency, fast iteration.
- Alternative considered: keep Postgres and add importer only. Rejected because request explicitly requires SQLite switch.

2. **Explicit one-time import command**
- Decision: add dedicated import command (e.g., `npm run import:sabbath`) that can be re-run idempotently.
- Rationale: avoids hidden side effects and makes migration auditable.
- Alternative considered: auto-import during app startup. Rejected for predictability and performance reasons.

3. **Workbook-sheet mapping with strict scope**
- Decision: parse only relevant sheets from the provided workbook and ignore all external sources.
- Rationale: request requires importing only this file.
- Alternative considered: configurable multi-file imports. Rejected for scope control.

4. **Env variable standardization in env files**
- Decision: define required variables in `.env.example` and concrete `.env` variants, including workbook path.
- Rationale: consistent local setup and fewer runtime misconfigurations.
- Alternative considered: hardcoded path in import script. Rejected for portability and maintainability.

## Risks / Trade-offs

- **[Risk] Excel structure drift (column/order changes)** -> **Mitigation:** validate required headers and fail fast with actionable error messages.
- **[Risk] Duplicate imports creating duplicate records** -> **Mitigation:** upsert semantics and stable keys where possible.
- **[Risk] Data quality inconsistencies in workbook cells** -> **Mitigation:** normalization + explicit rejection/reporting for invalid rows.
- **[Risk] SQLite differences from Postgres behavior** -> **Mitigation:** run full test suite and Prisma migration verification under SQLite.

## Migration Plan

1. Update Prisma datasource to SQLite and create migration baseline for SQLite.
2. Add env vars in `.env` files (`DATABASE_URL`, workbook path var, feature/runtime flags as needed).
3. Implement import command and sheet-to-entity mapping logic.
4. Run import and record counts by entity.
5. Execute lint/build/e2e against SQLite-backed runtime.

## Open Questions

- Which workbook sheets are authoritative when fields overlap (for example checklist comments vs job descriptions)?
- Should tools/equipment sheet be imported now or deferred as reference data only?
