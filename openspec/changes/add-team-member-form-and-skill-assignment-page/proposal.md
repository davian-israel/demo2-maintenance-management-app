## Why

The current Team Members screen is read-only and does not provide an in-app workflow to create members or assign skills after creation. Users need a guided UI flow to add new team members and manage skill assignments using existing skills.

## What Changes

- Add an `Add New Team Member` button on Team Members page.
- Add an Add Team Member form that captures team member identity fields and creates a member from the UI.
- Add a separate `Assign Skills` page dedicated to assigning existing skills to a selected team member.
- On Assign Skills page, allow selecting one team member from the list and assigning one or more existing skills.
- Persist skill assignments and reflect updates in Team Members list views.

## Capabilities

### New Capabilities
- `team-member-create-form`: Adds UI affordance and form workflow to create team members from the Team Members page.
- `team-member-skill-assignment-page`: Adds a dedicated page to select a team member and assign existing skills.

### Modified Capabilities
- None.

## Impact

- Frontend pages/components for Team Members and new assignment route.
- API contracts and endpoints for team-member create and skill-assignment actions.
- Team-member application service/repository write flows for assignment updates.
- Playwright coverage for create and assign workflows.
