## Why

The team-members dataset currently depends on manual creation or workbook import state, which is not reliable for repeatable local/demo environments. A deterministic seed for a fixed baseline roster is needed so operators can re-run seeding at any time and recover expected members without duplicates.

## What Changes

- Add a dedicated baseline seed source containing the requested team-member roster.
- Add a repeatable seed command that upserts baseline team members into the database.
- Ensure seed behavior is idempotent (safe to run multiple times without duplicate members).
- Ensure seed behavior is non-destructive for unrelated team members already in the database.
- Add verification coverage for repeated seed runs and baseline roster presence.

## Capabilities

### New Capabilities
- `team-member-baseline-seeding`: Define a deterministic, repeatable seed workflow for baseline team members.

### Modified Capabilities
- None.

## Impact

- Seeding/scripts: new seed source file and executable seed script.
- Application/persistence: team-member upsert flow for baseline seed command.
- Developer workflow: new npm script for repeatable team-member seed execution.
- Testing: add or adjust automated checks for idempotent seeding behavior.
