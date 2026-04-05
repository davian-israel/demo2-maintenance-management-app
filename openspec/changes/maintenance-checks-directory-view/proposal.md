## Why

Technicians and supervisors need a single place to review **past and in-progress maintenance inspections** (checklist sessions) without opening each job or the live checklist flow. Today sessions exist in the backend but there is no directory view comparable to **All Maintenance Jobs**, so discovery and audit of checks is harder than it should be.

## What Changes

- Add a **maintenance checks directory** route that lists every inspection session in a **table/list presentation aligned with the jobs directory** (same general layout, typography, and `DataTable`-style affordances where applicable).
- Add **sidebar navigation** entry pointing to this page.
- When the user **selects a row**, open a **dialog** (modal overlay) showing **maintenance check details** for that session (inspector, dates, finalized state, observation summary or full observation list, and clear close/focus behavior).
- Expose a **read API** (or extend existing checklist routes) so the UI can **list sessions** and reuse **GET session by id** for dialog payload details.

## Capabilities

### New Capabilities

- `maintenance-checks-directory`: Directory page, session list data contract, sidebar link, and row interaction that opens a detail dialog for the selected maintenance check.

### Modified Capabilities

- None (`openspec/specs/` has no baseline specs in this repository).

## Impact

- **API**: New `GET /api/checklist/sessions` (or equivalent) returning a stable list shape; optional query params for pagination/sort later.
- **Persistence**: `ChecklistRepository` / `ChecklistService` gain `listInspectionSessions` (ordered, minimal fields for table + id for detail fetch).
- **UI**: New page component, dialog component (native `<dialog>` or lightweight modal matching existing CSS), `AppShell` nav item.
- **Tests**: Playwright for navigation + row click opens dialog; API/unit tests as appropriate.
