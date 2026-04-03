## Context

The app already has checklist domain services (`ChecklistService`), catalog APIs (`/api/checklist/catalog`, sessions), and a jobs create flow (`/jobs/new`, `CreateJobForm`) with `location` and `subLocation`. The home dashboard (`MaintenanceDashboard`) summarizes work but does not yet guide a technician through **location → sub-location → checklist** with a **round-trip to create a job** and **resume** the same inspection.

## Goals / Non-Goals

**Goals:**

- One clear maintenance path: pick a parent **location** (aligned with catalog “sector” or top-level site area), then a **sub-location** (room, wing, or checklist grouping), then step through checklist items in that context.
- From the maintenance UI, a single primary action opens **Add job** with fields prefilled from the current place in the checklist.
- After the job is created successfully, the user returns to the **same in-progress maintenance checklist** at the same logical position (not the generic jobs list).
- Smooth switching: predictable URLs, minimal surprise on back/forward where possible.

**Non-Goals:**

- Redesigning the entire checklist domain model (reuse existing sector/component/session concepts where they already fit).
- Offline-first or native mobile apps.
- Auth/role changes (assume existing app access).

## Decisions

1. **Where “location” and “sub-location” bind to data**  
   - **Decision**: Map UI “location” to the checklist catalog’s sector (or parent) and “sub-location” to a child grouping—either a named sub-sector, room list, or component group—using existing `listCatalog` / sector structure. If the catalog is flat per sector, sub-location is a second step (e.g., room tags or component clusters) driven from the same API.  
   - **Alternatives**: Hard-coded location lists in the client (rejected: duplicates catalog). Single dropdown for everything (rejected: poor fit for “walk the building”).

2. **Persisting in-progress checklist state**  
   - **Decision**: Prefer an **inspection session** persisted via existing `POST /api/checklist/sessions` once the user confirms location/sub-location, so “resume” survives refresh. Client state (nuqs or URL) holds **session id + step** for deep links.  
   - **Alternatives**: sessionStorage-only (acceptable as MVP fallback if session API is not wired to the new UI yet—document follow-up). Pure URL state without server session (rejected for long checklists).

3. **Handoff to Add job**  
   - **Decision**: Navigate to `/jobs/new` with **search params** (and optional `sessionStorage` mirror): `location`, `subLocation`, optional `observationContext` or `titleHint`, and `returnTo` (percent-encoded **same-origin relative path** back to the maintenance checklist, e.g. `/maintenance/check?sessionId=...&step=...`).  
   - **Alternatives**: POST redirect (rejected: unnecessary for SPA). Open job modal on same page (deferred: larger change; keep navigation-based flow first).

4. **Return after job creation**  
   - **Decision**: `CreateJobForm` on success uses `returnTo` if present and **validates** it is a same-origin relative path; otherwise keeps current behavior (`router.push("/jobs")`). Show a short success toast before navigation.  
   - **Alternatives**: Always return to maintenance (rejected: breaks non-maintenance entry to `/jobs/new`).

5. **UX for “Report issue”**  
   - **Decision**: Primary button label e.g. “Log corrective job” near the failing item; secondary link “Continue checklist” remains visible after return.  
   - **Alternatives**: Only global FAB (rejected: too far from context).

## Risks / Trade-offs

- **[Risk] Open redirect / unsafe `returnTo`** → **Mitigation**: Accept only paths starting with `/` and matching the app origin; reject `//evil.com`.  
- **[Risk] URL length limits** → **Mitigation**: Prefer `sessionId` in `returnTo` over huge state blobs; store bulky state server-side or in session storage.  
- **[Risk] Stale session after long time on job form** → **Mitigation**: On return, if session missing, show message and offer “Start new inspection” or link to catalog.

## Migration Plan

- Ship UI + query-param contract first; no DB migration required if reusing existing session and job tables.  
- If a new route is added (`/maintenance/check`), add it to navigation from the dashboard.  
- **Rollback**: Feature flag or revert route + form changes; default `returnTo` absent preserves old redirect to `/jobs`.

## Open Questions

- Exact mapping of “sub-location” to Prisma/catalog fields if the catalog is only one-level sectors (may need a small catalog extension or naming convention).  
- Whether failed checklist items should auto-link the new job to `sourceObservationId` when the session already recorded an observation (reuse `createJobFromObservation` path if present).
