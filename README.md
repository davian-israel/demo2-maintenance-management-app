# Maintenance Management App (Next.js + DDD + Prisma + SQLite)

A modern Next.js application implementing the requested Maintenance Management domain model using DDD boundaries, strong Zod validation, Prisma persistence (SQLite), theme toggle (light/dark), and Playwright e2e verification.

## Stack
- Next.js App Router + TypeScript
- Zod command validation
- DDD-style domain/application/infrastructure separation
- Prisma ORM with SQLite
- Playwright end-to-end tests
- Vercel-ready deployment setup

## Architecture
- OpenSpec domain file: [`OPENSPEC.md`](/Users/davian/Desktop/projects/demo2/OPENSPEC.md)
- Domain layer: `src/domain/*`
- Application use cases: `src/application/*`
- Infrastructure adapters: `src/infrastructure/*`
- HTTP routes: `src/app/api/*`
- UI: `src/components/*`, `src/app/*`

## Local Setup
1. Install deps:
```bash
npm install
```
2. Copy env:
```bash
cp .env.example .env
```
3. Generate Prisma client:
```bash
npm run prisma:generate
```
4. (First DB setup) apply migrations:
```bash
npm run prisma:migrate
```
5. Import workbook data:
```bash
npm run import:sabbath
```
6. Seed baseline team members (idempotent, non-destructive upsert):
```bash
npm run seed:team-members
```
7. Run app:
```bash
npm run dev
```

## Environment
- `DATABASE_URL`: SQLite Prisma URL (for example `file:./dev.db`).
- `SABBATH_WORKBOOK_PATH`: absolute path to the workbook used by import.
- `IMPORT_STRICT`: when `true`, import fails if warnings are produced.
- `USE_IN_MEMORY_REPO`: set `true` to run without database (useful for tests).
- `FEATURE_CHECKLIST_ENABLED`: defaults to `true`; set to `false` to disable checklist APIs/UI flow.
- Production template file: `.env.production.example` (tracked).
- Production real secrets: `.env.production.local` (not committed).

## Scripts
- `npm run dev`
- `npm run build` (runs `prisma generate` first)
- `npm run lint`
- `npm run test:e2e`
- `npm run test:import`
- `npm run test:seed`
- `npm run test:deploy`
- `npm run import:sabbath`
- `npm run seed:team-members`
- `npm run deploy:vercel:preflight`
- `npm run deploy:vercel:preview`
- `npm run deploy:vercel:prod`
- `npm run prisma:generate`
- `npm run prisma:migrate`

## Deploy To Vercel (From GitHub Repo)
1. Push this project to a GitHub repository.
2. In Vercel, choose `Add New... -> Project` and import the GitHub repository.
3. Configure production environment variables:
   - Set `DATABASE_URL` to your Neon PostgreSQL connection string (the one provided for this project).
   - For local production testing, place the same value in `.env.production.local`.
   - Demo/ephemeral path: set `USE_IN_MEMORY_REPO=true`.
   - Optional: set `FEATURE_CHECKLIST_ENABLED` as needed (`true` by default).
4. Trigger deploy from Vercel (Git push) or CLI.

## Deploy To Vercel (CLI)
Preview deploy:
```bash
npm run deploy:vercel:preview
```

Production deploy:
```bash
npm run deploy:vercel:prod
```

Readiness checks enforced by deploy scripts:
- `vercel` CLI is installed and authenticated.
- Local repo `origin` points to GitHub.
- Vercel project link exists (`vercel link`).
- Environment is deployable for target mode (production requires PostgreSQL protocol and rejects `DATABASE_URL=file:*`).

## Rollback Toggle
- Checklist rollout is feature-flagged.
- To roll back checklist behavior without schema rollback, set:
  - `FEATURE_CHECKLIST_ENABLED=false`
- Effect:
  - Checklist routes return feature-disabled errors.
  - Dashboard loads without checklist catalog/finding/trend data.
  - Existing job/skill flows continue operating.

## Playwright Verification
Tests are in [`tests/maintenance.spec.ts`](/Users/davian/Desktop/projects/demo2/tests/maintenance.spec.ts).
The config boots Next.js against SQLite e2e database and verifies:
- Light/dark theme toggle.
- Skill creation.
- Job creation.
- Job start -> log run -> complete lifecycle.
- Checklist validation rejects unknown sector/component.
- Checklist failure -> corrective job -> completion resolves finding.
