## 1. Seed Source and Script

- [x] 1.1 Add a baseline team-member seed source file containing the requested roster
- [x] 1.2 Implement a runnable seed script that upserts baseline team members by deterministic IDs
- [x] 1.3 Enforce collision checks and explicit error reporting for invalid/duplicate seed IDs

## 2. Developer Workflow Integration

- [x] 2.1 Add npm script entry for repeatable team-member seeding
- [x] 2.2 Document the seed command behavior as idempotent and non-destructive

## 3. Verification

- [x] 3.1 Add tests for baseline roster presence after seed run
- [x] 3.2 Add tests ensuring repeated seed runs do not create duplicates
- [x] 3.3 Verify seed command works with SQLite-backed runtime configuration
