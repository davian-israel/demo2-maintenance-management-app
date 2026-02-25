## Why

The dashboard currently mixes multiple workflows and includes Skill Catalog management inline, which reduces focus and makes the dashboard crowded. Moving Skill Catalog to a dedicated page improves navigation clarity and separates concerns.

## What Changes

- Add a dedicated Skill Catalog page for viewing and creating skills.
- Add a `Skill Catalog` entry in the sidebar navigation.
- Remove the Skill Catalog component/section from the dashboard page.
- Keep existing skill APIs and behavior unchanged; only UI placement and navigation change.

## Capabilities

### New Capabilities
- `skill-catalog-dedicated-page`: Provides a standalone page for skill catalog management.
- `sidebar-navigation-skill-catalog-link`: Adds sidebar navigation to the new Skill Catalog page.

### Modified Capabilities
- `dashboard-skill-catalog-placement`: Removes skill catalog UI from dashboard layout.

## Impact

- Frontend routing: new page route for Skill Catalog.
- Navigation: sidebar menu updates and active-state behavior.
- Dashboard UI: card/component removal and layout adjustments.
- Tests: update/add e2e assertions for new route and dashboard absence checks.
