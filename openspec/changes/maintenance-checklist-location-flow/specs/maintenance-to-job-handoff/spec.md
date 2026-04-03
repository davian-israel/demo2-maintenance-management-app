## ADDED Requirements

### Requirement: Navigation from maintenance to Add job MUST carry location context
The system SHALL navigate from the maintenance checklist to the add-job experience with `location` and `subLocation` (and optional checklist-derived hints) prefilled from the user’s current scope.

#### Scenario: Prefilled job form
- **WHEN** the user invokes the control to create a job from the maintenance checklist
- **THEN** the add-job form opens with location fields populated from the current maintenance context

### Requirement: Add job MUST support a safe return path to maintenance
The add-job route SHALL accept a return target that sends the user back to the maintenance checklist after a successful job creation.

#### Scenario: Successful job returns to checklist
- **WHEN** the user submits a valid new job and a valid maintenance return target was provided
- **THEN** the application navigates to that maintenance checklist URL instead of the default jobs list

#### Scenario: No return target preserves default behavior
- **WHEN** the user creates a job without a maintenance return target
- **THEN** the application follows the existing post-create navigation (for example to the jobs list)

### Requirement: Return target MUST be validated
The system SHALL NOT redirect to arbitrary external URLs from the return parameter. Only same-application relative paths SHALL be honored.

#### Scenario: Reject external redirect
- **WHEN** the return parameter points off-site or uses a disallowed scheme
- **THEN** the system ignores it and applies the default post-create behavior

### Requirement: User MUST be able to continue the checklist smoothly after return
After returning from job creation, the maintenance UI SHALL present the checklist in a continuation state without forcing the user to re-select location and sub-location unless the session is invalid or expired.

#### Scenario: Continuation without redundant steps
- **WHEN** the user returns from a successful job creation with a valid inspection session
- **THEN** the user remains in the same inspection context and may continue the checklist
