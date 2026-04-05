## Context

The jobs directory uses `JobsDirectory` + `DataTableComponent` + `GET /api/jobs`. Inspection sessions are stored via Prisma (or memory repo) with `GET /api/checklist/sessions/[sessionId]` for a single session, but **no list endpoint** exists yet.

## Goals / Non-Goals

**Goals:**

- Parity of **information hierarchy** with the jobs page: hero card, card-wrapped table, similar column density and badges where status applies.
- **Accessible dialog**: focus trap or native dialog semantics, ESC to close, click-outside or explicit Close, `aria-modal` / `role="dialog"` as implemented.
- **Efficient list payload**: table rows show summary fields only; dialog loads **full session** via existing `GET .../sessions/[id]` (or inlined if list already returns enough—prefer single detail fetch to keep list light).

**Non-Goals:**

- Editing observations from the directory (read-only v1).
- Full-text search and advanced filters (can be follow-up).
- Replacing the live `/maintenance/check` flow.

## Decisions

1. **List API**  
   - **Decision**: Add `GET /api/checklist/sessions` guarded by `assertChecklistEnabled()`, returning `{ sessions: Array<{ id, inspector, inspectedAt, finalizedAt, observationCount, failCount }> }` (exact fields tuned to UI).  
   - **Alternatives**: GraphQL or server components only—rejected to match existing REST + client fetch pattern used by jobs.

2. **Repository**  
   - **Decision**: `listInspectionSessions()` on repository with Prisma `findMany` ordered by `inspectedAt desc`; memory implementation iterates `memoryStore.sessions`.  
   - **Alternatives**: Raw SQL—unnecessary for v1.

3. **Dialog implementation**  
   - **Decision**: Use **native `<dialog>`** with `showModal()` / `close()` and minimal CSS (backdrop, max-width, scroll body) to avoid new dependencies (no Radix in repo today).  
   - **Alternatives**: Install `@radix-ui/react-dialog`—defer unless a11y gaps appear in review.

4. **Row selection**  
   - **Decision**: Entire row click (or explicit “View” control) sets `selectedSessionId`, fetches detail if not cached, opens dialog.  
   - **Alternatives**: Navigate to `/maintenance/checks/[id]`—user asked explicitly for **dialog**.

5. **DataTable reuse**  
   - **Decision**: Reuse `DataTableComponent` with columns for inspector, inspected at, status (Finalized / In progress), observation counts; hook `onRowClick` if the component supports it, or wrap rows in clickable handlers without breaking table semantics.

## Risks / Trade-offs

- **[Risk] Large session payloads in list** → **Mitigation**: keep list DTO small; detail in dialog via GET by id.  
- **[Risk] DataTable row click vs sort controls** → **Mitigation**: use a dedicated View button column if click conflicts with DataTables behavior.  
- **[Risk] Memory repo empty in some deploys** → **Mitigation**: show empty state consistent with jobs page.

## Migration Plan

- Deploy API + UI together; no schema migration if `InspectionSession` already exists.  
- **Rollback**: remove route and nav link; API can remain unused.

## Open Questions

- Whether to show **sector breakdown** in the list row (e.g. distinct sectors touched) or only in the dialog.  
- Default sort: `inspectedAt` vs `createdAt` (prefer `inspectedAt` for “when the walk happened”).
