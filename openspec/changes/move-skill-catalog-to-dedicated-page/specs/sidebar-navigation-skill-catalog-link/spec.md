## ADDED Requirements

### Requirement: Sidebar SHALL include Skill Catalog navigation link
The persistent sidebar navigation SHALL include a `Skill Catalog` link that routes to the dedicated skill page.

#### Scenario: Navigate via sidebar link
- **WHEN** a user clicks `Skill Catalog` in sidebar
- **THEN** the application routes to the Skill Catalog page

### Requirement: Sidebar SHALL indicate active Skill Catalog route
The sidebar SHALL visually indicate when the Skill Catalog route is active.

#### Scenario: Skill Catalog route is active
- **WHEN** current route is Skill Catalog page
- **THEN** the `Skill Catalog` sidebar item displays active-state styling
