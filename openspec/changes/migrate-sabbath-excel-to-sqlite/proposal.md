## Why

The application currently targets Postgres/Neon and does not include a migration path from the existing maintenance workbook used by operations. A controlled import from the provided Excel file and a switch to SQLite are needed so the app can run locally with the actual existing data source.

## What Changes

- Switch Prisma datasource from PostgreSQL to SQLite.
- Add required `.env` variables for SQLite database path and workbook import source path.
- Implement one-time migration/import flow that reads **only** data from:
  - `/Users/davian/Desktop/projects/maintenance-israel/WIP - Maintenance Sabbath Check.xlsx`
- Map workbook data into application tables (team members, skills, jobs/checklist-relevant entities where applicable).
- Add migration verification steps to confirm imported row counts and data integrity.

## Capabilities

### New Capabilities
- `excel-workbook-data-migration`: Imports data only from the specified workbook into the application database with deterministic mapping and validation.
- `sqlite-datasource-switch`: Changes persistence provider and Prisma runtime to SQLite.
- `environment-variables-for-sqlite-import`: Defines and documents required env vars in `.env` files for SQLite + workbook import.

### Modified Capabilities
- None.

## Impact

- Prisma schema/migrations and datasource provider configuration.
- Repository/runtime connection behavior through `DATABASE_URL`.
- New import script/command and mapping logic for workbook sheets (`Date log`, `Skills`, `Job Sheet`, `Job description`, `Tools and equipment`).
- Environment configuration files (`.env`, `.env.example`, and test/local env variants).
