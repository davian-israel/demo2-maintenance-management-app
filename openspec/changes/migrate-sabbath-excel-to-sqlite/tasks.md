## 1. SQLite Configuration

- [x] 1.1 Update Prisma datasource provider from PostgreSQL to SQLite
- [x] 1.2 Add/update SQLite migration files and verify Prisma generate/migrate commands
- [x] 1.3 Update runtime repository wiring assumptions to remain compatible with SQLite-backed `DATABASE_URL`

## 2. Environment Variables

- [x] 2.1 Add required SQLite variables to `.env.example`
- [x] 2.2 Add required import source path variable(s) to `.env` files used in local/test workflows
- [x] 2.3 Document env variable usage and defaults in project docs

## 3. Excel Data Migration

- [x] 3.1 Implement import command/script that reads only `/Users/davian/Desktop/projects/maintenance-israel/WIP - Maintenance Sabbath Check.xlsx`
- [x] 3.2 Implement sheet-to-entity mapping and row validation with explicit error reporting
- [x] 3.3 Implement idempotent upsert behavior for re-runnable imports

## 4. Verification

- [x] 4.1 Add/adjust tests for import parsing/mapping behavior
- [x] 4.2 Verify application boots and API flows function with SQLite datasource
- [x] 4.3 Run Playwright e2e suite on SQLite-backed runtime after import
