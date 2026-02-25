## Why

The app currently tracks jobs and job-level skills but does not model individual team members and their proficiency by skill. A dedicated Team Members view is needed so operators can quickly see who has which skills and coverage levels.

## What Changes

- Introduce a `TeamMember` class/model with `teamMemberId` and `name`.
- Introduce a `Skill` class/model with `skillId`, `name`, and `skillPercentage`.
- Define a relationship where one team member owns a list of skills.
- Add persistence and API support to create/read team members with nested skills.
- Add a new `/team-members` page that lists team members and their skills.
- Add `Team Members` to the persistent sidebar navigation menu.

## Capabilities

### New Capabilities
- `team-member-skill-model`: Defines TeamMember and Skill structures plus one-to-many relationship semantics.
- `team-members-directory-view`: Adds a dedicated page to list team members and their skills.
- `sidebar-navigation-team-members-link`: Adds a sidebar navigation entry that routes to Team Members page.

### Modified Capabilities
- None.

## Impact

- Domain/application layers: new TeamMember and Skill models and related services.
- Persistence: new Prisma models/tables and repository mappings for member-skill relationship.
- API contracts: Zod schemas and endpoints for team member list/create payloads.
- Frontend: new route/page and sidebar menu extension.
- Tests: Playwright/API assertions for rendering and navigation.
