## Context

The app now includes Team Members listing and team-member API primitives, but operational workflows still require API-level calls for creating members and assigning skills. This change adds user-facing forms and a dedicated assignment page while reusing existing skill catalog data as assignment inputs.

## Goals / Non-Goals

**Goals:**
- Add `Add New Team Member` button and creation form to Team Members page.
- Add a dedicated page where user selects a team member and assigns existing skills.
- Ensure assignments are persisted and visible in team-member listings.

**Non-Goals:**
- Bulk import/edit of team members.
- New skill catalog authoring on assignment page (existing skills only).
- Complex permission model for assignment actions.

## Decisions

1. **Inline create form launched from Team Members page action**
- Decision: expose `Add New Team Member` button and show an in-page form/modal for create flow.
- Rationale: keeps create action close to list context and reduces navigation friction.
- Alternative considered: separate standalone create page. Rejected for extra navigation overhead.

2. **Dedicated assignment route for focused workflow**
- Decision: add `/team-members/assign-skills` route with selection UI.
- Rationale: assignment has multi-step interaction (pick member + pick existing skills + set percentages) and deserves dedicated space.
- Alternative considered: embed assignment in each list row. Rejected for visual complexity.

3. **Reuse existing skills catalog as assignment source**
- Decision: assignment options come from existing Skill catalog records only.
- Rationale: avoids duplicate skill definitions and keeps canonical naming/ids.
- Alternative considered: free-form skill entry in assignment page. Rejected to prevent drift.

4. **Persist assignments as replacement upsert for selected member**
- Decision: submit selected set of skills for a member and replace member skill list atomically.
- Rationale: simpler state model and deterministic outcomes.
- Alternative considered: incremental add/remove operations. Rejected for higher UI/API complexity in this iteration.

## Risks / Trade-offs

- **[Risk] User confusion between global skills and team-member skill entries** -> **Mitigation:** clarify labels (`Existing Skills`) and show member-level percentages explicitly.
- **[Risk] Accidental overwrite of member skills during reassignment** -> **Mitigation:** show current assignments before save and confirm submit action.
- **[Risk] Empty-state dead end if no global skills exist** -> **Mitigation:** render clear message and link users to create skills first.
