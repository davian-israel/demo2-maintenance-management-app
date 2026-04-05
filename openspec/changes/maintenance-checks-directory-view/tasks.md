## 1. Backend list API

- [x] 1.1 Add `listInspectionSessions` to `ChecklistRepository` with Prisma and memory implementations (summary fields + ordering)
- [x] 1.2 Add `ChecklistService` method and `GET /api/checklist/sessions` route with `assertChecklistEnabled` and consistent JSON shape

## 2. Directory UI

- [x] 2.1 Create `/maintenance/checks` (or agreed path) page and client directory component modeled on `JobsDirectory` + `DataTableComponent`
- [x] 2.2 Implement columns: inspector, inspected date/time, finalized status, observation counts (and optional fail count)
- [x] 2.3 Add sidebar nav item in `AppShell` to the new route

## 3. Detail dialog

- [x] 3.1 Implement dialog (native `<dialog>` or equivalent) with fetch of `GET /api/checklist/sessions/[sessionId]` on open
- [x] 3.2 Render session header + observations table/list; loading and error states inside dialog
- [x] 3.3 Wire row click or "View" action; ensure keyboard dismissal and focus management

## 4. Tests

- [x] 4.1 Add Playwright: navigate from sidebar → list visible → open dialog for a row (seed or create session via API in test)
- [x] 4.2 Add API or repository test for list endpoint shape if project patterns support it
