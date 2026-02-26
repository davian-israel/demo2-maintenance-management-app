## 1. Provider-Compatible Prisma Runtime

- [x] 1.1 Add provider-compatible Prisma schema/client generation for SQLite (local/e2e) and PostgreSQL (production)
- [x] 1.2 Implement runtime datasource resolver and export the matching Prisma client
- [x] 1.3 Add production fail-fast guard for SQLite `file:*` datasource

## 2. Repository + API Reliability

- [x] 2.1 Wire Prisma repositories to the resolver-managed Prisma client export
- [x] 2.2 Verify `/api/team-members` query path uses provider-compatible runtime client without SQLite file-open failures

## 3. Deployment Safety + Verification

- [x] 3.1 Extend Vercel readiness/preflight checks for datasource/provider compatibility
- [x] 3.2 Add or update tests for runtime resolver behavior and production guard path
- [x] 3.3 Validate OpenSpec change in strict mode
