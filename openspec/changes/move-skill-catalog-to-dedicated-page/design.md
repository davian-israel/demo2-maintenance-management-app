## Context

The current dashboard renders skill management alongside job and checklist sections. As functionality expanded (jobs page, team-members pages), this inline placement became inconsistent with the app’s navigational model where dedicated domains use dedicated routes.

## Goals / Non-Goals

**Goals:**
- Move Skill Catalog UI to a dedicated page.
- Add sidebar access to Skill Catalog with route-based active state.
- Remove Skill Catalog section from dashboard while preserving backend contracts.

**Non-Goals:**
- Changing skill domain model or API contracts.
- Adding advanced skill filtering, editing, or archival UX in this change.
- Altering job-required-skill behavior.

## Decisions

1. **Create standalone route for skills**
- Decision: Add a dedicated `/skills` page for catalog management.
- Rationale: aligns with existing route-first organization for jobs/team members.
- Alternative considered: modal launched from dashboard. Rejected due to discoverability and dashboard clutter.

2. **Keep skill API contracts unchanged**
- Decision: Reuse existing `GET/POST /api/skills` behavior.
- Rationale: change is UI placement, not domain behavior.
- Alternative considered: new skills endpoint. Rejected as unnecessary duplication.

3. **Add sidebar navigation entry**
- Decision: add `Skill Catalog` link in persistent sidebar.
- Rationale: keeps all domain modules equally navigable.
- Alternative considered: top-nav only link. Rejected for inconsistency with current layout.

4. **Remove dashboard skill card**
- Decision: eliminate skill form/list section from dashboard.
- Rationale: avoids duplicate management surfaces and ambiguity.
- Alternative considered: keep read-only skill summary card on dashboard. Deferred.

## Risks / Trade-offs

- **[Risk] Users lose quick skill access from dashboard** -> **Mitigation:** prominent sidebar link with active state.
- **[Risk] Regression in skill-create flow** -> **Mitigation:** preserve same form logic and add route-level e2e tests.
- **[Risk] Broken references to removed dashboard component** -> **Mitigation:** clean imports and run lint/build/tests.

## Migration Plan

1. Create `/skills` page and move skill-management UI.
2. Update sidebar links and active-state handling.
3. Remove dashboard skill section and related state.
4. Update tests and verify end-to-end behavior.

Rollback: restore dashboard skill section and remove `/skills` route if needed.

## Open Questions

- Should dashboard keep a compact read-only skill count summary after migration?
