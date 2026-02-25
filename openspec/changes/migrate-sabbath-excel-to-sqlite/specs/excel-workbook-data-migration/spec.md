## ADDED Requirements

### Requirement: System SHALL import data only from the specified workbook file
The migration flow SHALL read source data only from `/Users/davian/Desktop/projects/maintenance-israel/WIP - Maintenance Sabbath Check.xlsx`.

#### Scenario: Run import command
- **WHEN** the import command executes
- **THEN** it loads data from the specified workbook path and no other source

### Requirement: Import flow SHALL map workbook rows into application entities
The migration flow SHALL parse relevant sheets and persist mapped records into application database entities.

#### Scenario: Import workbook sheets
- **WHEN** the workbook contains valid rows for supported sheets
- **THEN** mapped records are inserted or upserted into corresponding database tables

### Requirement: Import flow SHALL validate source rows and report failures
The migration flow SHALL validate required fields and reject malformed rows with explicit errors.

#### Scenario: Invalid row encountered
- **WHEN** a row is missing required data or has invalid type
- **THEN** the import reports the row-level error and does not silently accept invalid data

### Requirement: Import flow SHALL be idempotent for re-runs
The migration flow SHALL avoid duplicate logical records when re-importing the same workbook.

#### Scenario: Re-run import with unchanged workbook
- **WHEN** the same workbook is imported multiple times
- **THEN** existing records are updated/upserted and duplicates are not created
