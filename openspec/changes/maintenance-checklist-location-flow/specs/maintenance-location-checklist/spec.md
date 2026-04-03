## ADDED Requirements

### Requirement: User MUST select a location before viewing sub-locations
The maintenance checklist flow SHALL require the user to choose a parent location first. Sub-locations SHALL only be listed or enabled after a location is selected.

#### Scenario: Location-first gate
- **WHEN** the user opens the maintenance checklist screen
- **THEN** the UI presents location selection and does not show sub-location-specific checklist content until a location is chosen

#### Scenario: Sub-locations appear after location
- **WHEN** the user selects a location
- **THEN** the UI presents the available sub-locations for that location and allows the user to proceed

### Requirement: Checklist MUST be scoped to the selected location and sub-location
The system SHALL scope displayed checklist items to the current location and sub-location so the user inspects the correct physical area.

#### Scenario: Scoped items
- **WHEN** the user has selected both a location and a sub-location
- **THEN** the UI shows only checklist items applicable to that scope

### Requirement: In-progress inspection MUST be recoverable across navigation
The system SHALL preserve checklist progress so the user can leave the screen (for example to create a job) and continue the same inspection when returning.

#### Scenario: Resume after return from job creation
- **WHEN** the user completes a corrective job flow and returns via the defined return path
- **THEN** the checklist restores the prior progress for that inspection session

### Requirement: Maintenance screen MUST expose issue reporting in context
While viewing a checklist item or sub-location, the UI SHALL make it obvious how to log an issue that may require a job (for example a primary action tied to the current item).

#### Scenario: Action visible during inspection
- **WHEN** the user is viewing the checklist for a selected location and sub-location
- **THEN** the UI exposes a clear control to proceed to job creation from the maintenance context
