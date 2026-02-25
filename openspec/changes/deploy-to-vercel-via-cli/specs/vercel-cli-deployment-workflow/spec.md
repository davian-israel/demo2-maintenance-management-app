## ADDED Requirements

### Requirement: System SHALL provide Vercel CLI deployment commands
The system SHALL provide runnable project commands that deploy the application with Vercel CLI.

#### Scenario: Run preview deploy command
- **WHEN** a user executes the preview deploy command
- **THEN** the command runs `vercel deploy -y` for the project and returns deployment status/output

### Requirement: Preview deploy SHALL be default deployment path
The deployment workflow SHALL treat preview deployments as default and MUST require a separate explicit command for production.

#### Scenario: User chooses standard deployment
- **WHEN** the user runs the standard deploy script
- **THEN** a preview deployment is created instead of production

#### Scenario: User chooses production deployment
- **WHEN** the user runs the explicit production deploy script
- **THEN** the workflow runs `vercel deploy --prod -y`

### Requirement: Deployment workflow SHALL return destination URL details
The deployment workflow SHALL print resulting deployment URL details so users can access the deployed app.

#### Scenario: Deployment command succeeds
- **WHEN** deployment completes successfully
- **THEN** the command output includes the resulting Vercel deployment URL
