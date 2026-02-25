## ADDED Requirements

### Requirement: Env files SHALL define required SQLite runtime variables
The project SHALL define required env variables in env files for SQLite runtime configuration.

#### Scenario: Configure local runtime
- **WHEN** user sets env files from provided examples
- **THEN** app can connect to SQLite using declared variables

### Requirement: Env files SHALL define required workbook import path variable
The project SHALL define an env variable for workbook source path used by import command.

#### Scenario: Configure import source path
- **WHEN** user executes import command
- **THEN** command reads workbook path from env configuration

### Requirement: Example env templates SHALL document required variables
`.env.example` and other tracked env templates SHALL include descriptions for required variables.

#### Scenario: New developer setup
- **WHEN** a developer opens env example files
- **THEN** they can identify mandatory SQLite and import-path variables needed to run app + migration
