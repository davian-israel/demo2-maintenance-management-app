## 1. Production Env Configuration

- [x] 1.1 Add production env template guidance for PostgreSQL `DATABASE_URL`
- [x] 1.2 Ensure real production connection string is sourced from non-committed env file and Vercel env settings
- [x] 1.3 Document usage of the provided Neon connection string as production `DATABASE_URL`

## 2. Runtime and Deploy Validation

- [x] 2.1 Extend readiness checks to require production-safe database configuration
- [x] 2.2 Ensure production deploy path rejects local SQLite `file:*` URLs
- [x] 2.3 Verify local SQLite development/test paths remain functional

## 3. Verification and Docs

- [x] 3.1 Add/adjust tests for production env validation behavior
- [x] 3.2 Update README deployment section with PostgreSQL production setup steps
- [x] 3.3 Validate OpenSpec change in strict mode
