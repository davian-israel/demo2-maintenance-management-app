## Why

Technicians need a guided maintenance inspection that mirrors the physical site: pick a building or area first, then walk sub-locations in order. When something fails, they must log a corrective job without losing their place in the checklist. Today, jumping to “add job” risks dropping context and forcing manual navigation back; we need a single smooth loop so inspection and job creation feel like one workflow.

## What Changes

- Add a **location-first maintenance path**: user selects a parent location, then drills into sub-locations and completes checklist items in that context.
- Add a **handoff from maintenance to “add new job”** when an issue is found: one clear action opens the job form with location/sub-location (and optional checklist context) prefilled.
- Add a **return-to-checklist** experience after the job is saved: user lands back on the same maintenance session at the same progress point (not dumped on the generic jobs list).
- Preserve **browser back** and **direct URLs** where possible so switching between screens is predictable (e.g., query params or session storage for “resume token,” documented in design).

## Capabilities

### New Capabilities

- `maintenance-location-checklist`: Defines the UX and data needs for choosing a location, then sub-locations, and progressing through the maintenance checklist in that hierarchy.
- `maintenance-to-job-handoff`: Defines navigation from the maintenance screen to the add-job flow with prefilled context, and return to the in-progress checklist after job completion.

### Modified Capabilities

- None (no baseline specs exist under `openspec/specs/` today).

## Impact

- **UI**: Maintenance route(s), checklist components, add-job page (or wrapper) to accept resume/context parameters.
- **Routing/state**: URL search params, session storage, or a lightweight server-side “inspection draft” if required—design will pick the minimal approach.
- **Jobs API / form**: Optional query or POST fields for `returnTo` / `maintenanceSessionId` / prefill; existing `location` and `subLocation` on jobs align with prefill.
- **Tests**: Playwright flows for select location → sub-location → report issue → create job → resume checklist.
