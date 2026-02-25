## Context

The current app focuses on checklist and job lifecycle behavior but job records are light on operational metadata. Users need to know exact work area (`location` and `subLocation`) and accountability (`doneBy`, `checkedBy`) without relying on free-text notes. The current home dashboard also mixes multiple concerns, making all-job review less efficient than a dedicated index page.

## Goals / Non-Goals

**Goals:**
- Add structured job metadata fields end-to-end (domain -> DB -> API -> UI).
- Provide a dedicated jobs index page showing all jobs and new metadata.
- Add a reusable sidebar navigation layout including a Jobs menu item.

**Non-Goals:**
- Full role-based authorization for done/check users.
- Replacing existing dashboard workflows.
- Implementing advanced filtering/sorting beyond basic list view in this change.

## Decisions

1. **Use explicit fields on Job model**
- Decision: Store `location`, `subLocation`, `doneBy`, and `checkedBy` as first-class nullable strings on Job.
- Rationale: Structured fields enable reporting/search and avoid parsing notes.
- Alternative considered: embed in description/comments. Rejected due to weak queryability.

2. **Treat accountability fields as metadata, not lifecycle gates**
- Decision: `doneBy` and `checkedBy` are captured but not required for all status transitions.
- Rationale: Keeps existing workflow compatible while improving data capture.
- Alternative considered: force `doneBy` on completion. Rejected for backward compatibility in this step.

3. **Introduce sidebar layout at app shell level**
- Decision: Wrap app content in a sidebar layout with links (`Dashboard`, `Jobs`).
- Rationale: Navigation must be persistent and discoverable.
- Alternative considered: top nav only. Rejected to match requested side-menu interaction.

4. **Create separate jobs page route**
- Decision: Add `/jobs` route with consolidated list view.
- Rationale: Keeps dashboard focused and provides dedicated listing surface.
- Alternative considered: only expand existing dashboard. Rejected due to clutter and weaker IA.

## Risks / Trade-offs

- **[Risk] Inconsistent metadata population on old jobs** -> **Mitigation:** nullable fields + UI defaults for missing values.
- **[Risk] Contract drift between old/new job forms** -> **Mitigation:** centralize schema validation and shared job type.
- **[Risk] Navigation regression** -> **Mitigation:** e2e coverage for sidebar link and page rendering.
